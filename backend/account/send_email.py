from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from decouple import config

FRONTEND_URL = config('FRONTEND_URL')

def send_custom_email(email, token, mode='activation'):
    if mode == 'activation':
        subject = "Активация аккаунта Elfiya ✨"
        title = "Добро пожаловать в магию!"
        message = "Мы рады, что вы с нами. Остался всего один шаг, чтобы начать копить бонусы и наслаждаться вкусом."
        btn_text = "Активировать аккаунт"
        link = f"{FRONTEND_URL}/activate/{token}"
    else:
        subject = "Сброс пароля Elfiya 🔐"
        title = "Восстановление доступа"
        message = "Кто-то (надеемся, что вы) запросил сброс пароля. Нажмите кнопку ниже, чтобы установить новый."
        btn_text = "Изменить пароль"
        link = f"{FRONTEND_URL}/reset-password/{token}"

    context = {
        'title': title,
        'message': message,
        'btn_text': btn_text,
        'link': link
    }


    html_content = render_to_string('email_template.html', context)
    text_content = strip_tags(html_content)

    msg = EmailMultiAlternatives(
        subject, 
        text_content, 
        settings.DEFAULT_FROM_EMAIL, 
        [email]
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

def send_activation_email(email, token):
    send_custom_email(email, token, mode='activation')

def send_reset_password_email(email, token):
    send_custom_email(email, token, mode='reset')