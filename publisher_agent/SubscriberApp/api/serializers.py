from rest_framework import serializers
from SubscriberApp.models import OTPRecord
from django.contrib.auth.models import User

class RegisterInitSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value


class RegisterCompleteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords must match."})
            
        try:
            # Find the most recent OTP for this email
            otp_record = OTPRecord.objects.filter(email=data['email']).latest('created_at')
        except OTPRecord.DoesNotExist:
            raise serializers.ValidationError({"otp": "No OTP found for this email. Please request a new one."})
            
        if otp_record.otp != data['otp']:
            raise serializers.ValidationError({"otp": "Invalid OTP."})
            
        if not otp_record.is_valid():
            raise serializers.ValidationError({"otp": "OTP has expired."})
            
        return data


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
