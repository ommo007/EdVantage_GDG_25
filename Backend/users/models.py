from django.contrib.auth.models import AbstractUser
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=[
        ('student', 'Student'),
        ('instructor', 'Instructor'),
    ])
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return self.user.username