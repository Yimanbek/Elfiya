from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, BonusWallet, BonusSetting

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Как будут выглядеть поля в списке
    list_display = ('email', 'full_name', 'is_staff', 'is_active', 'avatar')
    list_filter = ('is_staff', 'is_active')
    
    # Поля, которые будут при создании/редактировании
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Личная информация', {'fields': ('full_name', 'phone_number', 'avatar')}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    
    # Это нужно, чтобы админка знала, какие поля использовать для создания
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password', 'is_active', 'is_staff'),
        }),
    )
    
    search_fields = ('email', 'full_name')
    ordering = ('email',)

# Остальные регистрируем как обычно
admin.site.register(BonusWallet)
admin.site.register(BonusSetting)