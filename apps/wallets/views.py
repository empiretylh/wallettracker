from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q, Count
from django.contrib.auth import get_user_model
from datetime import datetime

from .models import Wallet, WalletMember, Transaction
from .serializers import WalletSerializer, WalletMemberSerializer, TransactionSerializer
from .permissions import IsWalletMember, IsWalletOwner, CanManageTransaction

User = get_user_model()


class WalletViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Wallet model.
    - List: Only wallets where user is a member
    - Create: Auto-set owner to current user
    - Retrieve: Only if user is a member
    - Update/Delete: Only if user is owner
    """
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only wallets where user is a member
        return Wallet.objects.filter(
            members__user=self.request.user
        ).distinct()

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'manage_members']:
            return [IsAuthenticated(), IsWalletOwner()]
        elif self.action in ['retrieve', 'invite']:
            return [IsAuthenticated(), IsWalletMember()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        """
        Invite a user to the wallet.
        POST /api/wallets/{id}/invite/
        Body: {"user_id": 1, "role": "CONTRIBUTOR"}
        """
        wallet = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'VIEWER')

        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is already a member
        if WalletMember.objects.filter(wallet=wallet, user=user).exists():
            return Response(
                {'error': 'User is already a member of this wallet'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create membership
        membership = WalletMember.objects.create(
            wallet=wallet,
            user=user,
            role=role
        )

        serializer = WalletMemberSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Transaction model.
    - List: Filter by wallet_id (only if user is member)
    - Create: Auto-set created_by to current user
    - Update/Delete: Only creator or wallet owner
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, CanManageTransaction]

    def get_queryset(self):
        queryset = Transaction.objects.all()
        
        # Filter by wallet_id if provided
        wallet_id = self.request.query_params.get('wallet_id')
        if wallet_id:
            # Only return transactions for wallets where user is a member
            queryset = queryset.filter(
                wallet_id=wallet_id,
                wallet__members__user=self.request.user
            )
        else:
            # Return all transactions for wallets where user is a member
            queryset = queryset.filter(
                wallet__members__user=self.request.user
            )
        
        return queryset.distinct()


class ReportsViewSet(viewsets.ViewSet):
    """
    ViewSet for generating financial reports.
    GET /api/reports/summary/?wallet_id=1&month=12&year=2024
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Generate summary report for a wallet.
        Query params:
        - wallet_id (required): Wallet ID
        - month (optional): Month (1-12)
        - year (optional): Year (e.g., 2024)
        """
        wallet_id = request.query_params.get('wallet_id')
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if not wallet_id:
            return Response(
                {'error': 'wallet_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user is a member of the wallet
        try:
            wallet = Wallet.objects.get(id=wallet_id)
        except Wallet.DoesNotExist:
            return Response(
                {'error': 'Wallet not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not WalletMember.objects.filter(wallet=wallet, user=request.user).exists():
            return Response(
                {'error': 'You are not a member of this wallet'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Build query filter
        transactions = Transaction.objects.filter(wallet=wallet)
        
        if year:
            transactions = transactions.filter(date__year=year)
        if month:
            transactions = transactions.filter(date__month=month)

        # Calculate totals
        income = transactions.filter(type='INCOME').aggregate(
            total=Sum('amount')
        )['total'] or 0

        expense = transactions.filter(type='EXPENSE').aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Calculate by category
        by_category = transactions.values('type', 'category').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('type', '-total')

        return Response({
            'wallet_id': wallet_id,
            'period': {
                'month': month,
                'year': year
            },
            'totals': {
                'income': income,
                'expense': expense,
                'balance': income - expense
            },
            'by_category': list(by_category)
        })

