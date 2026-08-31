from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class IsManagerOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated: return False
        if request.user.is_superuser: return True
        return request.user.groups.filter(name='Manager').exists()

class IsSupportOrManagerOrSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated: return False
        if request.user.is_superuser: return True
        return request.user.groups.filter(name__in=['Manager', 'Support']).exists()

class IsActiveSubscriber(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            return request.user.subscriber_profile.status == 'ACTIVE'
        except Exception:
            return False
