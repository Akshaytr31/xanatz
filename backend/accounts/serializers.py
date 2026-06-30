from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import PrivacyPolicy, Profile, Experience, Education, Company, OTP, JobOpening, JobApplication, RFP, RFPInterest, JobPostPlan, CompanySubscription, Notification, Message, PortfolioProject

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer that uses 'email' instead of 'username'."""
    username_field = User.USERNAME_FIELD  # resolves to 'email'


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def create(self, validated_data):
        email = validated_data.get('email')
        otp_code = str(random.randint(100000, 999999))
        
        # Save OTP to database
        otp_instance = OTP.objects.create(email=email, otp=otp_code)
        
        # Send OTP via email
        try:
            send_mail(
                'Your Xanatz OTP Code',
                f'Your OTP code is {otp_code}. It will expire in 10 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {e}")
            # In a real app, you might want to handle this differently
        
        return otp_instance

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data.get('email')
        otp_code = data.get('otp')
        
        otp_instance = OTP.objects.filter(email=email, otp=otp_code, is_verified=False).order_by('-created_at').first()
        
        if not otp_instance or not otp_instance.is_valid():
            raise serializers.ValidationError("Invalid or expired OTP.")
        
        # Mark as verified
        otp_instance.is_verified = True
        otp_instance.save()
        
        return data

class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name', 'phone_number', 'accepted_privacy_policy']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if not data.get('accepted_privacy_policy', False):
            raise serializers.ValidationError({"accepted_privacy_policy": "You must accept the privacy policy."})
        
        # Check if email is verified via OTP
        email = data.get('email')
        otp_instance = OTP.objects.filter(email=email, is_verified=True).order_by('-created_at').first()
        if not otp_instance or not otp_instance.is_valid():
            raise serializers.ValidationError({"email": "Email verification expired or not found. Please verify your email first."})
            
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user



class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        extra_kwargs = {'profile': {'required': False}}

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'
        extra_kwargs = {'profile': {'required': False}}

class PortfolioProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProject
        fields = '__all__'
        extra_kwargs = {'profile': {'required': False}}

    def validate_technologies(self, value):
        if isinstance(value, str):
            import json
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                value = [t.strip() for t in value.split(',') if t.strip()]
        return value

class ProfileSerializer(serializers.ModelSerializer):
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    projects = PortfolioProjectSerializer(many=True, read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'public_id', 'headline', 'about', 'location', 'profile_picture', 
            'cover_image', 'website', 'skills', 'experiences', 'educations',
            'is_freelancer', 'hourly_rate', 'freelancer_currency', 
            'freelancer_availability', 'projects'
        ]


class PrivacyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyPolicy
        fields = ['id', 'content', 'updated_at', 'created_at']
        read_only_fields = ['id', 'updated_at', 'created_at']

class UserSearchSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    headline = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'profile_picture', 'headline']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'profile') and obj.profile.profile_picture:
            if request:
                return request.build_absolute_uri(obj.profile.profile_picture.url)
            return obj.profile.profile_picture.url
        return None

    def get_headline(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.headline
        return None

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    profile_completion_percentage = serializers.ReadOnlyField()
    companies = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'is_staff', 'is_superuser', 'profile', 'profile_completion_percentage', 'companies']

    def get_companies(self, obj):
        from .models import CompanyMember
        user_companies = Company.objects.filter(models.Q(members=obj) | models.Q(creator=obj)).distinct()
        result = []
        for c in user_companies:
            is_owner = c.creator_id == obj.id
            access_role = 'owner' if is_owner else None
            if not is_owner:
                membership = CompanyMember.objects.filter(company=c, user=obj).first()
                access_role = membership.access_role if membership else 'member'
            result.append({"id": c.id, "name": c.name, "is_owner": is_owner, "access_role": access_role})
        return result

class CompanySerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    members_details = serializers.SerializerMethodField()
    creator = serializers.PrimaryKeyRelatedField(read_only=True)
    creator_name = serializers.SerializerMethodField()
    logo_url = serializers.SerializerMethodField()
    active_subscription = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'tagline', 'description', 'logo', 'logo_url',
            'website', 'industry', 'company_size', 'location', 'founded_year',
            'linkedin_url', 'twitter_url', 'is_active',
            'creator', 'creator_name', 'members', 'members_details',
            'active_subscription', 'created_at', 'updated_at',
        ]

    def get_members_details(self, obj):
        request = self.context.get('request')
        details = []
        for company_member in obj.company_members.select_related('user', 'user__profile').all():
            member = company_member.user
            # Ensure every member has a profile (handles Google OAuth users created before signal)
            profile, _ = Profile.objects.get_or_create(user=member)
            profile_pic = None
            if profile.profile_picture:
                if request:
                    profile_pic = request.build_absolute_uri(profile.profile_picture.url)
                else:
                    profile_pic = profile.profile_picture.url
            details.append({
                'id': member.id,
                'first_name': member.first_name,
                'last_name': member.last_name,
                'email': member.email,
                'profile_picture': profile_pic,
                'public_id': str(profile.public_id),
                'headline': profile.headline,
                'access_role': company_member.access_role,
                'position': company_member.position
            })
        return details

    def get_creator_name(self, obj):
        if obj.creator:
            return f"{obj.creator.first_name} {obj.creator.last_name}".strip() or obj.creator.email
        return None

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None

    def get_active_subscription(self, obj):
        sub = obj.subscriptions.filter(is_active=True).first()
        if sub:
            return {
                'id': sub.id,
                'plan_name': sub.plan.name,
                'plan_display_name': sub.plan.display_name,
                'max_jobs': sub.plan.max_jobs,
                'jobs_used': sub.jobs_used,
                'jobs_remaining': sub.jobs_remaining,
                'job_duration_days': sub.plan.job_duration_days,
                'activated_at': sub.activated_at,
                'is_credits_exhausted': sub.is_credits_exhausted,
            }
        return None


class JobOpeningSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    company_logo_url = serializers.SerializerMethodField()
    industry = serializers.ReadOnlyField(source='company.industry')
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = JobOpening
        fields = [
            'id', 'company', 'company_name', 'company_logo_url', 'industry',
            'title', 'description', 'requirements', 'location',
            'job_type', 'salary_range',
            'is_active', 'expires_at', 'is_expired', 'created_at', 'updated_at'
        ]

    def get_company_logo_url(self, obj):
        request = self.context.get('request')
        if obj.company.logo and request:
            return request.build_absolute_uri(obj.company.logo.url)
        return None

    def get_is_expired(self, obj):
        return obj.is_expired


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.ReadOnlyField(source='job_opening.title')
    company_name = serializers.ReadOnlyField(source='job_opening.company.name')
    applicant_email = serializers.ReadOnlyField(source='applicant.email')

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job_opening', 'job_title', 'company_name', 'applicant', 'applicant_email',
            'full_name', 'email', 'cover_letter', 'resume', 'portfolio_url', 'key_skills', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['applicant']


class RFPSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.name')
    company_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = RFP
        fields = [
            'id', 'company', 'company_name', 'company_logo_url',
            'title', 'description', 'requirements', 'budget',
            'deadline', 'category', 'sub_category', 'is_active', 'created_at', 'updated_at'
        ]

    def get_company_logo_url(self, obj):
        request = self.context.get('request')
        if obj.company.logo and request:
            return request.build_absolute_uri(obj.company.logo.url)
        return None


class RFPInterestSerializer(serializers.ModelSerializer):
    rfp_title = serializers.ReadOnlyField(source='rfp.title')
    rfp_company_name = serializers.ReadOnlyField(source='rfp.company.name')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = RFPInterest
        fields = [
            'id', 'rfp', 'rfp_title', 'rfp_company_name', 'user', 'user_email',
            'company_name', 'email', 'phone_number', 'proposal_summary',
            'attached_file', 'status', 'created_at'
        ]
        read_only_fields = ['user']


class JobPostPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPostPlan
        fields = ['id', 'name', 'display_name', 'price', 'max_jobs', 'job_duration_days', 'description', 'features', 'is_active']


class CompanySubscriptionSerializer(serializers.ModelSerializer):
    plan_details = JobPostPlanSerializer(source='plan', read_only=True)
    jobs_remaining = serializers.ReadOnlyField()
    is_credits_exhausted = serializers.ReadOnlyField()

    class Meta:
        model = CompanySubscription
        fields = ['id', 'company', 'plan', 'plan_details', 'jobs_used', 'jobs_remaining', 'is_credits_exhausted', 'activated_at', 'is_active']
        read_only_fields = ['company', 'jobs_used', 'activated_at']


class NotificationSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source='sender.email')
    sender_name = serializers.SerializerMethodField()
    sender_profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'sender_email', 'sender_name', 'sender_profile_picture', 'message', 'is_read', 'created_at', 'target_url']
        read_only_fields = ['id', 'recipient', 'sender', 'created_at']

    def get_sender_name(self, obj):
        if not obj.sender:
            return None
        name = f"{obj.sender.first_name or ''} {obj.sender.last_name or ''}".strip()
        return name or obj.sender.email

    def get_sender_profile_picture(self, obj):
        if not obj.sender:
            return None
        request = self.context.get('request')
        if hasattr(obj.sender, 'profile') and obj.sender.profile.profile_picture:
            if request:
                return request.build_absolute_uri(obj.sender.profile.profile_picture.url)
            return obj.sender.profile.profile_picture.url
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source='sender.email')
    recipient_email = serializers.ReadOnlyField(source='recipient.email')
    sender_name = serializers.SerializerMethodField()
    recipient_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_email', 'sender_name', 'recipient', 'recipient_email', 'recipient_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']

    def get_sender_name(self, obj):
        name = f"{obj.sender.first_name or ''} {obj.sender.last_name or ''}".strip()
        return name or obj.sender.email

    def get_recipient_name(self, obj):
        name = f"{obj.recipient.first_name or ''} {obj.recipient.last_name or ''}".strip()
        return name or obj.recipient.email
