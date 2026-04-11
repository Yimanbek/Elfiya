from django.contrib import admin
from .models import User, BonusWallet, BonusSetting

admin.site.register([User, BonusWallet, BonusSetting])

