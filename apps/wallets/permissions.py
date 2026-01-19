from rest_framework import permissions
from .models import WalletMember


class IsWalletMember(permissions.BasePermission):
    """
    Permission to check if user is a member of the wallet.
    """
    def has_object_permission(self, request, view, obj):
        # Check if user is a member of the wallet
        return WalletMember.objects.filter(
            wallet=obj,
            user=request.user
        ).exists()


class IsWalletOwner(permissions.BasePermission):
    """
    Permission to check if user is the owner of the wallet.
    """
    def has_object_permission(self, request, view, obj):
        # Check if user is the wallet owner
        return WalletMember.objects.filter(
            wallet=obj,
            user=request.user,
            role='OWNER'
        ).exists()


class CanManageTransaction(permissions.BasePermission):
    """
    Permission for transaction management.
    - Creator can edit/delete their own transactions
    - Wallet owner can edit/delete any transaction
    """
    def has_object_permission(self, request, view, obj):
        # Safe methods (GET, HEAD, OPTIONS) allowed for wallet members
        if request.method in permissions.SAFE_METHODS:
            return WalletMember.objects.filter(
                wallet=obj.wallet,
                user=request.user
            ).exists()
        
        # Check if user is transaction creator
        if obj.created_by == request.user:
            return True
        
        # Check if user is wallet owner
        return WalletMember.objects.filter(
            wallet=obj.wallet,
            user=request.user,
            role='OWNER'
        ).exists()
