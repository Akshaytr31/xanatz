from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from .models import OTP, User
from .serializers import SendOTPSerializer, VerifyOTPSerializer, RegisterUserSerializer
from .utils import generate_and_send_otp

class SendOTPView(APIView):
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            if User.objects.filter(email=email).exists():
                return Response({"message": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
            generate_and_send_otp(email)
            return Response({"message": "OTP sent successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            otp_record = OTP.objects.filter(email=email).order_by('-created_at').first()
            
            if otp_record and otp_record.otp == otp:
                if otp_record.is_valid():
                    otp_record.is_verified = True
                    otp_record.save()
                    return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)
                return Response({"message": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterUserView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp_record = OTP.objects.filter(email=email, is_verified=True).order_by('-created_at').first()
        
        if not otp_record or not otp_record.is_valid():
            return Response({"message": "Email not verified or verification window has expired."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "User registered successfully.",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(APIView):
    def post(self, request):
        token = request.data.get('credential')
        if not token:
            return Response({"message": "Google Credential is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            client_id = os.environ.get('GOOGLE_CLIENT_ID')
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
            
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            
            user, created = User.objects.get_or_create(email=email)
            if created:
                user.first_name = first_name
                user.last_name = last_name
                user.accepted_privacy_policy = True
                user.set_unusable_password()
                user.save()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Google authentication successful.",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
            
        except ValueError:
            return Response({"message": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)
