from django.urls import path
from .views import (
    AdminRegisterAPIView, AdminLoginAPIView, StaffManagementAPIView,
    AdminSubscriberListAPIView, AdminQueryListAPIView, AdminQueryReplyAPIView, SubscriberQueryAPIView,
    RegisterInitAPIView, RegisterCompleteAPIView, LoginAPIView,
    SubscriberRevokeAPIView, SubscriberActivateAPIView, AdminPublishingHistoryAPIView
)

urlpatterns = [
    path('register-init/', RegisterInitAPIView.as_view(), name='register-init'),
    path('register-complete/', RegisterCompleteAPIView.as_view(), name='register-complete'),
    path('login/', LoginAPIView.as_view(), name='login'),
    


    # Super Admin Endpoints
    path('admin/register/', AdminRegisterAPIView.as_view(), name='admin-register'),
    path('admin/login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('admin/staff/', StaffManagementAPIView.as_view(), name='admin-staff'),
    path('admin/staff/<int:staff_id>/', StaffManagementAPIView.as_view(), name='admin-staff-detail'),
    path('admin/subscribers/', AdminSubscriberListAPIView.as_view(), name='admin-subscribers'),
    path('admin/publishing-history/', AdminPublishingHistoryAPIView.as_view(), name='admin-publishing-history'),
    path('admin/queries/', AdminQueryListAPIView.as_view(), name='admin-queries'),
    path('admin/queries/<int:query_id>/reply/', AdminQueryReplyAPIView.as_view(), name='admin-query-reply'),
    
    path('subscriber/queries/', SubscriberQueryAPIView.as_view(), name='subscriber-queries'),
    
    path('admin/subscribers/<int:subscriber_id>/revoke/', SubscriberRevokeAPIView.as_view(), name='admin-revoke'),
    path('admin/subscribers/<int:subscriber_id>/activate/', SubscriberActivateAPIView.as_view(), name='admin-activate'),
]
