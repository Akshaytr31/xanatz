import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings')
django.setup()

from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import time

user = User.objects.first()
refresh = RefreshToken.for_user(user)

# Try refreshing the token using the endpoint
response = requests.post("http://127.0.0.1:8000/api/auth/token/refresh/", json={
    "refresh": str(refresh)
})
print("Refresh Status:", response.status_code)
if response.status_code == 200:
    print("Refresh succeeded")
else:
    print("Refresh failed:", response.text)
