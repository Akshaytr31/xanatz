import random
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP

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
