import random
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP, CompanyMember

def generate_and_send_otp(email):
    # Generate 6 digit OTP
    otp_code = str(random.randint(100000, 999999))
    
    # Save OTP to database
    otp_record = OTP.objects.create(email=email, otp=otp_code)
    
    # Send email
    subject = "Your OTP Verification Code"
    message = f"Your verification code is: {otp_code}\nThis code is valid for 10 minutes."
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )
    
    return otp_record


def get_user_company_role(user, company):
    if not user or not user.is_authenticated or not company:
        return None
    if company.creator_id == user.id:
        return 'super_admin'
    member = CompanyMember.objects.filter(company=company, user=user).first()
    if member:
        return member.access_role
    return None

def can_manage_company_roles(user, company):
    role = get_user_company_role(user, company)
    return role in ['super_admin', 'admin']

def can_assign_super_admin(user, company):
    role = get_user_company_role(user, company)
    return role == 'super_admin'

def can_manage_company_profile(user, company):
    role = get_user_company_role(user, company)
    return role in ['super_admin', 'admin']

def can_manage_company_hr(user, company):
    role = get_user_company_role(user, company)
    return role in ['super_admin', 'admin', 'hr']

def can_manage_company_accounting(user, company):
    role = get_user_company_role(user, company)
    return role in ['super_admin', 'admin', 'accountant']

def can_manage_company_rfp(user, company):
    role = get_user_company_role(user, company)
    return role in ['super_admin', 'admin']

