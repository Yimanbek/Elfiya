from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.http import Http404
from .models import Order, Feedback, BonusTransaction
from .serializers import OrderSerializer, FeedbackSerializer, BonusTransactionSerializer
from rest_framework.decorators import api_view, permission_classes

class OrderListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Order.objects.get(pk=pk, user=user)
        except Order.DoesNotExist:
            raise Http404

    def get(self, request, pk):
        order = self.get_object(pk, request.user)
        serializer = OrderSerializer(order)
        return Response(serializer.data)


class FeedbackListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        feedbacks = Feedback.objects.filter(user=request.user)
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BonusTransactionListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = BonusTransaction.objects.filter(
            wallet__user=request.user
        ).order_by('-created_at')[:10]
        
        serializer = BonusTransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def complete_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
        order.is_completed = True
        order.save()
        return Response({"message": "Заказ выдан!"}, status=200)
    except Order.DoesNotExist:
        return Response({"error": "Заказ не найден"}, status=404)