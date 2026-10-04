import os
import sys
import json
import django

# Paths
project_dir = "D:/project-league"
backend_dir = os.path.join(project_dir, "backend")
json_path = os.path.join(project_dir, "items.json")

# Initialize Django environment
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from items.models import Item

# Read the JSON artifact
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

item_data = data.get('data', {})
items_to_create = []

for item_id, item_info in item_data.items():
    name = item_info.get('name', 'Unknown')
    gold_info = item_info.get('gold', {})
    total_cost = gold_info.get('total', 0)
    base_cost = gold_info.get('base', 0)
    sell_price = gold_info.get('sell', 0)
    stats = item_info.get('stats', {})
    
    items_to_create.append(
        Item(
            name=name,
            total_cost=total_cost,
            base_cost=base_cost,
            sell_price=sell_price,
            stats=stats
        )
    )

# Purge any existing weak remnants, then bulk insert
Item.objects.all().delete()
Item.objects.bulk_create(items_to_create)

print(f"Successfully bound {len(items_to_create)} items into the database.")
