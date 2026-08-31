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
            OTPRecord.objects.update_or_create(email=email, defaults={'username': username, 'otp': otp_code})
            
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
from .permissions import IsSuperAdmin, IsManagerOrSuperAdmin, IsSupportOrManagerOrSuperAdmin

class SubscriberRevokeAPIView(APIView):
    """
    Super Admin endpoint to revoke a user's subscription.
    """
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsSuperAdmin]

    def post(self, request, user_id, *args, **kwargs):
        subscriber = get_object_or_404(Subscriber, user__id=user_id)
        subscriber.status = 'REVOKED'
        subscriber.save()
        return Response({"message": f"User {subscriber.user.username}'s access has been REVOKED."}, status=status.HTTP_200_OK)

class SubscriberActivateAPIView(APIView):
    """
    Super Admin endpoint to reactivate a revoked user's subscription.
    """
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsSuperAdmin]

    def post(self, request, user_id, *args, **kwargs):
        subscriber = get_object_or_404(Subscriber, user__id=user_id)
        subscriber.status = 'ACTIVE'
        subscriber.save()
        return Response({"message": f"User {subscriber.user.username}'s access has been ACTIVATED."}, status=status.HTTP_200_OK)




from .serializers import SubscriberSerializer, SupportQuerySerializer
from ..models import SupportQuery

class AdminSubscriberListAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsManagerOrSuperAdmin]
    # Should use IsAdminUser in production
    def get(self, request, *args, **kwargs):
        subscribers = Subscriber.objects.all().order_by('-created_at')
        serializer = SubscriberSerializer(subscribers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminQueryListAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsSupportOrManagerOrSuperAdmin]
    def get(self, request, *args, **kwargs):
        queries = SupportQuery.objects.all().order_by('-created_at')
        serializer = SupportQuerySerializer(queries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminQueryReplyAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsSupportOrManagerOrSuperAdmin]
    def post(self, request, query_id, *args, **kwargs):
        try:
            query = SupportQuery.objects.get(id=query_id)
        except SupportQuery.DoesNotExist:
            return Response({"error": "Query not found."}, status=status.HTTP_404_NOT_FOUND)
        
        reply_text = request.data.get('reply')
        if not reply_text:
            return Response({"error": "Reply text is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        query.reply = reply_text
        query.status = 'RESOLVED'
        query.save()
        return Response({"message": "Replied successfully."}, status=status.HTTP_200_OK)

class SubscriberQueryAPIView(APIView):
    def get(self, request, *args, **kwargs):
        # We assume the username is passed in headers for testing (in prod use tokens)
        username = request.headers.get('X-Username')
        if not username:
            return Response({"error": "Username header required."}, status=status.HTTP_401_UNAUTHORIZED)
            
        queries = SupportQuery.objects.filter(subscriber__user__username=username).order_by('-created_at')
        serializer = SupportQuerySerializer(queries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        username = request.headers.get('X-Username')
        if not username:
            return Response({"error": "Username header required."}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            subscriber = Subscriber.objects.get(user__username=username)
        except Subscriber.DoesNotExist:
            return Response({"error": "Subscriber not found."}, status=status.HTTP_404_NOT_FOUND)

        subject = request.data.get('subject')
        message = request.data.get('message')
        
        query = SupportQuery.objects.create(
            subscriber=subscriber,
            subject=subject,
            message=message
        )
        return Response({"message": "Query created successfully."}, status=status.HTTP_201_CREATED)


from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

class AdminRegisterAPIView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Admin username already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(username=username, email=email, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "message": "Admin account created successfully!"}, status=status.HTTP_201_CREATED)

class AdminLoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user and user.is_staff:
            token, _ = Token.objects.get_or_create(user=user)
            role = "Support"
            if user.is_superuser:
                role = "SuperAdmin"
            elif user.groups.filter(name='Manager').exists():
                role = "Manager"
            return Response({"token": token.key, "role": role}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials or not an admin."}, status=status.HTTP_401_UNAUTHORIZED)

from django.contrib.auth.models import Group
class StaffManagementAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        staff = User.objects.filter(is_staff=True, is_superuser=False)
        data = []
        for s in staff:
            role = "Support"
            if s.groups.filter(name='Manager').exists(): role = "Manager"
            data.append({
                "id": s.id, "username": s.username, "email": s.email, "role": role, "date_joined": s.date_joined
            })
        return Response(data)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        role = request.data.get('role')
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username taken."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(username=username, password=password)
        user.is_staff = True
        user.save()
        
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)
        
        return Response({"message": "Staff created!"}, status=status.HTTP_201_CREATED)
        
    def delete(self, request, staff_id):
        User.objects.filter(id=staff_id, is_superuser=False).delete()
        return Response({"message": "Staff deleted."})
