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

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

item_data = data.get('data', {})
valid_items = {}

for item_id, info in item_data.items():
    name = info.get('name', 'Unknown')
    maps = info.get('maps', {})
    gold = info.get('gold', {})
    inStore = info.get('inStore', True)
    
    # 1. Must be on map 11 (Summoner's Rift)
    is_summoners_rift = maps.get("11", False)
    # 2. Must have a real gold cost
    is_purchasable = gold.get("purchasable", False) and gold.get("total", 0) > 0
    
    if is_summoners_rift and is_purchasable and inStore:
        if name not in valid_items:
            valid_items[name] = info
        else:
            # Deduplicate by preferring the core item ID (shorter/smaller string)
            # This filters out Ornn masterworks or weird game mode variants that leaked into Map 11
            current_best_id = str(valid_items[name].get('id_for_sort', '9999999'))
            if len(item_id) < len(current_best_id) or (len(item_id) == len(current_best_id) and item_id < current_best_id):
                info['id_for_sort'] = item_id
                valid_items[name] = info
            else:
                valid_items[name]['id_for_sort'] = current_best_id

items_to_create = []
for name, info in valid_items.items():
    gold_info = info.get('gold', {})
    items_to_create.append(
        Item(
            name=name,
            total_cost=gold_info.get('total', 0),
            base_cost=gold_info.get('base', 0),
            sell_price=gold_info.get('sell', 0),
            stats=info.get('stats', {})
        )
    )

# Cleanse the database and insert the pure artifacts
Item.objects.all().delete()
Item.objects.bulk_create(items_to_create)

print(f"Purged false artifacts. Bound {len(items_to_create)} true Summoner's Rift items.")
