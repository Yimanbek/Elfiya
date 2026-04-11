from rest_framework import serializers
from .models import Menu, Product, News

class ProductSerializer(serializers.ModelSerializer):
    final_price = serializers.ReadOnlyField() 

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'discount_percent', 'final_price', 'image', 'is_active', 'menu']

class MenuSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Menu
        fields = ['id', 'name', 'description', 'products']


class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ['id', 'title', 'text', 'image', 'created_at']