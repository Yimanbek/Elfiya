from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .permissions import IsOwnerOrReadOnly
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .models import BonusWallet, BonusSetting
from .send_email import send_activation_email, send_reset_password_email
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if len(password) < 8:
            return Response({"error": "Пароль должен содержать минимум 8 символов!"}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email уже занят"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=request.data.get('password'),
            full_name=request.data.get('full_name'),
            phone_number=request.data.get('phone_number', ''),
            is_active=False
        )
        
        user.generate_verification_token()
        send_activation_email(user.email, user.verification_token)
        return Response({"message": "Ссылка для активации отправлена!"}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user_obj = User.objects.filter(email=email).first()
        if user_obj and not user_obj.is_active:
            return Response({"error": "Аккаунт не активирован. Проверьте вашу почту!"}, status=status.HTTP_403_FORBIDDEN)

        user = authenticate(email=email, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key}, status=status.HTTP_200_OK)
        return Response({"error": "Неверный Email или пароль"}, status=status.HTTP_400_BAD_REQUEST)
    

class ActivateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        user = User.objects.filter(verification_token=token).first()
        
        if user:
            user.is_active = True
            user.verification_token = None 
            user.save()
            return Response({"message": "Аккаунт успешно активирован!"}, status=status.HTTP_200_OK)
            
        return Response({"error": "Ссылка недействительна или уже использована"}, status=status.HTTP_400_BAD_REQUEST)


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = User.objects.filter(email=request.data.get('email')).first()
        if user:
            user.generate_verification_token()
            send_reset_password_email(user.email, user.verification_token)
            
        return Response({"message": "Если Email существует, мы отправили ссылку!"}, status=status.HTTP_200_OK)


class ConfirmPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        user = User.objects.filter(verification_token=token).first()
        if user:
            user.set_password(new_password)
            user.clear_verification_token()
            user.save()
            return Response({"message": "Пароль успешно изменен!"}, status=status.HTTP_200_OK)
            
        return Response({"error": "Ссылка устарела или недействительна"}, status=status.HTTP_400_BAD_REQUEST)



class CurrentUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user 
        
        try:
            wallet = BonusWallet.objects.get(user=user)
            balance = wallet.balance
        except BonusWallet.DoesNotExist:
            balance = 0

        return Response({
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "wallet_balance": balance, 
            "is_staff": user.is_staff,
            "avatar": user.avatar.url if user.avatar else None
        })
    
@api_view(['GET'])
def get_bonus_setting(request):
    setting = BonusSetting.load()
    
    return Response({
        "cashback_percent":setting.cashback_percent
    })

class WalletView(APIView):
    permission_classes = [IsOwnerOrReadOnly]

    def get_object(self, pk):
        try:
            return BonusWallet.objects.get(pk = pk)
        except BonusWallet.DoesNotExist:
            return None
        
    def get(self, request, pk):
        wallet = self.get_object(pk)

        if not wallet:
            return Response({"error":"Кашелек не найден"}, status=404)
    
        self.check_object_permissions(request, wallet)
        return Response({"balance": wallet.balance, "username": wallet.user.full_name})
    


class ProfileEditRawView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] 

    def patch(self, request):
        user = request.user
        
        user.full_name = request.data.get('full_name', user.full_name)
        user.phone_number = request.data.get('phone_number', user.phone_number)
        
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']
            
        user.save()
        
        return Response({
            "message": "Профиль обновлен",
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "avatar": user.avatar.url if user.avatar else None 
        })


