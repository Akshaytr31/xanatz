import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings')
django.setup()

from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import requests

user = User.objects.first()
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

response = requests.get("http://127.0.0.1:8000/api/me/", headers={"Authorization": f"Bearer {access_token}"})
print(response.status_code)
print(response.json())
