from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ModelInference, ModelCheckpoint
from .serializers import ModelInferenceSerializer, ModelCheckpointSerializer
from .gpt2_model import get_model_instance, InferenceConfig
import os

class ModelInferenceViewSet(viewsets.ModelViewSet):
    serializer_class = ModelInferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ModelInference.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        prompt = request.data.get('prompt')
        if not prompt:
            return Response(
                {'error': 'Prompt is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get active model checkpoint
        checkpoint = ModelCheckpoint.objects.filter(is_active=True).first()
        
        # Configure model
        config = InferenceConfig(
            model_type=checkpoint.model_type if checkpoint else 'gpt2',
            checkpoint_path=checkpoint.file_path if checkpoint else None
        )
        
        # Get model instance and generate
        model = get_model_instance(config)
        output_text, inference_time = model.generate(prompt)

        # Save inference record
        inference = ModelInference.objects.create(
            user=request.user,
            prompt=prompt,
            response=output_text,
            model_version=config.model_type,
            inference_time=inference_time
        )

        return Response({
            'response': output_text,
            'inference_time': inference_time
        })

class ModelCheckpointViewSet(viewsets.ModelViewSet):
    queryset = ModelCheckpoint.objects.all()
    serializer_class = ModelCheckpointSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        checkpoint = self.get_object()
        ModelCheckpoint.objects.all().update(is_active=False)
        checkpoint.is_active = True
        checkpoint.save()
        return Response({'status': 'Checkpoint activated'})