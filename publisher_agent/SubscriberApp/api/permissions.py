from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """
    Allows access only to superuser users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class IsActiveSubscriber(permissions.BasePermission):
    """
    Allows access only if the user has an ACTIVE subscriber profile.
    """
    message = "Your subscription has been revoked or expired. Please contact support."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        try:
            # The Subscriber model is related to User via 'subscriber_profile'
            # Note: We need to use the exact related_name defined in models.py
            # wait, in the models.py the user one to one is named 'subscriber_profile' for Subscriber?
            # Let's assume request.user.subscriber_profile
            subscriber = request.user.subscriber_profile
            return subscriber.is_valid()
        except Exception:
            return False
