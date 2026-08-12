import datetime
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import OTP, User, PrivacyPolicy, Profile, Experience, Education, Company, CompanyMember, JobOpening, JobApplication, RFP, RFPInterest, JobPostPlan, CompanySubscription, Notification, Message, PortfolioProject, CompanyReview, FreelancerReview, CompanyFAQ
from .serializers import (
    SendOTPSerializer, VerifyOTPSerializer, RegisterUserSerializer, 
    PrivacyPolicySerializer, UserSerializer, ProfileSerializer,
    ExperienceSerializer, EducationSerializer, CompanySerializer,
    UserSearchSerializer, JobOpeningSerializer, JobApplicationSerializer,
    RFPSerializer, RFPInterestSerializer, JobPostPlanSerializer, CompanySubscriptionSerializer, NotificationSerializer, MessageSerializer,
    PortfolioProjectSerializer, PublicCompanySerializer, CompanyReviewSerializer, FreelancerReviewSerializer, CompanyFAQSerializer
)
from .utils import (
    get_user_company_role,
    can_manage_company_roles,
    can_assign_super_admin,
    can_manage_company_profile,
    can_manage_company_hr,
    can_manage_company_accounting,
    can_manage_company_rfp
)

class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if email and User.objects.filter(email__iexact=email).exists():
            return Response(
                {"email": ["An account with this email address already exists. Please login instead."]},
                status=status.HTTP_400_BAD_REQUEST
            )
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
            user = serializer.save()
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "User registered successfully",
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
            }, status=status.HTTP_201_CREATED)
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
            },
            "needs_password": not user.password or user.password == '' or user.password.startswith('!') or not user.has_usable_password()
        }, status=status.HTTP_200_OK)


class SetPasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get('password')
        if not password:
            return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.set_password(password)
        user.save()
        return Response({"success": "Password set successfully"}, status=status.HTTP_200_OK)


class ForgotPasswordSendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify user exists
        if not User.objects.filter(email=email).exists():
            return Response({"error": "No account is registered with this email address."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password reset OTP sent successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordWithOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        password = request.data.get('password')

        if not email or not otp_code or not password:
            return Response({"error": "Email, OTP, and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email"}, status=status.HTTP_404_NOT_FOUND)

        # Find the OTP - it's already been verified in step 2, so look for is_verified=True
        otp_instance = OTP.objects.filter(email=email, otp=otp_code, is_verified=True).order_by('-created_at').first()
        if not otp_instance or not otp_instance.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # Update user password
        user.set_password(password)
        user.save()

        return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)


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
        user = request.user
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        serializer = UserSerializer(user)
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


class PortfolioProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PortfolioProjectSerializer

    def get_queryset(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return PortfolioProject.objects.filter(profile=profile)

    def perform_create(self, serializer):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)


from rest_framework.decorators import action

class CompanyViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanySerializer

    def get_queryset(self):
        queryset = Company.objects.all()
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        company = serializer.save(creator=self.request.user)
        company.members.add(self.request.user)

    def perform_update(self, serializer):
        company = self.get_object()
        if not can_manage_company_profile(self.request.user, company):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Super Admin or Admin can edit company profile.")
        serializer.save()

    @action(detail=False, methods=['get'], url_path='my-companies')
    def my_companies(self, request):
        """Returns only companies created by the current user."""
        companies = Company.objects.filter(creator=request.user)
        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def attach_user(self, request, pk=None):
        company = self.get_object()
        if not can_manage_company_roles(request.user, company):
            return Response({"error": "Only Super Admin and Admin can manage team roles."}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get('user_id')
        access_role = request.data.get('access_role', 'user')
        position = request.data.get('position', '')

        if access_role == 'super_admin' and not can_assign_super_admin(request.user, company):
            return Response({"error": "Only Super Admin can assign the Super Admin role."}, status=status.HTTP_403_FORBIDDEN)
        
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
        if not can_manage_company_roles(request.user, company):
            return Response({"error": "Only Super Admin and Admin can remove team members."}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            target_role = get_user_company_role(user, company)
            if (target_role == 'super_admin' or user.id == company.creator_id) and not can_assign_super_admin(request.user, company):
                return Response({"error": "Admins cannot remove a Super Admin or Company Owner."}, status=status.HTTP_403_FORBIDDEN)
            CompanyMember.objects.filter(company=company, user=user).delete()
            return Response({"message": "User detached successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'])
    def update_member(self, request, pk=None):
        company = self.get_object()
        if not can_manage_company_roles(request.user, company):
            return Response({"error": "Only Super Admin and Admin can edit member roles."}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            member = CompanyMember.objects.get(company=company, user_id=user_id)
            new_role = request.data.get('access_role')
            if new_role == 'super_admin' and not can_assign_super_admin(request.user, company):
                return Response({"error": "Only Super Admin can assign the Super Admin role."}, status=status.HTTP_403_FORBIDDEN)
            if (member.access_role == 'super_admin' or member.user_id == company.creator_id) and not can_assign_super_admin(request.user, company):
                return Response({"error": "Admins cannot edit a Super Admin or Company Owner."}, status=status.HTTP_403_FORBIDDEN)

            if 'access_role' in request.data:
                member.access_role = request.data['access_role']
            if 'position' in request.data:
                member.position = request.data['position']
            member.save()
            return Response({"message": "Member updated successfully"}, status=status.HTTP_200_OK)
        except CompanyMember.DoesNotExist:
            return Response({"error": "Member not found in company"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def subscribe_plan(self, request, pk=None):
        """Activate a job posting plan for this company (test mode — no payment)."""
        company = self.get_object()
        if not can_manage_company_accounting(request.user, company):
            return Response({"error": "Only Super Admin, Admin, or Accountant can manage subscriptions."}, status=status.HTTP_403_FORBIDDEN)

        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({"error": "plan_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = JobPostPlan.objects.get(id=plan_id, is_active=True)
        except JobPostPlan.DoesNotExist:
            return Response({"error": "Plan not found or inactive."}, status=status.HTTP_404_NOT_FOUND)

        # Deactivate any existing active subscription
        CompanySubscription.objects.filter(company=company, is_active=True).update(is_active=False)

        # Create new subscription
        subscription = CompanySubscription.objects.create(
            company=company,
            plan=plan,
            is_active=True
        )

        serializer = CompanySubscriptionSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def subscription_status(self, request, pk=None):
        """Get the current active subscription for this company."""
        company = self.get_object()
        subscription = CompanySubscription.objects.filter(company=company, is_active=True).select_related('plan').first()
        if not subscription:
            return Response({"subscription": None, "has_subscription": False})
        serializer = CompanySubscriptionSerializer(subscription)
        return Response({"subscription": serializer.data, "has_subscription": True})


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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = JobOpeningSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        from django.utils import timezone
        queryset = JobOpening.objects.all()
        
        user = self.request.user
        if user.is_authenticated:
            from .models import CompanyMember, Company
            my_companies = Company.objects.filter(creator=user).values_list('id', flat=True)
            my_member_companies = CompanyMember.objects.filter(
                user=user, access_role__in=['super_admin', 'admin', 'hr']
            ).values_list('company_id', flat=True)
            managed_company_ids = set(list(my_companies) + list(my_member_companies))
        else:
            managed_company_ids = []

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(job_id__icontains=search))

        company_id = self.request.query_params.get('company_id')

        if company_id:
            queryset = queryset.filter(company_id=company_id)
            try:
                if int(company_id) not in managed_company_ids:
                    queryset = queryset.filter(is_active=True, is_flagged=False)
            except (ValueError, TypeError):
                queryset = queryset.filter(is_active=True, is_flagged=False)
        else:
            if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
                # Allow access if it's active & non-flagged, OR if the job belongs to a managed company
                queryset = queryset.filter(
                    Q(is_active=True, is_flagged=False) | Q(company_id__in=managed_company_ids)
                )
            else:
                # Candidate/user dashboard: only show active and non-expired jobs
                queryset = queryset.filter(
                    is_active=True,
                    is_flagged=False
                ).filter(
                    Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
                )

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def flag(self, request, pk=None):
        job = self.get_object()
        job.is_flagged = True
        job.flag_status = 'unresolved'
        job.flag_reason = request.data.get('reason', '')
        job.save()
        return Response({"message": "Job opening flagged successfully"}, status=status.HTTP_200_OK)

    def check_company_access(self, company):
        if not can_manage_company_hr(self.request.user, company):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to manage this company's job openings.")

    def perform_create(self, serializer):
        company = serializer.validated_data.get('company')
        self.check_company_access(company)

        # Credit enforcement: check for active subscription with remaining credits
        subscription = CompanySubscription.objects.filter(company=company, is_active=True).select_related('plan').first()
        if not subscription:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": "No active plan. Please subscribe to a plan before posting jobs."})

        if subscription.is_credits_exhausted:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": f"Job posting credits exhausted. Your {subscription.plan.display_name} plan allows {subscription.plan.max_jobs} jobs. Please upgrade your plan."})

        # Calculate expires_at based on plan duration
        from django.utils import timezone
        import datetime
        expires_at = timezone.now() + datetime.timedelta(days=subscription.plan.job_duration_days)

        # Save the job with expiration
        serializer.save(expires_at=expires_at)

        # Increment jobs_used
        subscription.jobs_used += 1
        subscription.save()

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

        # Company owner, admin, or HR should see applications for their company/job
        # Otherwise, user should only see applications they submitted.
        my_companies = Company.objects.filter(creator=user).values_list('id', flat=True)
        my_member_companies = CompanyMember.objects.filter(
            user=user, access_role__in=['super_admin', 'admin', 'hr']
        ).values_list('company_id', flat=True)
        all_my_company_ids = list(set(list(my_companies) + list(my_member_companies)))

        queryset = JobApplication.objects.all()

        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
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
        job_opening = serializer.validated_data.get('job_opening')
        if job_opening and job_opening.is_expired:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": "Cannot apply to an expired job opening."})
        serializer.save(applicant=self.request.user, status='applied')

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        is_hr = can_manage_company_hr(user, instance.job_opening.company)
        is_applicant = instance.applicant == user

        if not (is_hr or is_applicant):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to update this application.")
        
        serializer.save()


class RFPViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = RFPSerializer

    def get_queryset(self):
        queryset = RFP.objects.all()
        
        user = self.request.user
        if user.is_authenticated:
            from .models import CompanyMember, Company
            my_companies = Company.objects.filter(creator=user).values_list('id', flat=True)
            my_member_companies = CompanyMember.objects.filter(
                user=user, access_role__in=['super_admin', 'admin']
            ).values_list('company_id', flat=True)
            managed_company_ids = set(list(my_companies) + list(my_member_companies))
        else:
            managed_company_ids = []

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(rfp_id__icontains=search))

        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
            try:
                if int(company_id) not in managed_company_ids:
                    queryset = queryset.filter(is_active=True, is_flagged=False)
            except (ValueError, TypeError):
                queryset = queryset.filter(is_active=True, is_flagged=False)
        else:
            if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
                # Allow access if it's active & non-flagged, OR if the RFP belongs to a managed company
                queryset = queryset.filter(
                    Q(is_active=True, is_flagged=False) | Q(company_id__in=managed_company_ids)
                )
            else:
                queryset = queryset.filter(is_active=True, is_flagged=False)
            
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def flag(self, request, pk=None):
        rfp = self.get_object()
        rfp.is_flagged = True
        rfp.flag_status = 'unresolved'
        rfp.flag_reason = request.data.get('reason', '')
        rfp.save()
        return Response({"message": "RFP flagged successfully"}, status=status.HTTP_200_OK)

    def check_company_access(self, company):
        if not can_manage_company_rfp(self.request.user, company):
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
        my_member_companies = CompanyMember.objects.filter(
            user=user, access_role__in=['super_admin', 'admin', 'accountant']
        ).values_list('company_id', flat=True)
        all_my_company_ids = list(set(list(my_companies) + list(my_member_companies)))

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
        rfp_interest = serializer.save(user=self.request.user)
        
        # Notify the company admins/owner
        rfp = rfp_interest.rfp
        company = rfp.company
        
        recipients = set()
        if company.creator:
            recipients.add(company.creator)
            
        admins = CompanyMember.objects.filter(company=company, access_role='admin').select_related('user')
        for admin_member in admins:
            if admin_member.user:
                recipients.add(admin_member.user)
                
        for recipient in recipients:
            if recipient != self.request.user:
                Notification.objects.create(
                    recipient=recipient,
                    sender=self.request.user,
                    message=f"{rfp_interest.company_name} showed interest in your RFP '{rfp.title}'.",
                    target_url=f"/company/{company.id}/rfp-interests"
                )

        # Notify the expressing freelancer with response time
        response_days = company.rfp_response_days or 5
        Notification.objects.create(
            recipient=self.request.user,
            sender=company.creator if company.creator else None,
            message=f"Thank you for expressing interest in RFP '{rfp.title}'. Usually, the company responds in {response_days} days.",
            target_url=f"/rfps/{rfp.id}"
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        # Check if status has changed
        if old_instance.status != new_instance.status:
            if new_instance.status == 'accepted':
                Notification.objects.create(
                    recipient=new_instance.user,
                    sender=self.request.user,
                    message=f"Your proposal for RFP '{new_instance.rfp.title}' was accepted by {new_instance.rfp.company.name}.",
                    target_url=f"/rfps"
                )
            elif new_instance.status == 'rejected':
                Notification.objects.create(
                    recipient=new_instance.user,
                    sender=self.request.user,
                    message=f"Your proposal for RFP '{new_instance.rfp.title}' was declined by {new_instance.rfp.company.name}.",
                    target_url=f"/rfps"
                )


class JobPostPlanViewSet(viewsets.ModelViewSet):
    """List and manage available job posting plans."""
    serializer_class = JobPostPlanSerializer

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return JobPostPlan.objects.all().order_by('price')
        return JobPostPlan.objects.filter(is_active=True).order_by('price')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]


class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)


class MessageViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(recipient=user))

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def conversations(self, request):
        user = request.user
        from django.utils import timezone
        
        sent_recipients = Message.objects.filter(sender=user).values_list('recipient', flat=True)
        received_senders = Message.objects.filter(recipient=user).values_list('sender', flat=True)
        partner_ids = set(list(sent_recipients) + list(received_senders))
        
        partners = User.objects.filter(id__in=partner_ids)
        conversations_data = []
        
        for partner in partners:
            last_msg = Message.objects.filter(
                (Q(sender=user) & Q(recipient=partner)) | 
                (Q(sender=partner) & Q(recipient=user))
            ).order_by('-created_at').first()
            
            unread_count = Message.objects.filter(
                sender=partner,
                recipient=user,
                is_read=False
            ).count()
            
            partner_name = f"{partner.first_name or ''} {partner.last_name or ''}".strip()
            partner_name = partner_name or partner.email
            
            profile_pic_url = None
            if hasattr(partner, 'profile') and partner.profile.profile_picture:
                profile_pic_url = request.build_absolute_uri(partner.profile.profile_picture.url)
                
            conversations_data.append({
                'id': partner.id,
                'email': partner.email,
                'name': partner_name,
                'profile_picture': profile_pic_url,
                'last_message': last_msg.content if last_msg else "",
                'last_message_time': last_msg.created_at if last_msg else None,
                'unread_count': unread_count
            })
            
        conversations_data.sort(key=lambda x: x['last_message_time'] or timezone.now(), reverse=True)
        return Response(conversations_data)

    @action(detail=False, methods=['get'])
    def chat(self, request):
        user = request.user
        partner_id = request.query_params.get('user_id')
        if not partner_id:
            return Response({"error": "user_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        messages = Message.objects.filter(
            (Q(sender=user) & Q(recipient_id=partner_id)) | 
            (Q(sender_id=partner_id) & Q(recipient=user))
        ).order_by('created_at')
        
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='mark-read')
    def mark_read(self, request):
        user = request.user
        sender_id = request.data.get('sender_id')
        if not sender_id:
            return Response({"error": "sender_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        Message.objects.filter(sender_id=sender_id, recipient=user, is_read=False).update(is_read=True)
        return Response({"message": "Messages marked as read"}, status=status.HTTP_200_OK)


class PublicCompanyProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, public_id):
        try:
            company = Company.objects.get(public_id=public_id, is_active=True)
            serializer = PublicCompanySerializer(company, context={'request': request})
            return Response(serializer.data)
        except (Company.DoesNotExist, ValueError):
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)


class CompanyReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = CompanyReviewSerializer
    queryset = CompanyReview.objects.all().order_by('-created_at')

    def get_queryset(self):
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset

    def perform_create(self, serializer):
        company_name = self.request.data.get('company_name', '').strip()
        company = None
        if company_name:
            company = Company.objects.filter(name__iexact=company_name).first()
        rfp_interest_id = self.request.data.get('rfp_interest')
        rfp_interest = None
        if rfp_interest_id:
            rfp_interest = RFPInterest.objects.filter(id=rfp_interest_id).first()
            if rfp_interest and not company:
                candidate_user = rfp_interest.user
                company = Company.objects.filter(creator=candidate_user, is_active=True).first()
                if not company:
                    membership = CompanyMember.objects.filter(user=candidate_user, company__is_active=True).first()
                    if membership:
                        company = membership.company
        serializer.save(reviewer=self.request.user, company=company, company_name=company_name, rfp_interest=rfp_interest)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def flag(self, request, pk=None):
        review = self.get_object()
        review.is_flagged = True
        review.flag_status = 'unresolved'
        review.flag_reason = request.data.get('reason', '')
        review.save()
        return Response({"message": "Review flagged successfully"}, status=status.HTTP_200_OK)


class FreelancerReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = FreelancerReviewSerializer
    queryset = FreelancerReview.objects.all().order_by('-created_at')

    def get_queryset(self):
        queryset = super().get_queryset()
        freelancer_id = self.request.query_params.get('freelancer_id')
        if freelancer_id:
            queryset = queryset.filter(freelancer_id=freelancer_id)
        return queryset

    def perform_create(self, serializer):
        freelancer_id = self.request.data.get('freelancer')
        freelancer = User.objects.get(id=freelancer_id)
        rfp_interest_id = self.request.data.get('rfp_interest')
        rfp_interest = None
        if rfp_interest_id:
            rfp_interest = RFPInterest.objects.filter(id=rfp_interest_id).first()
        serializer.save(reviewer=self.request.user, freelancer=freelancer, rfp_interest=rfp_interest)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def flag(self, request, pk=None):
        review = self.get_object()
        review.is_flagged = True
        review.flag_status = 'unresolved'
        review.flag_reason = request.data.get('reason', '')
        review.save()
        return Response({"message": "Review flagged successfully"}, status=status.HTTP_200_OK)


class AdminFlaggedReviewsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status', 'all')
        
        def get_filtered_queryset(model):
            if status_filter == 'unresolved':
                return model.objects.filter(is_flagged=True).order_by('-created_at')
            elif status_filter == 'resolved':
                return model.objects.filter(is_flagged=False, flag_status='resolved').order_by('-created_at')
            else:  # 'all'
                return model.objects.filter(Q(is_flagged=True) | Q(flag_status='resolved')).order_by('-created_at')

        company_reviews = get_filtered_queryset(CompanyReview)
        freelancer_reviews = get_filtered_queryset(FreelancerReview)
        flagged_jobs = get_filtered_queryset(JobOpening)
        flagged_rfps = get_filtered_queryset(RFP)

        results = []
        for r in company_reviews:
            reviewer_email = r.reviewer.email if r.reviewer else ""
            reviewer_name = (f"{r.reviewer.first_name} {r.reviewer.last_name}".strip() or r.reviewer.email) if r.reviewer else "Anonymous"
            subject_name = r.company.name if r.company else (r.company_name or "")
            results.append({
                'id': r.id,
                'custom_id': r.review_id,
                'review_type': 'company',
                'reviewer_email': reviewer_email,
                'reviewer_name': reviewer_name,
                'subject_name': subject_name,
                'rating': r.rating,
                'review_text': r.review_text,
                'created_at': r.created_at,
                'flag_reason': r.flag_reason or '',
                'is_flagged': r.is_flagged,
                'flag_status': 'resolved' if (r.flag_status == 'resolved' and not r.is_flagged) else 'unresolved'
            })

        for r in freelancer_reviews:
            reviewer_email = r.reviewer.email if r.reviewer else ""
            reviewer_name = (f"{r.reviewer.first_name} {r.reviewer.last_name}".strip() or r.reviewer.email) if r.reviewer else "Anonymous"
            subject_name = (f"{r.freelancer.first_name} {r.freelancer.last_name}".strip() or r.freelancer.email) if r.freelancer else "Unknown Freelancer"
            results.append({
                'id': r.id,
                'custom_id': r.review_id,
                'review_type': 'freelancer',
                'reviewer_email': reviewer_email,
                'reviewer_name': reviewer_name,
                'subject_name': subject_name,
                'rating': r.rating,
                'review_text': r.review_text,
                'created_at': r.created_at,
                'flag_reason': r.flag_reason or '',
                'is_flagged': r.is_flagged,
                'flag_status': 'resolved' if (r.flag_status == 'resolved' and not r.is_flagged) else 'unresolved'
            })

        for j in flagged_jobs:
            reviewer_email = j.company.creator.email if (j.company and j.company.creator) else ""
            subject_name = f"{j.title} at {j.company.name}" if j.company else j.title
            results.append({
                'id': j.id,
                'custom_id': j.job_id,
                'review_type': 'job',
                'reviewer_email': reviewer_email,
                'reviewer_name': "System Job",
                'subject_name': subject_name,
                'rating': None,
                'review_text': j.description,
                'created_at': j.created_at,
                'flag_reason': j.flag_reason or '',
                'is_flagged': j.is_flagged,
                'flag_status': 'resolved' if (j.flag_status == 'resolved' and not j.is_flagged) else 'unresolved'
            })

        for rfp in flagged_rfps:
            reviewer_email = rfp.company.creator.email if (rfp.company and rfp.company.creator) else ""
            subject_name = f"{rfp.title} by {rfp.company.name}" if rfp.company else rfp.title
            results.append({
                'id': rfp.id,
                'custom_id': rfp.rfp_id,
                'review_type': 'rfp',
                'reviewer_email': reviewer_email,
                'reviewer_name': "System RFP",
                'subject_name': subject_name,
                'rating': None,
                'review_text': rfp.description,
                'created_at': rfp.created_at,
                'flag_reason': rfp.flag_reason or '',
                'is_flagged': rfp.is_flagged,
                'flag_status': 'resolved' if (rfp.flag_status == 'resolved' and not rfp.is_flagged) else 'unresolved'
            })

        results.sort(key=lambda x: x['created_at'], reverse=True)
        return Response(results, status=status.HTTP_200_OK)

    def post(self, request):
        review_id = request.data.get('review_id')
        review_type = request.data.get('review_type')
        action = request.data.get('action')

        if not review_id or not review_type or not action:
            return Response({"error": "review_id, review_type, and action are required"}, status=status.HTTP_400_BAD_REQUEST)

        if review_type == 'company':
            model = CompanyReview
        elif review_type == 'freelancer':
            model = FreelancerReview
        elif review_type == 'job':
            model = JobOpening
        elif review_type == 'rfp':
            model = RFP
        else:
            return Response({"error": "Invalid review_type"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = model.objects.get(id=review_id)
        except model.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == 'dismiss':
            review.is_flagged = False
            review.flag_status = 'resolved'
            review.save()
            return Response({"message": "Flag dismissed successfully"}, status=status.HTTP_200_OK)

        elif action == 'edit':
            if review_type in ['company', 'freelancer']:
                review_text = request.data.get('review_text')
                rating = request.data.get('rating')
                if review_text is not None:
                    review.review_text = review_text
                if rating is not None:
                    try:
                        review.rating = int(rating)
                    except ValueError:
                        return Response({"error": "Invalid rating"}, status=status.HTTP_400_BAD_REQUEST)
            elif review_type in ['job', 'rfp']:
                description = request.data.get('review_text')
                if description is not None:
                    review.description = description
            
            review.is_flagged = False
            review.flag_status = 'resolved'
            review.save()
            return Response({"message": "Content edited and unflagged successfully"}, status=status.HTTP_200_OK)

        elif action == 'reopen':
            review.is_flagged = True
            review.flag_status = 'unresolved'
            review.save()
            return Response({"message": "Flag reopened successfully"}, status=status.HTTP_200_OK)

        elif action == 'delete':
            review.delete()
            return Response({"message": "Item deleted successfully"}, status=status.HTTP_200_OK)

        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)


class CompanyFAQViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompanyFAQSerializer

    def get_queryset(self):
        queryset = CompanyFAQ.objects.all()
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset.order_by('created_at')

    def check_company_access(self, company):
        if not can_manage_company_profile(self.request.user, company):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to manage this company's FAQs.")

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


import os
import requests
from django.conf import settings

class AIEnhanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '').strip()
        if not text:
            return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            api_key = getattr(settings, 'GEMINI_API_KEY', None)

        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                headers = {'Content-Type': 'application/json'}
                payload = {
                    "contents": [{
                        "parts": [{
                            "text": f"You are a professional editor. Rewrite, format, correct grammatical/spelling errors, and enhance the following text to make it sound professional, polished, and compelling, while keeping its original meaning and length reasonably similar. Avoid adding any introductory or concluding comments, and do not wrap the output in markdown formatting (like code blocks). Return ONLY the enhanced text:\n\n{text}"
                        }]
                    }]
                }
                response = requests.post(url, json=payload, headers=headers, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    enhanced = data['contents'][0]['parts'][0]['text'].strip()
                    # Clean up markdown code blocks if the model wrapped it anyway
                    if enhanced.startswith("```") and enhanced.endswith("```"):
                        lines = enhanced.split('\n')
                        if len(lines) > 2:
                            enhanced = '\n'.join(lines[1:-1]).strip()
                    return Response({"enhanced_text": enhanced}, status=status.HTTP_200_OK)
            except Exception as e:
                pass

        # Fallback professional polishing logic
        sentences = [s.strip().capitalize() for s in text.split('.') if s.strip()]
        enhanced_text = ". ".join(sentences)
        if enhanced_text and not enhanced_text.endswith('.'):
            enhanced_text += '.'
        if len(enhanced_text) < 45:
            enhanced_text += " Committed to driving results and collaborating effectively with the team."
        
        return Response({"enhanced_text": enhanced_text}, status=status.HTTP_200_OK)

class AdminStatsView(APIView):
    """Returns key platform statistics for the admin dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_companies = Company.objects.count()
        active_jobs = JobOpening.objects.filter(is_active=True).count()
        total_rfps = RFP.objects.count()
        flagged_count = (
            CompanyReview.objects.filter(is_flagged=True).count() +
            FreelancerReview.objects.filter(is_flagged=True).count() +
            JobOpening.objects.filter(is_flagged=True).count() +
            RFP.objects.filter(is_flagged=True).count()
        )
        return Response({
            "total_users": total_users,
            "total_companies": total_companies,
            "active_jobs": active_jobs,
            "total_rfps": total_rfps,
            "flagged_count": flagged_count,
        }, status=status.HTTP_200_OK)


class AdminUsersListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        status_filter = request.query_params.get('status', 'all').lower().strip()
        
        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        
        users = User.objects.all().order_by('-date_joined')
        
        if status_filter == 'active':
            users = users.filter(
                is_active=True
            ).filter(
                Q(last_login__gte=thirty_days_ago) |
                Q(last_login__isnull=True, date_joined__gte=thirty_days_ago)
            )
        elif status_filter == 'inactive':
            users = users.filter(
                Q(is_active=False) |
                Q(last_login__lt=thirty_days_ago) |
                Q(last_login__isnull=True, date_joined__lt=thirty_days_ago)
            )

        if query:
            users = users.filter(
                Q(email__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(phone_number__icontains=query)
            )
        
        data = []
        for u in users[:100]:
            user_type = 'Admin' if u.is_staff else 'User'
            try:
                if hasattr(u, 'profile') and u.profile and getattr(u.profile, 'is_freelancer', False):
                    user_type = 'Freelancer'
            except Exception:
                pass

            has_recent_activity = False
            if u.last_login and u.last_login >= thirty_days_ago:
                has_recent_activity = True
            elif not u.last_login and u.date_joined and u.date_joined >= thirty_days_ago:
                has_recent_activity = True

            is_user_active = bool(u.is_active and has_recent_activity)

            data.append({
                'id': u.id,
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'user_type': user_type,
                'phone_number': u.phone_number,
                'is_active': u.is_active,
                'is_user_active': is_user_active,
                'is_staff': u.is_staff,
                'date_joined': u.date_joined,
                'last_login': u.last_login,
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminCompaniesListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        status_param = request.query_params.get('status', 'all').strip().lower()
        companies = Company.objects.all().order_by('-created_at')
        if query:
            companies = companies.filter(
                Q(name__icontains=query) |
                Q(company_id__icontains=query) |
                Q(industry__icontains=query) |
                Q(location__icontains=query)
            )

        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        data = []
        for c in companies:
            recent_jobs = c.job_openings.filter(created_at__gte=thirty_days_ago).count()
            recent_rfps = c.rfps.filter(created_at__gte=thirty_days_ago).count()
            is_recently_active = (recent_jobs > 0 or recent_rfps > 0)

            if status_param == 'active' and not is_recently_active:
                continue
            if status_param == 'inactive' and is_recently_active:
                continue

            data.append({
                'id': c.id,
                'name': c.name,
                'company_id': c.company_id,
                'public_id': str(c.public_id),
                'tagline': c.tagline,
                'industry': c.industry,
                'location': c.location,
                'creator_email': c.creator.email if c.creator else None,
                'total_jobs': c.job_openings.count(),
                'total_rfps': c.rfps.count(),
                'members_count': c.members.count(),
                'is_recently_active': is_recently_active,
                'last_activity_date': c.last_activity_date,
                'recent_jobs': recent_jobs,
                'recent_rfps': recent_rfps,
                'created_at': c.created_at,
            })
            if len(data) >= 100:
                break
        return Response(data, status=status.HTTP_200_OK)



class AdminJobsListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        jobs = JobOpening.objects.select_related('company').all().order_by('-created_at')
        if query:
            jobs = jobs.filter(
                Q(title__icontains=query) |
                Q(job_id__icontains=query) |
                Q(company__name__icontains=query) |
                Q(location__icontains=query)
            )

        data = []
        for j in jobs[:100]:
            data.append({
                'id': j.id,
                'job_id': getattr(j, 'job_id', None),
                'title': j.title,
                'company_name': j.company.name if j.company else '',
                'company_public_id': str(j.company.public_id) if j.company else None,
                'job_type': j.get_job_type_display() if hasattr(j, 'get_job_type_display') else j.job_type,
                'location': j.location,
                'salary_range': j.salary_range,
                'is_active': j.is_active,
                'is_frozen': getattr(j, 'is_frozen', False),
                'is_flagged': j.is_flagged,
                'applications_count': j.applications.count(),
                'created_at': j.created_at,
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminRFPsListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        rfps = RFP.objects.select_related('company').all().order_by('-created_at')
        if query:
            rfps = rfps.filter(
                Q(title__icontains=query) |
                Q(rfp_id__icontains=query) |
                Q(company__name__icontains=query) |
                Q(category__icontains=query)
            )

        data = []
        for r in rfps[:100]:
            data.append({
                'id': r.id,
                'rfp_id': r.rfp_id,
                'title': r.title,
                'company_name': r.company.name if r.company else '',
                'company_public_id': str(r.company.public_id) if r.company else None,
                'category': r.category,
                'sub_category': r.sub_category,
                'budget': r.budget,
                'deadline': r.deadline,
                'is_active': r.is_active,
                'is_flagged': r.is_flagged,
                'interests_count': r.interests.count(),
                'created_at': r.created_at,
            })
        return Response(data, status=status.HTTP_200_OK)

