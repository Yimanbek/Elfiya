from django.contrib import admin
from django import forms
from .models import User, BonusWallet, BonusSetting

# Простейшая форма создания
class UserCreateForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, label="Пароль")
    
    class Meta:
        model = User
        fields = ('email', 'full_name', 'password', 'is_active', 'is_staff', 'is_superuser')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"]) # Хэшируем пароль!
        if commit:
            user.save()
        return user

@admin.register(User)
class UserAdmin(admin.ModelAdmin): # Используем обычный ModelAdmin!
    list_display = ('email', 'full_name', 'is_staff', 'is_active')
    
    # Форма, которая будет использоваться только при СОЗДАНИИ
    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            return UserCreateForm
        return super().get_form(request, obj, **kwargs)

    # Поля при редактировании существующего юзера
    fields = ('email', 'full_name', 'phone_number', 'avatar', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')

admin.site.register(BonusWallet)
admin.site.register(BonusSetting)
