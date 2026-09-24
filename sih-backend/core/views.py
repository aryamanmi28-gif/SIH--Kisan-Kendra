from datetime import date, datetime, timedelta

from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import generics, mixins, status
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Booking, EmergencyRequest, Notification, Procurement, ProcurementCentre, QueueEntry, Slot
from .permissions import IsFarmerOrOfficerUser, IsFarmerUser, IsOfficerOrOwningFarmer, IsOfficerUser
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    CentreDailyBookingSerializer,
    EmergencyRequestCreateSerializer,
    EmergencyRequestSerializer,
    FarmerRegistrationSerializer,
    FarmerSerializer,
    PhoneTokenObtainPairSerializer,
    ProcurementCentreSerializer,
    ProcurementCreateSerializer,
    ProcurementSerializer,
    QueueEntryOfficerSerializer,
    QueueEntrySerializer,
    SlotSerializer,
)


class FarmerRegistrationView(generics.CreateAPIView):
    serializer_class = FarmerRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farmer = serializer.save()
        return Response(FarmerSerializer(farmer).data, status=status.HTTP_201_CREATED)


class PhoneTokenObtainPairView(TokenObtainPairView):
    serializer_class = PhoneTokenObtainPairSerializer
    permission_classes = [AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = FarmerSerializer
    permission_classes = [IsFarmerUser]

    def get_object(self):
        return self.request.user.farmer


class ProcurementCentreViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    queryset = ProcurementCentre.objects.filter(is_active=True).order_by('name')
    serializer_class = ProcurementCentreSerializer
    # list/retrieve/slots all inherit this and none of them touch
    # request.user.farmer, so officers (no Farmer object) need access too --
    # the centre desk page lists centres via this same endpoint.
    permission_classes = [IsFarmerOrOfficerUser]

    @action(detail=True, methods=['get'], url_path='slots')
    def slots(self, request, pk=None):
        centre = self.get_object()
        slots = centre.slots.filter(status=Slot.OPEN)
        date_param = request.query_params.get('date')
        if date_param:
            slots = slots.filter(date=date_param)
        slots = slots.order_by('date', 'start_time')
        return Response(SlotSerializer(slots, many=True).data)

    @action(detail=True, methods=['get'], url_path='queue', permission_classes=[IsOfficerUser])
    def queue(self, request, pk=None):
        centre = self.get_object()
        entries = QueueEntry.objects.filter(
            booking__slot__centre=centre, booking__slot__date=date.today()
        ).select_related('booking__farmer', 'booking__slot__centre').order_by('token_number')
        return Response(QueueEntryOfficerSerializer(entries, many=True).data)

    @action(detail=True, methods=['get'], url_path='daily-summary', permission_classes=[IsOfficerUser])
    def daily_summary(self, request, pk=None):
        centre = self.get_object()
        # Same date() call check_in uses, so the two views never disagree
        # about what "today" is.
        bookings = Booking.objects.filter(
            slot__centre=centre,
            slot__date=date.today(),
        ).exclude(status=Booking.CANCELLED).select_related(
            'farmer', 'slot', 'slot__centre', 'queue_entry',
        ).order_by(
            'slot__start_time',
            F('queue_entry__token_number').asc(nulls_last=True),
            'booked_at',
        )
        return Response(CentreDailyBookingSerializer(bookings, many=True).data)

    @action(detail=True, methods=['post'], url_path='queue/call-next', permission_classes=[IsOfficerUser])
    def call_next(self, request, pk=None):
        centre = self.get_object()
        with transaction.atomic():
            entry = QueueEntry.objects.select_for_update().filter(
                booking__slot__centre=centre, booking__slot__date=date.today(), status=QueueEntry.WAITING,
            ).order_by('token_number').first()
            if entry is None:
                return Response({'detail': 'No farmers waiting in the queue.'})
            entry.status = QueueEntry.CALLED
            entry.called_at = timezone.now()
            entry.save(update_fields=['status', 'called_at'])
        return Response(QueueEntryOfficerSerializer(entry).data)


class BookingViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    permission_classes = [IsFarmerUser]

    def get_queryset(self):
        queryset = Booking.objects.select_related('slot', 'slot__centre').order_by('-booked_at')
        if self.action in ('record_procurement', 'queue_status'):
            return queryset
        return queryset.filter(farmer=self.request.user.farmer)

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save(farmer=request.user.farmer)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status != Booking.BOOKED:
            return Response(
                {'detail': 'Only bookings with status BOOKED can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.CANCELLED
        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=['get'], url_path='queue-status', permission_classes=[IsOfficerOrOwningFarmer])
    def queue_status(self, request, pk=None):
        booking = self.get_object()
        entry = getattr(booking, 'queue_entry', None)
        if entry is None:
            raise NotFound('This booking has not checked in yet.')
        return Response(QueueEntrySerializer(entry).data)

    @action(detail=True, methods=['post'], url_path='check-in')
    def check_in(self, request, pk=None):
        booking = self.get_object()

        existing = getattr(booking, 'queue_entry', None)
        if existing:
            return Response(QueueEntrySerializer(existing).data)

        if booking.status != Booking.BOOKED:
            return Response(
                {'detail': 'Only bookings with status BOOKED can check in.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = date.today()
        slot_date = booking.slot.date
        if slot_date > today:
            return Response(
                {'detail': f'Check-in is not open yet; this slot is on {slot_date}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if slot_date < today:
            return Response(
                {'detail': f'Check-in has closed; this slot was on {slot_date}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            existing_tokens = list(
                QueueEntry.objects.select_for_update().filter(
                    booking__slot__centre_id=booking.slot.centre_id, booking__slot__date=slot_date,
                ).values_list('token_number', flat=True)
            )
            token_number = (max(existing_tokens) if existing_tokens else 0) + 1
            entry = QueueEntry.objects.create(booking=booking, token_number=token_number, status=QueueEntry.WAITING)

        return Response(QueueEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='emergency-request')
    def emergency_request(self, request, pk=None):
        booking = self.get_object()

        serializer = EmergencyRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if booking.status != Booking.BOOKED:
            return Response(
                {'detail': 'Only bookings with status BOOKED are eligible for an emergency request.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slot = booking.slot
        today = date.today()
        if slot.date <= today:
            return Response(
                {'detail': 'Emergency requests are only available for future bookings.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        slot_start = timezone.make_aware(datetime.combine(slot.date, slot.start_time))
        window_start = slot_start - timedelta(hours=48)  # TEMP FOR TESTING — REVERT TO 12 BEFORE PRESENTING
        if not (window_start <= now < slot_start):
            return Response(
                {'detail': 'Emergency requests open 12 hours before your slot and close at the slot start time.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            target_slot = (
                Slot.objects.select_for_update()
                .filter(centre_id=slot.centre_id, date=today)
                .exclude(status=Slot.CLOSED)
                .order_by('start_time')
                .first()
            )
            if target_slot is None:
                return Response(
                    {'detail': 'No slots are available today at this centre.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            approved_count = EmergencyRequest.objects.filter(
                target_slot=target_slot, status=EmergencyRequest.APPROVED,
            ).count()

            if approved_count >= 2:
                EmergencyRequest.objects.create(
                    booking=booking, reason_category=data['reason_category'], note=data['note'],
                    status=EmergencyRequest.REJECTED, previous_slot=slot, target_slot=target_slot,
                )
                return Response(
                    {'status': 'rejected', 'detail': 'Emergency capacity full for the next available slot.'},
                )

            previous_slot = slot
            booking.slot = target_slot
            booking.save(update_fields=['slot'])

            new_count = target_slot.bookings.filter(status=Booking.BOOKED).count()
            if new_count > target_slot.capacity:
                bumped = (
                    target_slot.bookings.filter(status=Booking.BOOKED, queue_entry__isnull=True)
                    .exclude(id=booking.id)
                    .order_by('-booked_at')
                    .first()
                )
                if bumped:
                    next_slot = None
                    for candidate in Slot.objects.select_for_update().filter(
                        centre_id=target_slot.centre_id, date=today, start_time__gt=target_slot.start_time,
                    ).exclude(status=Slot.CLOSED).order_by('start_time'):
                        if candidate.bookings.filter(status=Booking.BOOKED).count() < candidate.capacity:
                            next_slot = candidate
                            break
                    if next_slot:
                        bumped.slot = next_slot
                        bumped.save(update_fields=['slot'])
                        Notification.objects.create(
                            farmer=bumped.farmer,
                            channel=Notification.APP,
                            message=(
                                f'Your booking {bumped.reference_code} was moved to '
                                f'{next_slot.start_time.strftime("%H:%M")}-{next_slot.end_time.strftime("%H:%M")} '
                                f'on {next_slot.date} to make room for an emergency slot request at '
                                f'{target_slot.centre.name}.'
                            ),
                        )
                    # If no later slot has room, the target slot is left one over
                    # capacity rather than failing the emergency request outright.

            emergency = EmergencyRequest.objects.create(
                booking=booking, reason_category=data['reason_category'], note=data['note'],
                status=EmergencyRequest.APPROVED, previous_slot=previous_slot, target_slot=target_slot,
            )

        return Response(
            {
                'status': 'approved',
                'emergency_request': EmergencyRequestSerializer(emergency).data,
                'booking': BookingSerializer(booking).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='procurement', permission_classes=[IsOfficerUser])
    def record_procurement(self, request, pk=None):
        booking = self.get_object()

        existing = getattr(booking, 'procurement', None)
        if existing:
            return Response(ProcurementSerializer(existing).data)

        queue_entry = getattr(booking, 'queue_entry', None)
        if queue_entry is None or queue_entry.status != QueueEntry.SERVED:
            return Response(
                {'detail': 'Procurement can only be recorded after the farmer has been SERVED in the queue.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProcurementCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            procurement = Procurement.objects.create(
                booking=booking,
                commodity=data['commodity'],
                quantity_kg=data['quantity_kg'],
                rate_per_kg=data['rate_per_kg'],
                total_amount=data['quantity_kg'] * data['rate_per_kg'],
                status=Procurement.COMPLETED,
                payment_status=Procurement.PAYMENT_PENDING,
                procured_at=timezone.now(),
            )
            booking.status = Booking.COMPLETED
            booking.save(update_fields=['status'])

        return Response(ProcurementSerializer(procurement).data, status=status.HTTP_201_CREATED)


class ProcurementViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    serializer_class = ProcurementSerializer
    permission_classes = [IsFarmerOrOfficerUser]

    def get_queryset(self):
        queryset = Procurement.objects.select_related('booking__farmer', 'booking__slot__centre')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(booking__farmer=self.request.user.farmer)

    @action(detail=True, methods=['patch'], url_path='mark-paid', permission_classes=[IsOfficerUser])
    def mark_paid(self, request, pk=None):
        procurement = self.get_object()
        if procurement.payment_status != Procurement.PAYMENT_PENDING:
            return Response(
                {'detail': 'Only a PENDING payment can be marked as PAID.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Mock DBT credit: no real payment gateway integration, just a manual status flip.
        procurement.payment_status = Procurement.PAYMENT_PAID
        procurement.save(update_fields=['payment_status'])
        return Response(ProcurementSerializer(procurement).data)


class QueueEntryViewSet(GenericViewSet):
    queryset = QueueEntry.objects.select_related('booking__farmer', 'booking__slot__centre')
    serializer_class = QueueEntryOfficerSerializer
    permission_classes = [IsOfficerUser]

    @action(detail=True, methods=['get'], url_path='status', permission_classes=[IsFarmerUser])
    def status_(self, request, pk=None):
        entry = self.get_object()
        if entry.booking.farmer_id != request.user.farmer.id:
            raise NotFound('No queue entry found.')
        return Response(QueueEntrySerializer(entry).data)

    @action(detail=True, methods=['patch'], url_path='serve')
    def serve(self, request, pk=None):
        entry = self.get_object()
        if entry.status != QueueEntry.CALLED:
            return Response(
                {'detail': 'Only a CALLED entry can be marked as SERVING.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.status = QueueEntry.SERVING
        entry.save(update_fields=['status'])
        return Response(QueueEntryOfficerSerializer(entry).data)

    @action(detail=True, methods=['patch'], url_path='complete')
    def complete(self, request, pk=None):
        entry = self.get_object()
        if entry.status != QueueEntry.SERVING:
            return Response(
                {'detail': 'Only a SERVING entry can be marked as SERVED.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.status = QueueEntry.SERVED
        entry.served_at = timezone.now()
        entry.save(update_fields=['status', 'served_at'])
        return Response(QueueEntryOfficerSerializer(entry).data)

    @action(detail=True, methods=['patch'], url_path='skip')
    def skip(self, request, pk=None):
        entry = self.get_object()
        if entry.status not in (QueueEntry.WAITING, QueueEntry.CALLED):
            return Response(
                {'detail': 'Only a WAITING or CALLED entry can be skipped.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        entry.status = QueueEntry.SKIPPED
        entry.save(update_fields=['status'])
        return Response(QueueEntryOfficerSerializer(entry).data)
