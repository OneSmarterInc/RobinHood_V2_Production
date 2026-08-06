import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Plan(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="e.g., Monthly, Yearly, Lifetime")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True, help_text="Set to False to retire this plan")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (${self.price})"


class Subscriber(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('REVOKED', 'Revoked'),
        ('EXPIRED', 'Expired'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscriber_profile')
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    subscription_end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.status})"

    def is_valid(self):
        """Checks if the subscriber has an active status and hasn't expired."""
        if self.status != 'ACTIVE':
            return False
        if self.subscription_end_date and self.subscription_end_date < timezone.now():
            return False
        return True


class AuthToken(models.Model):
    """
    Manages the cryptographic tokens used by the Desktop Apps to fetch the feed.
    This replaces the hardcoded TOKENS dictionary from the Version_2 demo.
    """
    subscriber = models.ForeignKey(Subscriber, on_delete=models.CASCADE, related_name='tokens')
    token_string = models.CharField(max_length=255, unique=True, db_index=True)
    is_active = models.BooleanField(default=True, help_text="Toggle to instantly revoke a specific device's access (403 Forbidden)")
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    device_id = models.CharField(max_length=255, blank=True, help_text="Optional: bind token to a specific hardware ID")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Token for {self.subscriber.user.username} (Active: {self.is_active})"


class DesktopAppVersion(models.Model):
    """Manages the auto-updater API for the client's desktop agent."""
    version_number = models.CharField(max_length=50, unique=True, help_text="e.g., v2.1.0")
    release_notes = models.TextField(blank=True)
    download_url = models.URLField(max_length=500)
    is_critical_update = models.BooleanField(default=False, help_text="If True, forces user to update before trading")
    released_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-released_at']

    def __str__(self):
        return f"Argus App {self.version_number}"
