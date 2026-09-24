from django.conf import settings
from django.db import models


class Farmer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='farmer')
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, unique=True)
    village = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


class ProcurementCentre(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    address = models.CharField(max_length=255)
    district = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    daily_capacity = models.PositiveIntegerField()
    contact_number = models.CharField(max_length=15)
    is_active = models.BooleanField(default=True)
    # Number of parallel service counters/servers at this centre, used as
    # "c" in the M/M/c wait-time model (see core/queueing.py).
    num_counters = models.PositiveIntegerField(default=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Slot(models.Model):
    OPEN, CLOSED, FULL = 'open', 'closed', 'full'
    STATUS_CHOICES = [(OPEN, 'Open'), (CLOSED, 'Closed'), (FULL, 'Full')]

    centre = models.ForeignKey(ProcurementCentre, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=OPEN)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['centre', 'date', 'start_time'], name='unique_slot_per_centre_datetime'),
        ]

    def __str__(self):
        return f"{self.centre.code} - {self.date} {self.start_time}"


class Booking(models.Model):
    BOOKED, CANCELLED, COMPLETED, NO_SHOW = 'booked', 'cancelled', 'completed', 'no_show'
    STATUS_CHOICES = [
        (BOOKED, 'Booked'), (CANCELLED, 'Cancelled'),
        (COMPLETED, 'Completed'), (NO_SHOW, 'No Show'),
    ]

    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='bookings')
    slot = models.ForeignKey(Slot, on_delete=models.CASCADE, related_name='bookings')
    reference_code = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=BOOKED)
    expected_quantity_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['farmer', 'slot'], name='unique_booking_per_farmer_slot'),
        ]

    def __str__(self):
        return self.reference_code


class QueueEntry(models.Model):
    WAITING, CALLED, SERVING, SERVED, SKIPPED = 'waiting', 'called', 'serving', 'served', 'skipped'
    STATUS_CHOICES = [
        (WAITING, 'Waiting'), (CALLED, 'Called'), (SERVING, 'Serving'),
        (SERVED, 'Served'), (SKIPPED, 'Skipped'),
    ]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='queue_entry')
    token_number = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=WAITING)
    checked_in_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    served_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Token {self.token_number} - {self.booking.reference_code}"


class Procurement(models.Model):
    SCHEDULED, IN_PROGRESS, COMPLETED, REJECTED = 'scheduled', 'in_progress', 'completed', 'rejected'
    STATUS_CHOICES = [
        (SCHEDULED, 'Scheduled'), (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'), (REJECTED, 'Rejected'),
    ]

    PAYMENT_PENDING, PAYMENT_PAID = 'pending', 'paid'
    PAYMENT_STATUS_CHOICES = [(PAYMENT_PENDING, 'Pending'), (PAYMENT_PAID, 'Paid')]

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='procurement')
    commodity = models.CharField(max_length=100)
    quantity_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    rate_per_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=SCHEDULED)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default=PAYMENT_PENDING)
    procured_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Procurement for {self.booking.reference_code}"


class EmergencyRequest(models.Model):
    WEATHER_DISASTER, HEALTH_EMERGENCY, OTHER = 'weather_disaster', 'health_emergency', 'other'
    REASON_CHOICES = [
        (WEATHER_DISASTER, 'Weather / Disaster'),
        (HEALTH_EMERGENCY, 'Health Emergency'),
        (OTHER, 'Other'),
    ]

    APPROVED, REJECTED = 'approved', 'rejected'
    STATUS_CHOICES = [(APPROVED, 'Approved'), (REJECTED, 'Rejected')]

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='emergency_requests')
    reason_category = models.CharField(max_length=20, choices=REASON_CHOICES)
    note = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    # The slot the booking was on when the request was made, and the slot it
    # targeted (today's earliest available at the same centre) -- kept even
    # on rejection so officers can see what was full.
    previous_slot = models.ForeignKey(Slot, on_delete=models.SET_NULL, null=True, related_name='+')
    target_slot = models.ForeignKey(Slot, on_delete=models.SET_NULL, null=True, related_name='emergency_requests')
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Emergency request for {self.booking.reference_code} ({self.status})'


class Notification(models.Model):
    SMS, APP = 'sms', 'app'
    CHANNEL_CHOICES = [(SMS, 'SMS'), (APP, 'App')]

    PENDING, SENT, FAILED = 'pending', 'sent', 'failed'
    STATUS_CHOICES = [(PENDING, 'Pending'), (SENT, 'Sent'), (FAILED, 'Failed')]

    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='notifications')
    channel = models.CharField(max_length=5, choices=CHANNEL_CHOICES)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.channel} to {self.farmer} - {self.status}"
