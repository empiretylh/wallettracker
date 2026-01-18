from rest_framework import serializers
from .models import Wallet, WalletMember, Transaction
from apps.accounts.serializers import UserSerializer


class WalletMemberSerializer(serializers.ModelSerializer):
    """Serializer for WalletMember model."""
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = WalletMember
        fields = ['id', 'wallet', 'user', 'user_id', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for Wallet model."""
    owner = UserSerializer(read_only=True)
    balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True
    )
    members = WalletMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = ['id', 'name', 'owner', 'is_shared', 'balance', 'members', 'created_at']
        read_only_fields = ['id', 'owner', 'created_at']

    def create(self, validated_data):
        # Set owner from request user
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'wallet', 'created_by', 'type', 'category',
            'amount', 'note', 'date', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def create(self, validated_data):
        # Set created_by from request user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
