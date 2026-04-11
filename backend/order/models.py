from django.db import models
from django.contrib.auth import get_user_model
from menu.models import Product
from account.models import BonusWallet

User = get_user_model()

class Order(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    is_completed = models.BooleanField(default=False, verbose_name='Выдан/Завершен')    
    cashback_awarded = models.BooleanField(default=False, editable=False)
    use_bonuses = models.BooleanField(default=False, verbose_name="Списать бонусы?")
    bonuses_spent = models.PositiveIntegerField(default=0, verbose_name='Списано бонусов')
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name='Адрес (пусто = самовывоз)')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "Завершен" if self.is_completed else "Ждет"
        return f"{status} | Заказ #{self.id} от {self.user.full_name}"

class OrderItem(models.Model):
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, verbose_name='Товар')
    quantity = models.PositiveIntegerField(default=1, verbose_name='Количество')
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name='Цена за 1 шт.')

    def __str__(self):
        product_name = self.product.name if self.product else "Удаленный товар"
        return f"{product_name} x {self.quantity}"
    
    def save(self, *args, **kwargs):
        if not self.price and self.product:
            self.price = self.product.final_price
        super().save(*args, **kwargs)


class BonusTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('Earn', 'Начисление'),
        ('Spend', 'Списание'),
        ('Refund', 'Возврат'),
        ('Gift', 'Подарок от админа'),
    )

    wallet = models.ForeignKey(
        BonusWallet, 
        on_delete=models.CASCADE, 
        related_name='transactions'
    )
    
    order = models.ForeignKey(
        Order, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='bonus_transactions',
        verbose_name='Связанный заказ'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.get_transaction_type_display()} | {self.amount} ({self.wallet.user.full_name})'
    


class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks', verbose_name='Клиент')
    
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks', verbose_name='К какому заказу')
    client_message = models.TextField(verbose_name='Сообщение клиента')
    admin_reply = models.TextField(blank=True, null=True, verbose_name='Ответ администратора')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата обращения')
    is_resolved = models.BooleanField(default=False, verbose_name='Вопрос решен')

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Обращение'
        verbose_name_plural = 'Обращения клиентов'

    def __str__(self):
        status = "✅ Решено" if self.is_resolved else "🔴 Ждет ответа"
        return f"{status} | От {self.user.full_name} (Заказ #{self.order_id if self.order else 'Нет заказа'})"