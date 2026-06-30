from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import (
    SendOTPView, VerifyOTPView, RegisterUserView, GoogleLoginView, 
    PrivacyPolicyView, UserProfileView, ExperienceViewSet, EducationViewSet, PortfolioProjectViewSet,
    CompanyViewSet, PublicProfileView, UserSearchView, JobOpeningViewSet, JobApplicationViewSet,
    RFPViewSet, RFPInterestViewSet, JobPostPlanViewSet, NotificationViewSet, MessageViewSet
)

router = DefaultRouter()
router.register(r'experience', ExperienceViewSet, basename='experience')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'portfolio-projects', PortfolioProjectViewSet, basename='portfolio-project')
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'jobs', JobOpeningViewSet, basename='jobs')
router.register(r'applications', JobApplicationViewSet, basename='applications')
router.register(r'rfps', RFPViewSet, basename='rfps')
router.register(r'rfp-interests', RFPInterestViewSet, basename='rfp-interests')
router.register(r'plans', JobPostPlanViewSet, basename='plans')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'messages', MessageViewSet, basename='messages')


urlpatterns = [
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/register/', RegisterUserView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('privacy-policy/', PrivacyPolicyView.as_view(), name='privacy-policy'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('public-profile/<uuid:public_id>/', PublicProfileView.as_view(), name='public_profile'),
    path('users/search/', UserSearchView.as_view(), name='user_search'),
    path('', include(router.urls)),
]
