from rest_framework import serializers
from .models import Order, OrderItem, BonusTransaction, Feedback
from account.models import BonusWallet

class OrderItemSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product','product_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'is_completed', 'bonuses_spent', 'address', 'created_at', 'items', 'use_bonuses']
        read_only_fields = ['user', 'is_completed', 'created_at', 'bonuses_spent']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        wallet = BonusWallet.objects.get(user = validated_data['user'])
        
        order = Order.objects.create(**validated_data)
        
        total_order_price = 0 
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            price = product.final_price 
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price 
            )
            
            total_order_price += (price * quantity)
            
        if order.use_bonuses and wallet.balance > 0:
            bonuses_spent = min(wallet.balance, total_order_price)
            
            order.bonuses_spent = bonuses_spent
            order.save()
           

            BonusTransaction.objects.create(
                wallet=wallet,
                order=order,
                amount=bonuses_spent,
                transaction_type='Spend',
                description='Авто-списание бонусов при заказе'
            )
            
        return order
    
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'user', 'order', 'client_message', 'admin_reply', 'created_at', 'is_resolved']
        read_only_fields = ['user', 'admin_reply', 'created_at', 'is_resolved']

class BonusTransactionSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)

    class Meta:
        model = BonusTransaction
        fields = ['id', 'amount', 'transaction_type', 'type_display', 'description', 'created_at']