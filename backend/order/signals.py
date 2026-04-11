from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, BonusTransaction
from account.models import BonusSetting

@receiver(post_save, sender=Order)
def award_cashback_on_completion(sender, instance, **kwargs):
    if instance.is_completed and not instance.cashback_awarded:
        
        total_items_price = sum(item.price * item.quantity for item in instance.items.all())
        real_money_paid = total_items_price - instance.bonuses_spent
        
        if real_money_paid > 0:
            settings = BonusSetting.load()
            cashback_amount = (real_money_paid * settings.cashback_percent) / 100
         
            if cashback_amount > 0:
                wallet = instance.user.bonus_wallet
                
                BonusTransaction.objects.create(
                    wallet=wallet,
                    order=instance,
                    amount=cashback_amount,
                    transaction_type='Earn',
                    description=f'Кэшбек {settings.cashback_percent}% за заказ #{instance.id}'
                )
                
        Order.objects.filter(pk=instance.pk).update(cashback_awarded=True)