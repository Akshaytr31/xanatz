import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_core.settings')
django.setup()

from accounts.models import User
from accounts.serializers import UserSerializer

user = User.objects.first()
serializer = UserSerializer(user)
try:
    print(serializer.data)
except Exception as e:
    import traceback
    traceback.print_exc()
