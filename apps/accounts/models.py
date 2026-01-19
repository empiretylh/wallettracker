from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom User model extending AbstractUser.
    Email is required and must be unique.
    """
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username

