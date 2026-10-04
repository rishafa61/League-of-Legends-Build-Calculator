from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, ChampionViewSet

router = DefaultRouter()
router.register(r'items', ItemViewSet)
router.register(r'champions', ChampionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
