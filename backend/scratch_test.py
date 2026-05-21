import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings')
django.setup()

from accounts.models import JobApplication, User
from accounts.serializers import JobApplicationSerializer

user = User.objects.get(email='user1@gmail.com')
apps = JobApplication.objects.filter(applicant=user)
serializer = JobApplicationSerializer(apps, many=True)
print("APP DATA:")
print(serializer.data)
