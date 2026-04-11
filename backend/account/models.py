from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен!')
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, full_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, verbose_name='Email')
    phone_number = models.CharField(max_length=15, blank=True, null=True, verbose_name='Номер телефона')
    full_name = models.CharField(max_length=50, verbose_name='ФИО')
    
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    verification_token = models.CharField(max_length=100, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def generate_verification_token(self):
        self.verification_token = uuid.uuid4().hex
        self.save(update_fields=['verification_token'])

    def clear_verification_token(self):
        self.verification_token = None
        self.save(update_fields=['verification_token'])

    def __str__(self):
        return f"{self.full_name} ({self.email})"
    

class BonusWallet(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='bonus_wallet',
        verbose_name='Владелец'
    )

    balance = models.DecimalField(
            max_digits=10, 
            decimal_places=2, 
            default=0, 
            verbose_name='Баланс (1 балл = 1 сом)'
        )
    def __str__(self):
        return f'{self.user.full_name}, Бонусы - ({self.balance})'


class BonusSetting(models.Model):
    cashback_percent = models.PositiveIntegerField(
        default=5, 
        verbose_name='Процент кэшбека (начисляется от суммы реальных денег)'
    )

    def save(self, *args, **kwargs):
        self.pk = 1 
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass 

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    class Meta:
        verbose_name = 'Настройка бонусов'
        verbose_name_plural = 'Настройки бонусов'

    def __str__(self):
        return f"Текущий кэшбек: {self.cashback_percent}%"