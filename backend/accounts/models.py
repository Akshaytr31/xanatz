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
    is_freelancer = models.BooleanField(default=False)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    freelancer_currency = models.CharField(max_length=10, default='USD')
    freelancer_availability = models.CharField(max_length=20, default='available')

    def __str__(self):
        return f"{self.user.email}'s Profile"


class PortfolioProject(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='portfolio_projects/', blank=True, null=True)
    project_url = models.URLField(blank=True, null=True)
    technologies = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.title} for {self.profile.user.email}"



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

class CompanyMember(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='company_memberships')
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='company_members')
    access_role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    position = models.CharField(max_length=255, blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'company')

    def __str__(self):
        return f"{self.user.email} - {self.company.name} ({self.access_role})"

def generate_company_id(pk):
    if not pk or pk < 1:
        return "0001"
    digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    n = pk
    res = []
    while n > 0:
        n, remainder = divmod(n, 36)
        res.append(digits[remainder])
    code = "".join(reversed(res))
    return code.zfill(4)


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
    company_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
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
    members = models.ManyToManyField(User, through='CompanyMember', related_name='companies', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.company_id:
            self.company_id = generate_company_id(self.pk)
            super().save(update_fields=['company_id'])


class JobOpening(models.Model):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('remote', 'Remote'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='job_openings')
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES, default='full_time')
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True, null=True)
    job_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_expired(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False

    def __str__(self):
        return f"{self.title} at {self.company.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.job_id:
            if self.company:
                if not self.company.company_id:
                    self.company.save()
                cid = self.company.company_id
            else:
                cid = "0000"
            self.job_id = f"JOB-{cid}-{self.pk:06d}"
            super().save(update_fields=['job_id'])


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('reviewed', 'Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
    ]

    job_opening = models.ForeignKey(JobOpening, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_applications')
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    cover_letter = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    key_skills = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='applied')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} for {self.job_opening.title}"


class RFP(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='rfps')
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.CharField(max_length=100, blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    sub_category = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True, null=True)
    rfp_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.company.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.rfp_id:
            if self.company:
                if not self.company.company_id:
                    self.company.save()
                cid = self.company.company_id
            else:
                cid = "0000"
            self.rfp_id = f"RFP-{cid}-{self.pk:06d}"
            super().save(update_fields=['rfp_id'])


class RFPInterest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    rfp = models.ForeignKey(RFP, on_delete=models.CASCADE, related_name='interests')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rfp_interests')
    company_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    proposal_summary = models.TextField()
    attached_file = models.FileField(upload_to='rfp_proposals/', blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    is_reviewed = models.BooleanField(default=False)
    quotation_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Interest ({self.quotation_id or self.pk}) in {self.rfp.title} by {self.user.email} ({self.status})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.quotation_id:
            company = None
            if hasattr(self.user, 'created_companies') and self.user.created_companies.exists():
                company = self.user.created_companies.first()
            elif hasattr(self.user, 'companies') and self.user.companies.exists():
                company = self.user.companies.first()

            if company:
                if not company.company_id:
                    company.save()
                cid = company.company_id
            else:
                cid = f"USR{self.user.pk:04d}"

            self.quotation_id = f"QTN-{cid}-{self.pk:05d}"
            super().save(update_fields=['quotation_id'])


class JobPostPlan(models.Model):
    PLAN_CHOICES = [
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
    ]

    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_jobs = models.PositiveIntegerField()
    job_duration_days = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['price']

    def __str__(self):
        return f"{self.display_name} - ₹{self.price}"


class CompanySubscription(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(JobPostPlan, on_delete=models.CASCADE, related_name='subscriptions')
    jobs_used = models.PositiveIntegerField(default=0)
    activated_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    @property
    def jobs_remaining(self):
        return max(0, self.plan.max_jobs - self.jobs_used)

    @property
    def is_credits_exhausted(self):
        return self.jobs_used >= self.plan.max_jobs

    class Meta:
        ordering = ['-activated_at']

    def __str__(self):
        return f"{self.company.name} - {self.plan.display_name} ({self.jobs_used}/{self.plan.max_jobs} used)"


class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    target_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.email}: {self.message[:30]}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Message from {self.sender.email} to {self.recipient.email}: {self.content[:35]}'


class CompanyReview(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='company_reviews')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True, related_name='reviews')
    rfp_interest = models.ForeignKey(RFPInterest, on_delete=models.SET_NULL, null=True, blank=True, related_name='company_reviews')
    company_name = models.CharField(max_length=255)
    rating = models.PositiveIntegerField()
    review_text = models.TextField()
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True, null=True)
    review_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.company_name} by {self.reviewer.email} ({self.rating} stars)"

    def save(self, *args, **kwargs):
        if not self.company and self.company_name:
            self.company = Company.objects.filter(name__iexact=self.company_name.strip()).first()
        super().save(*args, **kwargs)
        if not self.review_id:
            self.review_id = f"RIV-{self.pk:05d}"
            super().save(update_fields=['review_id'])
        if self.rfp_interest:
            self.rfp_interest.is_reviewed = True
            self.rfp_interest.save(update_fields=['is_reviewed'])


class FreelancerReview(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_freelancer_reviews')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='freelancer_reviews')
    rfp_interest = models.ForeignKey(RFPInterest, on_delete=models.SET_NULL, null=True, blank=True, related_name='freelancer_reviews')
    rating = models.PositiveIntegerField()
    review_text = models.TextField()
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True, null=True)
    review_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.freelancer.email} by {self.reviewer.email} ({self.rating} stars)"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.review_id:
            self.review_id = f"RIV-{self.pk:05d}"
            super().save(update_fields=['review_id'])
        if self.rfp_interest:
            self.rfp_interest.is_reviewed = True
            self.rfp_interest.save(update_fields=['is_reviewed'])


@receiver(post_save, sender=Company)
def link_company_reviews(sender, instance, created, **kwargs):
    if created:
        CompanyReview.objects.filter(
            company_name__iexact=instance.name,
            company__isnull=True
        ).update(company=instance)


class CompanyFAQ(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=255)
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.question} - {self.company.name}"


