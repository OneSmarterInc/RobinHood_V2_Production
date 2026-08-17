from django.urls import path
from .views import (
    RegisterInitAPIView, RegisterCompleteAPIView, LoginAPIView,
    SubscriberRevokeAPIView, SubscriberActivateAPIView, ReportMaliciousActivityAPIView
)

urlpatterns = [
    path('register-init/', RegisterInitAPIView.as_view(), name='register-init'),
    path('register-complete/', RegisterCompleteAPIView.as_view(), name='register-complete'),
    path('login/', LoginAPIView.as_view(), name='login'),
    
    # Honeypot Endpoint
    path('report-malicious/', ReportMaliciousActivityAPIView.as_view(), name='report-malicious'),

    # Super Admin Endpoints
    path('admin/subscribers/<int:user_id>/revoke/', SubscriberRevokeAPIView.as_view(), name='admin-revoke'),
    path('admin/subscribers/<int:user_id>/activate/', SubscriberActivateAPIView.as_view(), name='admin-activate'),
]
