from django.contrib import admin
from .models import Order, OrderItem, BonusTransaction, Feedback

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product'] 
    extra = 0 

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'is_completed', 'created_at']
    list_filter = ['is_completed', 'created_at']
    inlines = [OrderItemInline]


admin.site.register(BonusTransaction)

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'order', 'is_resolved', 'created_at']
    list_filter = ['is_resolved', 'created_at']
    search_fields = ['user__phone_number', 'client_message']
    list_editable = ['is_resolved']