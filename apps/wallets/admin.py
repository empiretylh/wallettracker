from django.contrib import admin
from .models import Wallet, WalletMember, Transaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'is_shared', 'created_at']
    list_filter = ['is_shared', 'created_at']
    search_fields = ['name', 'owner__username']


@admin.register(WalletMember)
class WalletMemberAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'user', 'role', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['wallet__name', 'user__username']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'type', 'category', 'amount', 'date', 'created_by']
    list_filter = ['type', 'date', 'created_at']
    search_fields = ['wallet__name', 'category', 'created_by__username']

