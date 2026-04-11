from django.contrib import admin
from .models import Menu, Product, News

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'menu', 'price', 'is_active')
    list_filter = ('menu', 'is_active')
    search_fields = ('name',)


admin.site.register(News)