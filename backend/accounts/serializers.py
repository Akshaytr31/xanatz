from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

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
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

from .models import PrivacyPolicy, Profile, Experience, Education, Company

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
        user_companies = Company.objects.filter(models.Q(members=obj) | models.Q(creator=obj)).distinct()
        return [{"id": c.id, "name": c.name, "is_owner": c.creator_id == obj.id} for c in user_companies]

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
            profile_pic = None
            if hasattr(member, 'profile') and member.profile.profile_picture:
                if request:
                    profile_pic = request.build_absolute_uri(member.profile.profile_picture.url)
                else:
                    profile_pic = member.profile.profile_picture.url
            details.append({
                'id': member.id,
                'first_name': member.first_name,
                'last_name': member.last_name,
                'email': member.email,
                'profile_picture': profile_pic,
                'public_id': str(member.profile.public_id) if hasattr(member, 'profile') else None,
                'headline': member.profile.headline if hasattr(member, 'profile') else None,
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
