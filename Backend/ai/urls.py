from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModelInferenceViewSet, ModelCheckpointViewSet

router = DefaultRouter()
router.register(r'inferences', ModelInferenceViewSet, basename='inference')
router.register(r'checkpoints', ModelCheckpointViewSet)

urlpatterns = [
    path('', include(router.urls)),
]