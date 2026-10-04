from rest_framework import viewsets
from .models import Item
from .serializers import ItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

from .models import Champion
from .serializers import ChampionSerializer
class ChampionViewSet(viewsets.ModelViewSet):
    queryset = Champion.objects.all().order_by('name')
    serializer_class = ChampionSerializer
