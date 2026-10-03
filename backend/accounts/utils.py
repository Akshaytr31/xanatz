import random
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP, CompanyMember, UserActivityLog

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


def get_client_ip(request):
    """
    Safely extract client IP address from Django request headers.
    """
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_user_activity(request, user, action_type, action_title, details=None):
    """
    Helper function to record user activity logs across backend views.
    """
    try:
        ip_address = get_client_ip(request) if request else None
        user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
        
        user_email = None
        user_name = None
        
        if user and hasattr(user, 'is_authenticated') and user.is_authenticated:
            user_email = getattr(user, 'email', None)
            first_name = getattr(user, 'first_name', '') or ''
            last_name = getattr(user, 'last_name', '') or ''
            full_name = f"{first_name} {last_name}".strip()
            user_name = full_name if full_name else user_email
        elif isinstance(details, dict) and 'email' in details:
            user_email = details.get('email')
            user_name = details.get('name', user_email)
            
        UserActivityLog.objects.create(
            user=user if (user and hasattr(user, 'is_authenticated') and user.is_authenticated) else None,
            user_email=user_email,
            user_name=user_name,
            action_type=action_type,
            action_title=action_title,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
    except Exception as e:
        print(f"[ActivityLog Error] Failed to log user activity: {e}")
