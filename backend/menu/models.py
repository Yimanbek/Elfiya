from django.db import models

class Menu(models.Model):
    name = models.CharField(max_length=50, blank=False, verbose_name='Название')
    description = models.TextField(blank=True, null=True, verbose_name='Описание категории')

    def __str__(self):
        return self.name
    

class Product(models.Model):
    menu = models.ForeignKey(
        Menu,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='В каком меню находится'
    )

    name = models.CharField(max_length=100, verbose_name='Название товара')
    description = models.TextField(verbose_name='Описания (состав)')
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name='Цена')
    discount_percent = models.PositiveIntegerField(default=0, verbose_name='Скидка (%)')
    image = models.ImageField(upload_to='products/', null=True, blank=True, verbose_name='Картинка')
    is_active = models.BooleanField(default=True, verbose_name='В наличии')
    create_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')

    def __str__(self):
        return f'{self.name} ({self.menu.name})'
    

    @property
    def final_price(self):
        if self.discount_percent > 0:
            return self.price - (self.price * self.discount_percent / 100)
        return self.price
    

class News(models.Model):
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    text = models.TextField(verbose_name='Текст новости/акции')
    image = models.ImageField(upload_to='news/', blank=True, null=True, verbose_name='Картинка')
    is_active = models.BooleanField(default=True, verbose_name='Показывать на сайте')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        ordering = ['-created_at'] # Свежие новости всегда будут первыми
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости и Акции'

    def __str__(self):
        return self.title