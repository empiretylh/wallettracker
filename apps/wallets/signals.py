from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Wallet, WalletMember


@receiver(post_save, sender=Wallet)
def create_wallet_owner_membership(sender, instance, created, **kwargs):
    """
    Automatically create OWNER membership when a wallet is created.
    """
    if created:
        WalletMember.objects.create(
            wallet=instance,
            user=instance.owner,
            role='OWNER'
        )
