from django.urls import path
from .views import DynamicReportView

urlpatterns = [
    path('<str:report_slug>/', DynamicReportView.as_view(), name='get_report'),
]