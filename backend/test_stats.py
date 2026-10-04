import os, sys, django
sys.path.append('D:/project-league/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from items.models import Item

empty_stats = Item.objects.filter(stats={})
print(f"Items with empty stats in DB: {empty_stats.count()}")
for item in empty_stats[:20]:
    print(f"- {item.name}")
