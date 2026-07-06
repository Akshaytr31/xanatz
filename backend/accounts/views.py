from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import OTP, User, PrivacyPolicy, Profile, Experience, Education, Company, CompanyMember, JobOpening, JobApplication, RFP, RFPInterest, JobPostPlan, CompanySubscription, Notification, Message, PortfolioProject, CompanyReview
from .serializers import (
    SendOTPSerializer, VerifyOTPSerializer, RegisterUserSerializer, 
    PrivacyPolicySerializer, UserSerializer, ProfileSerializer,
    ExperienceSerializer, EducationSerializer, CompanySerializer,
    UserSearchSerializer, JobOpeningSerializer, JobApplicationSerializer,
    RFPSerializer, RFPInterestSerializer, JobPostPlanSerializer, CompanySubscriptionSerializer, NotificationSerializer, MessageSerializer,
    PortfolioProjectSerializer, PublicCompanySerializer, CompanyReviewSerializer
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

    @action(detail=True, methods=['post'])
    def subscribe_plan(self, request, pk=None):
        """Activate a job posting plan for this company (test mode — no payment)."""
        company = self.get_object()
        # Only owner/admin can subscribe
        is_owner = company.creator == request.user
        is_admin = CompanyMember.objects.filter(company=company, user=request.user, access_role='admin').exists()
        if not (is_owner or is_admin):
            return Response({"error": "Only the owner or admin can manage subscriptions."}, status=status.HTTP_403_FORBIDDEN)

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
        company_id = self.request.query_params.get('company_id')

        if company_id:
            queryset = queryset.filter(company_id=company_id)
            try:
                company = Company.objects.get(id=company_id)
                is_owner = self.request.user.is_authenticated and company.creator == self.request.user
                is_admin = self.request.user.is_authenticated and CompanyMember.objects.filter(
                    company=company, user=self.request.user, access_role='admin'
                ).exists()
                if not (is_owner or is_admin):
                    queryset = queryset.filter(is_active=True)
            except Company.DoesNotExist:
                queryset = queryset.filter(is_active=True)
        else:
            # Candidate/user dashboard: only show active and non-expired jobs
            queryset = queryset.filter(
                is_active=True
            ).filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
            )

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
        job_opening = serializer.validated_data.get('job_opening')
        if job_opening and job_opening.is_expired:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"error": "Cannot apply to an expired job opening."})
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
        serializer.save(reviewer=self.request.user, company=company, company_name=company_name)

