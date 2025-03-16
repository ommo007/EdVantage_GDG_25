from django.db import models
from django.contrib.auth.models import User

class ModelInference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inferences')
    prompt = models.TextField()
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    model_version = models.CharField(max_length=50)
    inference_time = models.FloatField()  # in seconds

    def __str__(self):
        return f"{self.user.username} - {self.created_at}"

class ModelCheckpoint(models.Model):
    name = models.CharField(max_length=100)
    file_path = models.CharField(max_length=255)
    model_type = models.CharField(max_length=50)  # e.g., 'gpt2', 'gpt2-medium'
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} ({self.model_type})"