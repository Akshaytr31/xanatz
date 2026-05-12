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

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    profile_completion_percentage = serializers.ReadOnlyField()
    companies = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'is_staff', 'is_superuser', 'profile', 'profile_completion_percentage', 'companies']

    def get_companies(self, obj):
        user_companies = Company.objects.filter(models.Q(members=obj) | models.Q(creator=obj)).distinct()
        return [{"id": c.id, "name": c.name} for c in user_companies]

class CompanySerializer(serializers.ModelSerializer):
    members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    creator = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'name', 'description', 'creator', 'members', 'created_at', 'updated_at']
