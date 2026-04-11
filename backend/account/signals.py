from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import BonusWallet
from order.models import BonusTransaction

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_bonus_wallet(sender, instance, created, **kwargs):
    if created:
        BonusWallet.objects.create(user=instance)


@receiver(post_save, sender=BonusTransaction)
def update_wallet_on_transaction(sender, instance, created, **kwargs):
    if created:
        wallet = instance.wallet
        
        if instance.transaction_type in ['Earn', 'Refund', 'Gift']:
            wallet.balance += instance.amount
            
        elif instance.transaction_type == 'Spend':
            wallet.balance -= instance.amount
            
        wallet.save()