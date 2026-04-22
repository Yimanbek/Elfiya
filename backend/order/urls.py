from django.urls import path
from . import views

urlpatterns = [
    path('orders/', views.OrderListAPIView.as_view()),
    path('orders/<int:pk>/', views.OrderDetailAPIView.as_view()),
    path('feedbacks/', views.FeedbackListCreateAPIView.as_view()),
    path('bonus-transactions/', views.BonusTransactionListAPIView.as_view(), name='bonus-transactions'),
    path('orders/<int:pk>/complete/', views.complete_order, name = 'order-complete'),
    path('orders-chdash/', views.get_orders)
]
