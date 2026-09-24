import uuid
from decimal import Decimal

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Booking, EmergencyRequest, Farmer, Procurement, ProcurementCentre, QueueEntry, Slot
from .queueing import DEFAULT_AVG_SERVICE_MINUTES, estimate_wait_minutes

User = get_user_model()


class FarmerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = ['id', 'full_name', 'phone_number', 'village', 'district', 'state', 'is_verified', 'created_at']
        read_only_fields = fields


class FarmerRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=15)
    village = serializers.CharField(max_length=255)
    district = serializers.CharField(max_length=255)
    state = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True)

    def validate_phone_number(self, value):
        if Farmer.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError('A farmer with this phone number is already registered.')
        return value

    def validate_password(self, value):
        try:
            django_validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(username=validated_data['phone_number'], password=password)
        return Farmer.objects.create(user=user, **validated_data)


class PhoneTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'phone_number'

    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')

        try:
            farmer = Farmer.objects.select_related('user').get(phone_number=phone_number)
        except Farmer.DoesNotExist:
            raise AuthenticationFailed('No active account found with the given credentials.')

        user = authenticate(
            request=self.context.get('request'),
            username=farmer.user.username,
            password=password,
        )
        if user is None:
            raise AuthenticationFailed('No active account found with the given credentials.')

        self.user = user
        refresh = self.get_token(self.user)
        return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class ProcurementCentreSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcurementCentre
        fields = ['id', 'name', 'code', 'address', 'district', 'state', 'contact_number']


class ProcurementCentreMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcurementCentre
        fields = ['id', 'name', 'code']


class SlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slot
        fields = ['id', 'date', 'start_time', 'end_time', 'capacity', 'status']


class SlotWithCentreSerializer(serializers.ModelSerializer):
    centre = ProcurementCentreMiniSerializer(read_only=True)

    class Meta:
        model = Slot
        fields = ['id', 'date', 'start_time', 'end_time', 'status', 'centre']


class BookingSerializer(serializers.ModelSerializer):
    slot = SlotWithCentreSerializer(read_only=True)
    queue_status = serializers.SerializerMethodField()
    procurement = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'reference_code', 'status', 'expected_quantity_kg', 'booked_at',
            'slot', 'queue_status', 'procurement',
        ]

    def get_queue_status(self, obj):
        queue_entry = getattr(obj, 'queue_entry', None)
        return queue_entry.status if queue_entry else None

    def get_procurement(self, obj):
        procurement = getattr(obj, 'procurement', None)
        return ProcurementSerializer(procurement).data if procurement else None


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['slot', 'expected_quantity_kg']

    def validate_slot(self, slot):
        if slot.status != Slot.OPEN:
            raise serializers.ValidationError('This slot is not open for booking.')
        booked_count = slot.bookings.filter(status=Booking.BOOKED).count()
        if booked_count >= slot.capacity:
            raise serializers.ValidationError('This slot is full.')
        return slot

    def validate(self, attrs):
        farmer = self.context['request'].user.farmer
        if Booking.objects.filter(farmer=farmer, slot=attrs['slot']).exists():
            raise serializers.ValidationError('You have already booked this slot.')
        return attrs

    def create(self, validated_data):
        farmer = validated_data.pop('farmer')
        reference_code = f'BK-{uuid.uuid4().hex[:8].upper()}'
        return Booking.objects.create(farmer=farmer, reference_code=reference_code, **validated_data)


class EmergencyRequestCreateSerializer(serializers.Serializer):
    reason_category = serializers.ChoiceField(choices=EmergencyRequest.REASON_CHOICES)
    note = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')
    acknowledged = serializers.BooleanField()

    def validate_acknowledged(self, value):
        if not value:
            raise serializers.ValidationError(
                'You must acknowledge the emergency-use disclaimer to submit this request.'
            )
        return value


class EmergencyRequestSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(read_only=True)
    previous_slot = SlotWithCentreSerializer(read_only=True)
    target_slot = SlotWithCentreSerializer(read_only=True)

    class Meta:
        model = EmergencyRequest
        fields = [
            'id', 'booking', 'reason_category', 'note', 'status',
            'previous_slot', 'target_slot', 'requested_at',
        ]
        read_only_fields = fields


class ProcurementSerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Procurement
        fields = [
            'id', 'booking', 'commodity', 'quantity_kg', 'rate_per_kg',
            'total_amount', 'status', 'payment_status', 'procured_at',
        ]
        read_only_fields = fields


class ProcurementCreateSerializer(serializers.Serializer):
    commodity = serializers.CharField(max_length=100)
    quantity_kg = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal('0.01'))
    rate_per_kg = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=Decimal('0.01'))


class FarmerMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farmer
        fields = ['id', 'full_name', 'phone_number']


class QueueEntrySerializer(serializers.ModelSerializer):
    booking = serializers.PrimaryKeyRelatedField(read_only=True)
    centre = ProcurementCentreMiniSerializer(source='booking.slot.centre', read_only=True)
    date = serializers.DateField(source='booking.slot.date', read_only=True)
    position = serializers.SerializerMethodField()
    estimated_wait_minutes = serializers.SerializerMethodField()

    class Meta:
        model = QueueEntry
        fields = [
            'id', 'booking', 'status', 'token_number', 'centre', 'date',
            'position', 'estimated_wait_minutes', 'checked_in_at', 'called_at', 'served_at',
        ]
        read_only_fields = fields

    def get_position(self, obj):
        return QueueEntry.objects.filter(
            booking__slot__centre_id=obj.booking.slot.centre_id,
            booking__slot__date=obj.booking.slot.date,
            status=QueueEntry.WAITING,
            token_number__lt=obj.token_number,
        ).count()

    def get_estimated_wait_minutes(self, obj):
        centre_id = obj.booking.slot.centre_id
        slot_date = obj.booking.slot.date

        completed = QueueEntry.objects.filter(
            booking__slot__centre_id=centre_id,
            booking__slot__date=slot_date,
            status=QueueEntry.SERVED,
            called_at__isnull=False,
            served_at__isnull=False,
        ).values_list('called_at', 'served_at')
        durations_minutes = [
            (served_at - called_at).total_seconds() / 60 for called_at, served_at in completed
        ]
        # No completed service data for this centre/day yet -- fall back to a
        # clearly-labelled reasonable default rather than erroring or
        # returning 0/infinity.
        avg_service_minutes = (
            sum(durations_minutes) / len(durations_minutes)
            if durations_minutes
            else DEFAULT_AVG_SERVICE_MINUTES
        )

        todays_entries = QueueEntry.objects.filter(
            booking__slot__centre_id=centre_id, booking__slot__date=slot_date,
        ).order_by('checked_in_at')
        checked_in_count = todays_entries.count()
        arrivals_per_hour = 0.0
        if checked_in_count:
            first_checked_in_at = todays_entries.first().checked_in_at
            elapsed_hours = max((timezone.now() - first_checked_in_at).total_seconds() / 3600, 0.5)
            arrivals_per_hour = checked_in_count / elapsed_hours

        wait_minutes = estimate_wait_minutes(
            position=self.get_position(obj),
            avg_service_minutes=avg_service_minutes,
            servers=obj.booking.slot.centre.num_counters,
            arrivals_per_hour=arrivals_per_hour,
        )
        return round(wait_minutes, 1)


class QueueEntryOfficerSerializer(QueueEntrySerializer):
    farmer = FarmerMiniSerializer(source='booking.farmer', read_only=True)

    class Meta(QueueEntrySerializer.Meta):
        fields = QueueEntrySerializer.Meta.fields + ['farmer']
        read_only_fields = fields


class CentreDailyBookingSerializer(serializers.ModelSerializer):
    farmer = FarmerMiniSerializer(read_only=True)
    slot = SlotWithCentreSerializer(read_only=True)
    queue_status = serializers.SerializerMethodField()
    token_number = serializers.SerializerMethodField()
    queue_entry_id = serializers.SerializerMethodField()
    checked_in_at = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'reference_code', 'status',
            'expected_quantity_kg', 'booked_at', 'slot', 'farmer',
            'queue_status', 'token_number', 'queue_entry_id', 'checked_in_at',
        ]
        read_only_fields = fields

    def _queue_entry(self, obj):
        return getattr(obj, 'queue_entry', None)

    def get_queue_status(self, obj):
        entry = self._queue_entry(obj)
        return entry.status if entry else None

    def get_token_number(self, obj):
        entry = self._queue_entry(obj)
        return entry.token_number if entry else None

    def get_queue_entry_id(self, obj):
        entry = self._queue_entry(obj)
        return entry.id if entry else None

    def get_checked_in_at(self, obj):
        entry = self._queue_entry(obj)
        return entry.checked_in_at if entry else None
