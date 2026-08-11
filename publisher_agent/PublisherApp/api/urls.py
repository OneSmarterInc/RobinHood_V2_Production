from django.urls import path
from .views import LatestTargetAPIView

urlpatterns = [
    path('targets/latest/', LatestTargetAPIView.as_view(), name='latest-target'),
]
