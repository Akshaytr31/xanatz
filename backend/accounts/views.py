from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import OTP, User, PrivacyPolicy, Profile, Experience, Education, Company, CompanyMember, JobOpening, JobApplication, RFP, RFPInterest
from .serializers import (
    SendOTPSerializer, VerifyOTPSerializer, RegisterUserSerializer, 
    PrivacyPolicySerializer, UserSerializer, ProfileSerializer,
    ExperienceSerializer, EducationSerializer, CompanySerializer,
    UserSearchSerializer, JobOpeningSerializer, JobApplicationSerializer,
    RFPSerializer, RFPInterestSerializer
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
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        from rest_framework_simplejwt.tokens import RefreshToken
        import os

        credential = request.data.get('credential')
        if not credential:
            return Response({"error": "Google credential is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client_id = os.environ.get('GOOGLE_CLIENT_ID', '')
            id_info = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id
            )
        except ValueError as e:
            return Response({"error": f"Invalid Google token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        email = id_info.get('email')
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')

        if not email:
            return Response({"error": "Google account has no email"}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'accepted_privacy_policy': True,
            }
        )

        # Ensure profile exists (signal handles it on create, but be safe)
        Profile.objects.get_or_create(user=user)

        # Update name if user already existed and name was empty
        if not created and (not user.first_name or not user.last_name):
            user.first_name = user.first_name or first_name
            user.last_name = user.last_name or last_name
            user.save()

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        }, status=status.HTTP_200_OK)


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
        access_role = request.data.get('access_role', 'user')
        position = request.data.get('position', '')
        
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            CompanyMember.objects.update_or_create(
                company=company, user=user,
                defaults={'access_role': access_role, 'position': position}
            )
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
            CompanyMember.objects.filter(company=company, user=user).delete()
            return Response({"message": "User detached successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'])
    def update_member(self, request, pk=None):
        company = self.get_object()
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            member = CompanyMember.objects.get(company=company, user_id=user_id)
            if 'access_role' in request.data:
                member.access_role = request.data['access_role']
            if 'position' in request.data:
                member.position = request.data['position']
            member.save()
            return Response({"message": "Member updated successfully"}, status=status.HTTP_200_OK)
        except CompanyMember.DoesNotExist:
            return Response({"error": "Member not found in company"}, status=status.HTTP_404_NOT_FOUND)


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

class UserSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])
            
        users = User.objects.filter(
            Q(email__icontains=query) | 
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query)
        ).exclude(id=request.user.id)[:10]
        
        serializer = UserSearchSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)


class JobOpeningViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JobOpeningSerializer

    def get_queryset(self):
        queryset = JobOpening.objects.all()
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
            try:
                company = Company.objects.get(id=company_id)
                is_owner = company.creator == self.request.user
                is_admin = CompanyMember.objects.filter(company=company, user=self.request.user, access_role='admin').exists()
                if not (is_owner or is_admin):
                    queryset = queryset.filter(is_active=True)
            except Company.DoesNotExist:
                queryset = queryset.filter(is_active=True)
        else:
            queryset = queryset.filter(is_active=True)
            
        return queryset.order_by('-created_at')

    def check_company_access(self, company):
        is_owner = company.creator == self.request.user
        is_admin = CompanyMember.objects.filter(company=company, user=self.request.user, access_role='admin').exists()
        if not (is_owner or is_admin):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to manage this company's job openings.")

    def perform_create(self, serializer):
        company = serializer.validated_data.get('company')
        self.check_company_access(company)
        serializer.save()

    def perform_update(self, serializer):
        company = self.get_object().company
        self.check_company_access(company)
        serializer.save()

    def perform_destroy(self, instance):
        self.check_company_access(instance.company)
        instance.delete()


class JobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        job_id = self.request.query_params.get('job_id')
        company_id = self.request.query_params.get('company_id')

        # Company owner/admin should see applications for their company/job
        # Otherwise, user should only see applications they submitted.
        my_companies = Company.objects.filter(creator=user).values_list('id', flat=True)
        my_member_companies = CompanyMember.objects.filter(user=user, access_role='admin').values_list('company_id', flat=True)
        all_my_company_ids = list(my_companies) + list(my_member_companies)

        queryset = JobApplication.objects.all()

        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            # For detail actions, allow access if the user is the applicant or is the company owner/admin
            queryset = queryset.filter(
                Q(applicant=user) | 
                Q(job_opening__company_id__in=all_my_company_ids)
            )
        elif job_id:
            queryset = queryset.filter(job_opening_id=job_id)
            if not queryset.filter(job_opening__company_id__in=all_my_company_ids).exists():
                queryset = queryset.filter(applicant=user)
        elif company_id:
            if int(company_id) in all_my_company_ids:
                queryset = queryset.filter(job_opening__company_id=company_id)
            else:
                queryset = queryset.none()
        else:
            # Only return applications submitted by the current user when viewing 'My Applications'
            queryset = queryset.filter(applicant=user)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user, status='applied')

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        is_owner = instance.job_opening.company.creator == user
        is_admin = CompanyMember.objects.filter(company=instance.job_opening.company, user=user, access_role='admin').exists()
        is_applicant = instance.applicant == user

        if not (is_owner or is_admin or is_applicant):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to update this application.")
        
        serializer.save()


class RFPViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RFPSerializer

    def get_queryset(self):
        queryset = RFP.objects.all()
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
            try:
                company = Company.objects.get(id=company_id)
                is_owner = company.creator == self.request.user
                is_admin = CompanyMember.objects.filter(company=company, user=self.request.user, access_role='admin').exists()
                if not (is_owner or is_admin):
                    queryset = queryset.filter(is_active=True)
            except Company.DoesNotExist:
                queryset = queryset.filter(is_active=True)
        else:
            queryset = queryset.filter(is_active=True)
            
        return queryset.order_by('-created_at')

    def check_company_access(self, company):
        is_owner = company.creator == self.request.user
        is_admin = CompanyMember.objects.filter(company=company, user=self.request.user, access_role='admin').exists()
        if not (is_owner or is_admin):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to manage this company's RFPs.")

    def perform_create(self, serializer):
        company = serializer.validated_data.get('company')
        self.check_company_access(company)
        serializer.save()

    def perform_update(self, serializer):
        company = self.get_object().company
        self.check_company_access(company)
        serializer.save()

    def perform_destroy(self, instance):
        self.check_company_access(instance.company)
        instance.delete()


class RFPInterestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RFPInterestSerializer

    def get_queryset(self):
        user = self.request.user
        rfp_id = self.request.query_params.get('rfp_id')
        company_id = self.request.query_params.get('company_id')

        my_companies = Company.objects.filter(creator=user).values_list('id', flat=True)
        my_member_companies = CompanyMember.objects.filter(user=user, access_role='admin').values_list('company_id', flat=True)
        all_my_company_ids = list(my_companies) + list(my_member_companies)

        queryset = RFPInterest.objects.all()

        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            queryset = queryset.filter(
                Q(user=user) | 
                Q(rfp__company_id__in=all_my_company_ids)
            )
        elif rfp_id:
            queryset = queryset.filter(rfp_id=rfp_id)
            if not queryset.filter(rfp__company_id__in=all_my_company_ids).exists():
                queryset = queryset.filter(user=user)
        elif company_id:
            try:
                # Convert to int to check inside all_my_company_ids (since company_id query parameter is a string)
                comp_id = int(company_id)
                if comp_id in all_my_company_ids:
                    queryset = queryset.filter(rfp__company_id=comp_id)
                else:
                    queryset = queryset.none()
            except ValueError:
                queryset = queryset.none()
        else:
            queryset = queryset.filter(user=user)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

