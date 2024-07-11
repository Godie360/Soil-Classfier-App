from django.urls import path
from .views import PredictView, UploadImageView

urlpatterns = [
    path('predict/', PredictView.as_view(), name='predict'),
    path('upload/', UploadImageView.as_view(), name='upload_image'),
]
