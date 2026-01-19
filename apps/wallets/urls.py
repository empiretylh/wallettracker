from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletViewSet, TransactionViewSet, ReportsViewSet

router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'reports', ReportsViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
