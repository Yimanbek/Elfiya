from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.CurrentUserProfileView.as_view(), name='profile'),
    path('cashback-percent/', views.get_bonus_setting),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('activate/<str:token>/', views.ActivateView.as_view(), name='activate'),
    path('password-reset/', views.RequestPasswordResetView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', views.ConfirmPasswordResetView.as_view(), name='password-reset-confirm'),
    path('profile-edit/', views.ProfileEditRawView.as_view())
]