from rest_framework import serializers
from .models import ModelInference, ModelCheckpoint

class ModelInferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelInference
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'inference_time')

class ModelCheckpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelCheckpoint
        fields = '__all__'