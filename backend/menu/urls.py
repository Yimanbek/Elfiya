from django.urls import path
from . import views

urlpatterns = [
    path('menus/', views.MenuListAPIView.as_view()),
    path('menus/<int:pk>/', views.MenuDetailAPIView.as_view()),
    path('products/', views.ProductListAPIView.as_view()),
    path('products/<int:pk>/', views.ProductDetailAPIView.as_view()),
    path('news/', views.NewsListAPIView.as_view(), name='news-list'),
]