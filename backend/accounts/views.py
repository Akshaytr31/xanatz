from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import OTP, User, PrivacyPolicy, Profile, Experience, Education, Company
from .serializers import (
    SendOTPSerializer, VerifyOTPSerializer, RegisterUserSerializer, 
    PrivacyPolicySerializer, UserSerializer, ProfileSerializer,
    ExperienceSerializer, EducationSerializer, CompanySerializer
)

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "OTP verified successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterUserView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        # Implementation for Google Login
        return Response({"message": "Google login successful"}, status=status.HTTP_200_OK)

class PrivacyPolicyView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        policy = PrivacyPolicy.objects.first()
        serializer = PrivacyPolicySerializer(policy)
        return Response(serializer.data)
    
    def post(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
        policy = PrivacyPolicy.objects.first()
        if policy:
            serializer = PrivacyPolicySerializer(policy, data=request.data)
        else:
            serializer = PrivacyPolicySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        try:
            user = request.user
            # Ensure profile exists
            profile, created = Profile.objects.get_or_create(user=user)
            
            # Update user fields if provided
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
            user.save()

            # Update profile fields
            serializer = ProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(UserSerializer(user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExperienceViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return Experience.objects.filter(profile=profile)

    def perform_create(self, serializer):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


class EducationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EducationSerializer

    def get_queryset(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return Education.objects.filter(profile=profile)

    def perform_create(self, serializer):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)

from rest_framework.decorators import action

class CompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanySerializer
    queryset = Company.objects.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        company = serializer.save(creator=self.request.user)
        company.members.add(self.request.user)

    @action(detail=False, methods=['get'], url_path='my-companies')
    def my_companies(self, request):
        """Returns only companies created by the current user."""
        companies = Company.objects.filter(creator=request.user)
        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def attach_user(self, request, pk=None):
        company = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            company.members.add(user)
            return Response({"message": "User attached successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def detach_user(self, request, pk=None):
        company = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            company.members.remove(user)
            return Response({"message": "User detached successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


class PublicProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, public_id):
        try:
            profile = Profile.objects.get(public_id=public_id)
            user = profile.user
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except (Profile.DoesNotExist, ValueError):
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
