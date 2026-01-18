from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

