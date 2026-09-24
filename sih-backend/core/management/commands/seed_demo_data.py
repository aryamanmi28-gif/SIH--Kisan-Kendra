"""
Seed demo data for PS 26032 (Farmer Procurement System).

Run with: python manage.py seed_demo_data

Safe to re-run: it clears its own previously-seeded rows (identified by the
DEMO- centre code prefix and 7000000xxx farmer phone prefix) before creating
fresh ones. It never touches real/non-seed data.

Test farmer login credentials (all share the same password), via POST /api/auth/login/:
    Password: Demo@1234
    Phones:   7000000001 .. 7000000070

Test officer login credentials, via POST /api/auth/officer-login/ (username + password):
    Username: officer1
    Password: Officer@1234

"Today" is seeded with realistic queue depth (~15 bookings/centre, ~5 per
slot) so the live demo has something to check in against. Other days in the
14-day window get lighter, un-simulated booking density -- they just need to
be bookable, not full of queue state.
"""

import random
from datetime import date, datetime, time as dtime, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from core.models import Booking, Farmer, Procurement, ProcurementCentre, QueueEntry, Slot

User = get_user_model()

DEMO_PASSWORD = 'Demo@1234'
PHONE_PREFIX = '70000000'

OFFICER_USERNAME = 'officer1'
OFFICER_PASSWORD = 'Officer@1234'

WHEAT = 'Wheat'
PADDY = 'Paddy'

# MSP rates used for seeded Procurement records:
#   Wheat (RMS 2025-26): Rs 2585/quintal = Rs 25.85/kg (per user-provided figure).
#   Paddy, Common grade (KMS 2025-26): Rs 2369/quintal = Rs 23.69/kg
#   (CCEA-approved Kharif MSP hike, May 2025).
RATE_PER_KG = {WHEAT: Decimal('25.85'), PADDY: Decimal('23.69')}

QUANTITY_CHOICES_KG = [
    Decimal('1200.00'), Decimal('1500.00'), Decimal('1800.00'), Decimal('2100.00'),
    Decimal('2400.00'), Decimal('2800.00'), Decimal('3200.00'),
]

CENTRES = [
    dict(code='DEMO-WHT-PB01', crop=WHEAT, name='Ludhiana Grain Procurement Centre — Demo', district='Ludhiana', state='Punjab'),
    dict(code='DEMO-WHT-PB02', crop=WHEAT, name='Amritsar Grain Procurement Centre — Demo', district='Amritsar', state='Punjab'),
    dict(code='DEMO-WHT-MP01', crop=WHEAT, name='Indore Grain Procurement Centre — Demo', district='Indore', state='Madhya Pradesh'),
    dict(code='DEMO-WHT-MP02', crop=WHEAT, name='Ujjain Grain Procurement Centre — Demo', district='Ujjain', state='Madhya Pradesh'),
    dict(code='DEMO-WHT-RJ01', crop=WHEAT, name='Kota Grain Procurement Centre — Demo', district='Kota', state='Rajasthan'),
    dict(code='DEMO-WHT-HR01', crop=WHEAT, name='Karnal Grain Procurement Centre — Demo', district='Karnal', state='Haryana'),
    dict(code='DEMO-PDY-PB01', crop=PADDY, name='Patiala Grain Procurement Centre — Demo', district='Patiala', state='Punjab'),
    dict(code='DEMO-PDY-PB02', crop=PADDY, name='Bathinda Grain Procurement Centre — Demo', district='Bathinda', state='Punjab'),
    dict(code='DEMO-PDY-HR01', crop=PADDY, name='Kurukshetra Grain Procurement Centre — Demo', district='Kurukshetra', state='Haryana'),
    dict(code='DEMO-PDY-CG01', crop=PADDY, name='Raipur Grain Procurement Centre — Demo', district='Raipur', state='Chhattisgarh'),
    dict(code='DEMO-PDY-AP01', crop=PADDY, name='Guntur Grain Procurement Centre — Demo', district='Guntur', state='Andhra Pradesh'),
    dict(code='DEMO-PDY-WB01', crop=PADDY, name='Bardhaman Grain Procurement Centre — Demo', district='Purba Bardhaman', state='West Bengal'),
]

# Demo centre highlighted in the summary output for the live check-in walkthrough.
DEMO_HIGHLIGHT_CENTRE_CODE = 'DEMO-WHT-PB01'

FARMERS = [
    # Punjab
    dict(full_name='Ramesh Singh', village='Sultanpur', district='Ludhiana', state='Punjab'),
    dict(full_name='Gurpreet Kaur', village='Chheharta', district='Amritsar', state='Punjab'),
    dict(full_name='Kamla Devi', village='Sultanpur', district='Ludhiana', state='Punjab'),
    dict(full_name='Harpreet Singh', village='Sahnewal', district='Ludhiana', state='Punjab'),
    dict(full_name='Manjit Kaur', village='Ajnala', district='Amritsar', state='Punjab'),
    dict(full_name='Baldev Singh', village='Rajpura', district='Patiala', state='Punjab'),
    dict(full_name='Simran Kaur', village='Samana', district='Patiala', state='Punjab'),
    dict(full_name='Jagtar Singh', village='Rampura Phul', district='Bathinda', state='Punjab'),
    dict(full_name='Amarjeet Kaur', village='Talwandi Sabo', district='Bathinda', state='Punjab'),
    dict(full_name='Ranjit Singh', village='Chheharta', district='Amritsar', state='Punjab'),
    dict(full_name='Balwinder Kaur', village='Sahnewal', district='Ludhiana', state='Punjab'),
    dict(full_name='Jaswinder Singh', village='Mullanpur', district='Ludhiana', state='Punjab'),
    dict(full_name='Paramjit Kaur', village='Majitha', district='Amritsar', state='Punjab'),
    dict(full_name='Kuldeep Singh', village='Ajnala', district='Amritsar', state='Punjab'),
    dict(full_name='Sukhwinder Singh', village='Ghanaur', district='Patiala', state='Punjab'),
    dict(full_name='Rajwinder Kaur', village='Samana', district='Patiala', state='Punjab'),
    dict(full_name='Gurmail Singh', village='Talwandi Sabo', district='Bathinda', state='Punjab'),
    dict(full_name='Navjot Kaur', village='Rampura Phul', district='Bathinda', state='Punjab'),
    # Madhya Pradesh
    dict(full_name='Mohan Patel', village='Rajendra Nagar', district='Indore', state='Madhya Pradesh'),
    dict(full_name='Sunita Verma', village='Nagda', district='Ujjain', state='Madhya Pradesh'),
    dict(full_name='Suresh Yadav', village='Depalpur', district='Indore', state='Madhya Pradesh'),
    dict(full_name='Radha Bai', village='Mahidpur', district='Ujjain', state='Madhya Pradesh'),
    dict(full_name='Om Prakash Tiwari', village='Rajendra Nagar', district='Indore', state='Madhya Pradesh'),
    dict(full_name='Kavita Chouhan', village='Nagda', district='Ujjain', state='Madhya Pradesh'),
    dict(full_name='Ashok Malviya', village='Depalpur', district='Indore', state='Madhya Pradesh'),
    dict(full_name='Geeta Bai', village='Mahidpur', district='Ujjain', state='Madhya Pradesh'),
    dict(full_name='Rajendra Solanki', village='Rajendra Nagar', district='Indore', state='Madhya Pradesh'),
    dict(full_name='Manisha Patidar', village='Nagda', district='Ujjain', state='Madhya Pradesh'),
    # Rajasthan
    dict(full_name='Devi Lal', village='Ramganj Mandi', district='Kota', state='Rajasthan'),
    dict(full_name='Pooja Meena', village='Sangod', district='Kota', state='Rajasthan'),
    dict(full_name='Ram Kishore Sharma', village='Ramganj Mandi', district='Kota', state='Rajasthan'),
    dict(full_name='Lakshmi Rathore', village='Sangod', district='Kota', state='Rajasthan'),
    dict(full_name='Bhanwar Lal', village='Digod', district='Kota', state='Rajasthan'),
    dict(full_name='Shanti Devi', village='Itawa', district='Kota', state='Rajasthan'),
    dict(full_name='Mangi Lal Meena', village='Ramganj Mandi', district='Kota', state='Rajasthan'),
    dict(full_name='Kamla Bai', village='Sangod', district='Kota', state='Rajasthan'),
    # Haryana
    dict(full_name='Satbir Singh', village='Nilokheri', district='Karnal', state='Haryana'),
    dict(full_name='Rajesh Dahiya', village='Gharaunda', district='Karnal', state='Haryana'),
    dict(full_name='Sunita Hooda', village='Pehowa', district='Kurukshetra', state='Haryana'),
    dict(full_name='Vikram Malik', village='Thanesar', district='Kurukshetra', state='Haryana'),
    dict(full_name='Neelam Sharma', village='Nilokheri', district='Karnal', state='Haryana'),
    dict(full_name='Ajay Dalal', village='Pehowa', district='Kurukshetra', state='Haryana'),
    dict(full_name='Ramphal Dahiya', village='Gharaunda', district='Karnal', state='Haryana'),
    dict(full_name='Sushila Devi', village='Nilokheri', district='Karnal', state='Haryana'),
    dict(full_name='Baljeet Singh', village='Thanesar', district='Kurukshetra', state='Haryana'),
    dict(full_name='Pushpa Rani', village='Pehowa', district='Kurukshetra', state='Haryana'),
    # Chhattisgarh
    dict(full_name='Mahesh Sahu', village='Abhanpur', district='Raipur', state='Chhattisgarh'),
    dict(full_name='Kamla Yadav', village='Tilda', district='Raipur', state='Chhattisgarh'),
    dict(full_name='Ramkumar Verma', village='Abhanpur', district='Raipur', state='Chhattisgarh'),
    dict(full_name='Sushila Nag', village='Tilda', district='Raipur', state='Chhattisgarh'),
    dict(full_name='Dilip Sahu', village='Arang', district='Raipur', state='Chhattisgarh'),
    dict(full_name='Phoolbai Netam', village='Tilda', district='Raipur', state='Chhattisgarh'),
    dict(full_name='Girish Verma', village='Abhanpur', district='Raipur', state='Chhattisgarh'),
    dict(full_name='Kaushalya Sahu', village='Arang', district='Raipur', state='Chhattisgarh'),
    # Andhra Pradesh
    dict(full_name='Venkata Rao', village='Tenali', district='Guntur', state='Andhra Pradesh'),
    dict(full_name='Lakshmi Naidu', village='Narasaraopet', district='Guntur', state='Andhra Pradesh'),
    dict(full_name='Suresh Reddy', village='Tenali', district='Guntur', state='Andhra Pradesh'),
    dict(full_name='Padma Devi', village='Narasaraopet', district='Guntur', state='Andhra Pradesh'),
    dict(full_name='Subba Rao', village='Mangalagiri', district='Guntur', state='Andhra Pradesh'),
    dict(full_name='Vijaya Lakshmi', village='Narasaraopet', district='Guntur', state='Andhra Pradesh'),
    dict(full_name='Krishna Murthy', village='Tenali', district='Guntur', state='Andhra Pradesh'),
    dict(full_name='Anjali Devi', village='Mangalagiri', district='Guntur', state='Andhra Pradesh'),
    # West Bengal
    dict(full_name='Ashok Mondal', village='Kalna', district='Purba Bardhaman', state='West Bengal'),
    dict(full_name='Bijoya Das', village='Memari', district='Purba Bardhaman', state='West Bengal'),
    dict(full_name='Tapan Ghosh', village='Kalna', district='Purba Bardhaman', state='West Bengal'),
    dict(full_name='Rekha Roy', village='Memari', district='Purba Bardhaman', state='West Bengal'),
    dict(full_name='Subrata Mondal', village='Katwa', district='Purba Bardhaman', state='West Bengal'),
    dict(full_name='Anita Das', village='Memari', district='Purba Bardhaman', state='West Bengal'),
    dict(full_name='Bimal Ghosh', village='Kalna', district='Purba Bardhaman', state='West Bengal'),
    dict(full_name='Sandhya Roy', village='Katwa', district='Purba Bardhaman', state='West Bengal'),
]
for i, f in enumerate(FARMERS, start=1):
    f['phone'] = f'{PHONE_PREFIX}{i:02d}'

TIME_WINDOWS = [
    ('06:00', '08:00'),
    ('10:00', '12:00'),
    ('14:00', '16:00'),
]

# "Today" plus this many additional future days.
TOTAL_DAYS = 14


class Command(BaseCommand):
    help = 'Seed demo data for PS 26032 (centres, slots, farmers, bookings, queue state). Safe to re-run.'

    def handle(self, *args, **options):
        random.seed(42)
        self._ref_counter = 0
        with transaction.atomic():
            self._clear_existing()
            centres = self._create_centres()
            slots_by_centre = self._create_slots(centres)
            farmers = self._create_farmers()
            today_report = self._seed_today(centres, slots_by_centre, farmers)
            future_count = self._seed_future_days(centres, slots_by_centre, farmers)
            officer = self._create_officer()

        self._print_summary(centres, slots_by_centre, farmers, today_report, future_count, officer)

    # -- setup -----------------------------------------------------------

    def _clear_existing(self):
        self.stdout.write('Clearing existing demo data (DEMO- centres, 7000000xxx farmers, officer1)...')
        deleted_users, _ = User.objects.filter(username__startswith=PHONE_PREFIX).delete()
        deleted_centres, _ = ProcurementCentre.objects.filter(code__startswith='DEMO-').delete()
        deleted_officer, _ = User.objects.filter(username=OFFICER_USERNAME).delete()
        self.stdout.write(
            f'  Removed {deleted_users} user-linked row(s), {deleted_centres} centre-linked row(s), '
            f'{deleted_officer} officer row(s).'
        )

    def _create_centres(self):
        centres = []
        for c in CENTRES:
            centre = ProcurementCentre.objects.create(
                name=c['name'],
                code=c['code'],
                address=f"Mandi Road, {c['district']}",
                district=c['district'],
                state=c['state'],
                daily_capacity=random.randint(100, 300),
                contact_number=f'01{random.randint(100000000, 999999999)}',
                is_active=True,
                # num_counters left at its model default (2).
            )
            centre.crop = c['crop']  # not a model field; used only within this script
            centres.append(centre)
        return centres

    def _create_slots(self, centres):
        slots_by_centre = {}
        today = date.today()
        for centre in centres:
            centre_slots = []
            for day_offset in range(TOTAL_DAYS):
                slot_date = today + timedelta(days=day_offset)
                is_today = day_offset == 0
                for start_str, end_str in TIME_WINDOWS:
                    if is_today:
                        status = Slot.OPEN
                        capacity = random.randint(20, 30)
                    else:
                        roll = random.random()
                        if roll < 0.1:
                            status = Slot.CLOSED
                        elif roll < 0.2:
                            status = Slot.FULL
                        else:
                            status = Slot.OPEN
                        capacity = random.randint(15, 30)
                    slot = Slot.objects.create(
                        centre=centre, date=slot_date, start_time=start_str, end_time=end_str,
                        capacity=capacity, status=status,
                    )
                    centre_slots.append(slot)
            slots_by_centre[centre.code] = centre_slots
        return slots_by_centre

    def _create_farmers(self):
        farmers = []
        for f in FARMERS:
            user = User.objects.create_user(username=f['phone'], password=DEMO_PASSWORD)
            farmer = Farmer.objects.create(
                user=user, full_name=f['full_name'], phone_number=f['phone'],
                village=f['village'], district=f['district'], state=f['state'], is_verified=True,
            )
            farmers.append(farmer)
        return farmers

    def _create_officer(self):
        return User.objects.create_user(
            username=OFFICER_USERNAME, password=OFFICER_PASSWORD, is_staff=True, first_name='Demo Officer',
        )

    # -- helpers -----------------------------------------------------------

    def _next_reference_code(self):
        self._ref_counter += 1
        return f'DEMO-BK-{self._ref_counter:04d}'

    def _pick_farmers_for_centre(self, centre, farmers, count):
        """Prefer farmers from the centre's own state, top up from the wider pool."""
        local = [f for f in farmers if f.state == centre.state]
        random.shuffle(local)
        rest = [f for f in farmers if f.state != centre.state]
        random.shuffle(rest)
        pool = local + rest
        return pool[:count]

    def _at(self, on_date, hh, mm):
        return timezone.make_aware(datetime.combine(on_date, dtime(hh, mm)))

    def _make_booking(self, farmer, slot, status=Booking.BOOKED):
        return Booking.objects.create(
            farmer=farmer, slot=slot, reference_code=self._next_reference_code(),
            status=status, expected_quantity_kg=random.choice(QUANTITY_CHOICES_KG),
        )

    def _check_in(self, booking, token_number, checked_in_at, status, called_at=None, served_at=None):
        entry = QueueEntry.objects.create(
            booking=booking, token_number=token_number, status=status,
            called_at=called_at, served_at=served_at,
        )
        # checked_in_at is auto_now_add, so it must be corrected via a
        # separate UPDATE (bypasses pre_save, unlike a second .save() call).
        QueueEntry.objects.filter(pk=entry.pk).update(checked_in_at=checked_in_at)
        entry.checked_in_at = checked_in_at
        return entry

    def _record_procurement(self, booking, crop, served_at, payment_status):
        quantity_kg = random.choice(QUANTITY_CHOICES_KG)
        rate_per_kg = RATE_PER_KG[crop]
        Procurement.objects.create(
            booking=booking, commodity=crop, quantity_kg=quantity_kg, rate_per_kg=rate_per_kg,
            total_amount=quantity_kg * rate_per_kg, status=Procurement.COMPLETED,
            payment_status=payment_status, procured_at=served_at + timedelta(minutes=2),
        )
        booking.status = Booking.COMPLETED
        booking.save(update_fields=['status'])

    # -- today: realistic queue state -----------------------------------

    def _seed_today(self, centres, slots_by_centre, farmers):
        """
        Builds ~15 bookings/centre for today (5 per slot):
          Slot 0 (06:00-08:00, already wrapped up): 5x SERVED.
          Slot 1 (10:00-12:00, in progress):         2x SERVED, 1x SERVING, 1x CALLED, 1x WAITING.
          Slot 2 (14:00-16:00, not started yet):     2x WAITING (early check-ins), 3x BOOKED (demo candidates).
        """
        today = date.today()
        report = {}

        for centre in centres:
            slots = [s for s in slots_by_centre[centre.code] if s.date == today]
            slot0, slot1, slot2 = slots[0], slots[1], slots[2]
            picked = self._pick_farmers_for_centre(centre, farmers, 15)
            group0, group1, group2 = picked[0:5], picked[5:10], picked[10:15]

            token = 0
            waiting_examples = []

            # Slot 0: fully served, spaced ~15 min apart, ~8-15 min service each.
            checkin_times = [(5, 50), (6, 5), (6, 20), (6, 35), (6, 50)]
            for farmer, (hh, mm) in zip(group0, checkin_times):
                token += 1
                checked_in_at = self._at(today, hh, mm)
                called_at = checked_in_at + timedelta(minutes=random.randint(2, 6))
                served_at = called_at + timedelta(minutes=random.randint(8, 15))
                booking = self._make_booking(farmer, slot0)
                self._check_in(booking, token, checked_in_at, QueueEntry.SERVED, called_at, served_at)
                self._record_procurement(booking, centre.crop, served_at, Procurement.PAYMENT_PAID)

            # Slot 1: in progress right now.
            checkin_times = [(9, 45), (9, 55), (10, 5), (10, 15), (10, 25)]
            statuses = [QueueEntry.SERVED, QueueEntry.SERVED, QueueEntry.SERVING, QueueEntry.CALLED, QueueEntry.WAITING]
            for farmer, (hh, mm), status in zip(group1, checkin_times, statuses):
                token += 1
                checked_in_at = self._at(today, hh, mm)
                booking = self._make_booking(farmer, slot1)
                called_at = served_at = None
                if status in (QueueEntry.SERVED, QueueEntry.SERVING, QueueEntry.CALLED):
                    called_at = checked_in_at + timedelta(minutes=random.randint(2, 6))
                if status == QueueEntry.SERVED:
                    served_at = called_at + timedelta(minutes=random.randint(8, 15))
                entry = self._check_in(booking, token, checked_in_at, status, called_at, served_at)
                if status == QueueEntry.SERVED:
                    self._record_procurement(booking, centre.crop, served_at, Procurement.PAYMENT_PENDING)
                elif status == QueueEntry.WAITING:
                    waiting_examples.append(entry)

            # Slot 2: 2 early check-ins (still WAITING), 3 left un-checked-in as demo candidates.
            demo_bookings = []
            checkin_times = [(13, 30), (13, 45)]
            for farmer, (hh, mm) in zip(group2[:2], checkin_times):
                token += 1
                checked_in_at = self._at(today, hh, mm)
                booking = self._make_booking(farmer, slot2)
                entry = self._check_in(booking, token, checked_in_at, QueueEntry.WAITING)
                waiting_examples.append(entry)

            for farmer in group2[2:5]:
                booking = self._make_booking(farmer, slot2)
                demo_bookings.append((farmer, booking))

            report[centre.code] = {
                'demo_bookings': demo_bookings,
                'waiting_examples': waiting_examples,
            }

        return report

    # -- future days: light, un-simulated booking density ----------------

    def _seed_future_days(self, centres, slots_by_centre, farmers):
        today = date.today()
        count = 0
        for centre in centres:
            future_slots = [s for s in slots_by_centre[centre.code] if s.date != today]
            for slot in future_slots:
                if slot.status != Slot.OPEN or random.random() > 0.45:
                    continue
                num_bookings = random.randint(1, 3)
                candidates = self._pick_farmers_for_centre(centre, farmers, num_bookings)
                for farmer in candidates:
                    if Booking.objects.filter(farmer=farmer, slot=slot).exists():
                        continue
                    status = Booking.CANCELLED if random.random() < 0.1 else Booking.BOOKED
                    self._make_booking(farmer, slot, status=status)
                    count += 1
        return count

    # -- summary -----------------------------------------------------------

    def _print_summary(self, centres, slots_by_centre, farmers, today_report, future_count, officer):
        total_slots = sum(len(s) for s in slots_by_centre.values())
        total_bookings = Booking.objects.filter(reference_code__startswith='DEMO-BK-').count()
        total_queue_entries = QueueEntry.objects.filter(booking__reference_code__startswith='DEMO-BK-').count()
        total_procurements = Procurement.objects.filter(booking__reference_code__startswith='DEMO-BK-').count()
        wheat_centres = [c for c in centres if c.crop == WHEAT]
        paddy_centres = [c for c in centres if c.crop == PADDY]

        self.stdout.write(self.style.SUCCESS('\nSeed complete.'))
        self.stdout.write(f'  Centres:          {len(centres)}  ({len(wheat_centres)} wheat, {len(paddy_centres)} paddy)')
        self.stdout.write(f'  Slots:            {total_slots}  (today + next {TOTAL_DAYS - 1} days, 3 slots/day: 6-8am, 10am-12pm, 2-4pm)')
        self.stdout.write(f'  Farmers:          {len(farmers)}')
        self.stdout.write(f'  Bookings total:   {total_bookings}  ({future_count} on future days)')
        self.stdout.write(f'  Queue entries:    {total_queue_entries}')
        self.stdout.write(f'  Procurements:     {total_procurements}')
        self.stdout.write('  Officers:         1')

        self.stdout.write('\nTest farmer logins (POST /api/auth/login/, all share the same password):')
        self.stdout.write(f'  Password: {DEMO_PASSWORD}')
        self.stdout.write(f"  Phones:   {FARMERS[0]['phone']} .. {FARMERS[-1]['phone']}")

        self.stdout.write('\nTest officer login (POST /api/auth/officer-login/, username + password):')
        self.stdout.write(f'  Username: {officer.username}')
        self.stdout.write(f'  Password: {OFFICER_PASSWORD}')

        highlight = today_report[DEMO_HIGHLIGHT_CENTRE_CODE]
        centre = next(c for c in centres if c.code == DEMO_HIGHLIGHT_CENTRE_CODE)
        self.stdout.write(self.style.SUCCESS(f'\n--- Live demo check-in candidates @ {centre.name} ({centre.code}) ---'))
        self.stdout.write("(booked for today's 2:00-4:00 PM slot, NOT yet checked in)")
        for farmer, booking in highlight['demo_bookings']:
            self.stdout.write(f'  {farmer.phone_number}  ({farmer.full_name})  booking_id={booking.id}  ref={booking.reference_code}')

        self.stdout.write(f'\n(already WAITING at {centre.code} today, so the queue is non-empty ahead of the check-in above):')
        for entry in highlight['waiting_examples'][:2]:
            self.stdout.write(
                f'  token #{entry.token_number}  farmer={entry.booking.farmer.full_name}  '
                f'slot={entry.booking.slot.start_time}-{entry.booking.slot.end_time}  status={entry.status}'
            )

        self.stdout.write('\nOther centres also each have 2-3 un-checked-in bookings today for improvised demos:')
        for centre in centres:
            if centre.code == DEMO_HIGHLIGHT_CENTRE_CODE:
                continue
            demo_bookings = today_report[centre.code]['demo_bookings']
            if not demo_bookings:
                continue
            farmer, booking = demo_bookings[0]
            self.stdout.write(f'  {centre.code}: {farmer.phone_number} ({farmer.full_name})  booking_id={booking.id}  ref={booking.reference_code}')
