import datetime
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    accepted_privacy_policy = models.BooleanField(default=False)
    
    # We will use email for authentication
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def profile_completion_percentage(self):
        if not hasattr(self, 'profile'):
            return 0
        
        profile = self.profile
        fields_to_check = [
            profile.headline,
            profile.about,
            profile.location,
            profile.profile_picture,
            profile.cover_image,
            profile.website,
        ]
        
        filled_fields = [f for f in fields_to_check if f]
        
        # Count experiences and education
        experiences = profile.experiences.all()
        has_experience = experiences.exists()
        has_education = profile.educations.exists()
        
        # Check if any experience has a company website
        has_company_website = experiences.filter(company_website__isnull=False).exclude(company_website="").exists()
        
        # Define total "units" of completion
        # 6 profile fields + experience + education + company website = 9 units
        total_units = 9
        count = len(filled_fields)
        if has_experience: count += 1
        if has_education: count += 1
        if has_company_website: count += 1
        
        return int((count / total_units) * 100)


import uuid

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    headline = models.CharField(max_length=255, blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='cover_images/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user.email}'s Profile"


class Experience(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    current = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    company_website = models.URLField(blank=True, null=True)


    def __str__(self):
        return f"{self.title} at {self.company}"


class Education(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='educations')
    school = models.CharField(max_length=255)
    degree = models.CharField(max_length=255, blank=True, null=True)
    field_of_study = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.degree} from {self.school}"


class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_valid(self):
        return timezone.now() < self.created_at + datetime.timedelta(minutes=10)

    def __str__(self):
        return f"{self.email} - {self.otp}"


class PrivacyPolicy(models.Model):
    content = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Privacy Policies"

    def __str__(self):
        return f"Privacy Policy updated at {self.updated_at}"


# Signals to automatically create profile
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def handle_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
        else:
            Profile.objects.get_or_create(user=instance)

class Company(models.Model):
    INDUSTRY_CHOICES = [
        ('technology', 'Technology'),
        ('finance', 'Finance'),
        ('healthcare', 'Healthcare'),
        ('education', 'Education'),
        ('retail', 'Retail & E-commerce'),
        ('manufacturing', 'Manufacturing'),
        ('media', 'Media & Entertainment'),
        ('real_estate', 'Real Estate'),
        ('consulting', 'Consulting'),
        ('logistics', 'Logistics & Supply Chain'),
        ('hospitality', 'Hospitality & Tourism'),
        ('energy', 'Energy & Utilities'),
        ('other', 'Other'),
    ]

    SIZE_CHOICES = [
        ('1-10', '1–10 employees'),
        ('11-50', '11–50 employees'),
        ('51-200', '51–200 employees'),
        ('201-500', '201–500 employees'),
        ('501-1000', '501–1000 employees'),
        ('1001+', '1001+ employees'),
    ]

    name = models.CharField(max_length=255)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES, blank=True, null=True)
    company_size = models.CharField(max_length=20, choices=SIZE_CHOICES, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    founded_year = models.PositiveIntegerField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_companies')
    members = models.ManyToManyField(User, related_name='companies', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
