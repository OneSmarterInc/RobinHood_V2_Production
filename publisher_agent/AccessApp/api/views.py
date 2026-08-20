import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from AccessApp.models import OTPRecord, Subscriber, MaliciousActivityLog
from .serializers import RegisterInitSerializer, RegisterCompleteSerializer, LoginSerializer

class RegisterInitAPIView(APIView):
    """
    Step 1 of Registration: Generates and sends a 6-digit OTP to the email.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = RegisterInitSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            username = serializer.validated_data['username']
            
            # Generate 6 digit OTP
            otp_code = str(random.randint(100000, 999999))
            
            # Save to DB
            OTPRecord.objects.create(email=email, username=username, otp=otp_code)
            
            # Send Email
            send_mail(
                subject="Your SaaS Quant Engine OTP",
                message=f"Hello {username},\n\nYour OTP for registration is: {otp_code}\n\nThis OTP will expire in 10 minutes.",
                from_email="noreply@quantengine.com",
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({"message": f"OTP sent successfully to {email}"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterCompleteAPIView(APIView):
    """
    Step 2 of Registration: Verifies OTP, creates User, creates Subscriber, and returns API Token.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = RegisterCompleteSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            # Get the OTP record to find the username
            otp_record = OTPRecord.objects.filter(email=email).latest('created_at')
            username = otp_record.username
            
            # Create Django User
            user = User.objects.create_user(username=username, email=email, password=password)
            
            # Create Subscriber Profile (using the old robust model)
            subscriber = Subscriber.objects.create(user=user, status='ACTIVE')
            
            # Create the unique DRF Token for this user
            token, created = Token.objects.get_or_create(user=user)
            
            # Delete all OTPs for this email as they are now used
            OTPRecord.objects.filter(email=email).delete()
            
            return Response({
                "message": "Account created successfully.",
                "token": token.key
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    """
    Standard Login: Authenticates and returns the unique API Token.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(username=username, password=password)
            if user:
                # Security Check: Block Revoked Subscribers
                if hasattr(user, 'subscriber_profile') and user.subscriber_profile.status == 'REVOKED':
                    return Response(
                        {"error": "Access Denied: Your subscription has been suspended by the administrator. Please contact support."}, 
                        status=status.HTTP_403_FORBIDDEN
                    )

                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    "message": "Login successful.",
                    "token": token.key
                }, status=status.HTTP_200_OK)
                
            return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.shortcuts import get_object_or_404
from rest_framework.authentication import TokenAuthentication
from .permissions import IsSuperAdmin

class SubscriberRevokeAPIView(APIView):
    """
    Super Admin endpoint to revoke a user's subscription.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsSuperAdmin]

    def post(self, request, user_id, *args, **kwargs):
        subscriber = get_object_or_404(Subscriber, user__id=user_id)
        subscriber.status = 'REVOKED'
        subscriber.save()
        return Response({"message": f"User {subscriber.user.username}'s access has been REVOKED."}, status=status.HTTP_200_OK)

class SubscriberActivateAPIView(APIView):
    """
    Super Admin endpoint to reactivate a revoked user's subscription.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsSuperAdmin]

    def post(self, request, user_id, *args, **kwargs):
        subscriber = get_object_or_404(Subscriber, user__id=user_id)
        subscriber.status = 'ACTIVE'
        subscriber.save()
        return Response({"message": f"User {subscriber.user.username}'s access has been ACTIVATED."}, status=status.HTTP_200_OK)


