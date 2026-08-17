from django.contrib import admin
from .models import Plan, Subscriber, AuthToken, DesktopAppVersion, OTPRecord, MaliciousActivityLog

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'status', 'subscription_end_date', 'is_valid_subscriber')
    list_filter = ('status', 'plan')
    search_fields = ('user__username', 'user__email')
    
    def is_valid_subscriber(self, obj):
        return obj.is_valid()
    is_valid_subscriber.boolean = True
    is_valid_subscriber.short_description = "Valid"

@admin.register(AuthToken)
class AuthTokenAdmin(admin.ModelAdmin):
    list_display = ('subscriber', 'token_string', 'is_active', 'expires_at', 'last_used_at')
    list_filter = ('is_active',)
    search_fields = ('token_string', 'subscriber__user__username')
    # Make it easy to revoke tokens directly from the list view
    list_editable = ('is_active',)

@admin.register(DesktopAppVersion)
class DesktopAppVersionAdmin(admin.ModelAdmin):
    list_display = ('version_number', 'is_critical_update', 'released_at', 'download_url')
    list_filter = ('is_critical_update',)
    search_fields = ('version_number',)

@admin.register(MaliciousActivityLog)
class MaliciousActivityLogAdmin(admin.ModelAdmin):
    list_display = ('subscriber', 'activity_type', 'ip_address', 'timestamp')
    list_filter = ('activity_type',)
    search_fields = ('subscriber__user__username', 'ip_address')

admin.site.register(OTPRecord)
