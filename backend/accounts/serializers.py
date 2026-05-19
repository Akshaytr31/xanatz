from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from django.core.mail import send_mail
from django.conf import settings
import random
from .models import PrivacyPolicy, Profile, Experience, Education, Company, OTP

User = get_user_model()

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

class ProfileSerializer(serializers.ModelSerializer):
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Profile
        fields = ['public_id', 'headline', 'about', 'location', 'profile_picture', 'cover_image', 'website', 'skills', 'experiences', 'educations']

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

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'tagline', 'description', 'logo', 'logo_url',
            'website', 'industry', 'company_size', 'location', 'founded_year',
            'linkedin_url', 'twitter_url', 'is_active',
            'creator', 'creator_name', 'members', 'members_details', 'created_at', 'updated_at',
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
