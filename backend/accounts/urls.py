from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    SendOTPView, VerifyOTPView, RegisterUserView, GoogleLoginView, 
    PrivacyPolicyView, UserProfileView, ExperienceViewSet, EducationViewSet
)

router = DefaultRouter()
router.register(r'experience', ExperienceViewSet, basename='experience')
router.register(r'education', EducationViewSet, basename='education')

urlpatterns = [
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/register/', RegisterUserView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('privacy-policy/', PrivacyPolicyView.as_view(), name='privacy-policy'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('', include(router.urls)),
]
