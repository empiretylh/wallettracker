from django.db import models
from django.conf import settings
from decimal import Decimal


class Wallet(models.Model):
    """
    Wallet model representing a personal or shared wallet.
    """
    name = models.CharField(max_length=200)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_wallets'
    )
    is_shared = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({'Shared' if self.is_shared else 'Personal'})"

    @property
    def balance(self):
        """Calculate wallet balance from transactions."""
        income = self.transactions.filter(type='INCOME').aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
        
        expense = self.transactions.filter(type='EXPENSE').aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
        
        return income - expense


class WalletMember(models.Model):
    """
    WalletMember model representing user permissions on a wallet.
    """
    ROLE_CHOICES = [
        ('OWNER', 'Owner'),
        ('CONTRIBUTOR', 'Contributor'),
        ('VIEWER', 'Viewer'),
    ]

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='members'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wallet_memberships'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['wallet', 'user']
        indexes = [
            models.Index(fields=['wallet', 'user']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.wallet.name} ({self.role})"


class Transaction(models.Model):
    """
    Transaction model representing income or expense in a wallet.
    """
    TYPE_CHOICES = [
        ('INCOME', 'Income'),
        ('EXPENSE', 'Expense'),
    ]

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_transactions'
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['wallet', '-date']),
            models.Index(fields=['created_by']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.type} - {self.amount} ({self.wallet.name})"

