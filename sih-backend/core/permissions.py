from rest_framework.permissions import BasePermission


class IsFarmerUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'farmer'))


class IsOfficerUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsOfficerOrOwningFarmer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        farmer = getattr(request.user, 'farmer', None)
        return bool(farmer and obj.farmer_id == farmer.id)


class IsFarmerOrOfficerUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.is_staff or hasattr(request.user, 'farmer'))
        )
