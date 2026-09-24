from django.contrib import admin

from .models import (
    Booking,
    EmergencyRequest,
    Farmer,
    Notification,
    Procurement,
    ProcurementCentre,
    QueueEntry,
    Slot,
)


@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone_number', 'village', 'district', 'state']
    search_fields = ['full_name', 'phone_number']


@admin.register(ProcurementCentre)
class ProcurementCentreAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'state', 'daily_capacity', 'num_counters', 'is_active']
    search_fields = ['name', 'code']


@admin.register(Slot)
class SlotAdmin(admin.ModelAdmin):
    list_display = ['centre', 'date', 'start_time', 'end_time', 'capacity', 'status']
    list_filter = ['date', 'status']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['reference_code', 'farmer', 'slot', 'status', 'expected_quantity_kg', 'booked_at']
    list_filter = ['status']
    search_fields = ['reference_code']


@admin.register(QueueEntry)
class QueueEntryAdmin(admin.ModelAdmin):
    list_display = ['token_number', 'booking', 'status', 'checked_in_at', 'called_at', 'served_at']
    list_filter = ['status']
    ordering = ['token_number']


@admin.register(Procurement)
class ProcurementAdmin(admin.ModelAdmin):
    list_display = ['booking', 'commodity', 'quantity_kg', 'rate_per_kg', 'total_amount', 'status', 'payment_status']
    list_filter = ['payment_status']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['farmer', 'channel', 'status', 'created_at']


@admin.register(EmergencyRequest)
class EmergencyRequestAdmin(admin.ModelAdmin):
    list_display = ['booking', 'reason_category', 'status', 'previous_slot', 'target_slot', 'requested_at']
    list_filter = ['status', 'reason_category']
    ordering = ['-requested_at']
