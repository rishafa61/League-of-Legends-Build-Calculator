import os
import sys
import json
import django

sys.path.append('D:/project-league/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from items.models import Item

with open('D:/project-league/items.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

item_data = data.get('data', {})
valid_items = {}

for item_id, info in item_data.items():
    name = info.get('name', 'Unknown')
    maps = info.get('maps', {})
    gold = info.get('gold', {})
    inStore = info.get('inStore', True)
    
    is_summoners_rift = maps.get("11", False)
    is_purchasable = gold.get("purchasable", False) and gold.get("total", 0) > 0
    
    if is_summoners_rift and is_purchasable and inStore:
        if name not in valid_items:
            info['true_id'] = item_id
            valid_items[name] = info
        else:
            current_best_id = str(valid_items[name].get('true_id', '9999999'))
            if len(item_id) < len(current_best_id) or (len(item_id) == len(current_best_id) and item_id < current_best_id):
                info['true_id'] = item_id
                valid_items[name] = info

items_to_create = []
for name, info in valid_items.items():
    gold_info = info.get('gold', {})
    image_data = info.get('image', {})
    # Riot explicitly provides the exact image filename in image.full
    image_file = image_data.get('full', f"{info.get('true_id')}.png")
    
    items_to_create.append(
        Item(
            riot_id=info.get('true_id', ''),
            image_file=image_file,
            name=name,
            total_cost=gold_info.get('total', 0),
            base_cost=gold_info.get('base', 0),
            sell_price=gold_info.get('sell', 0),
            stats=info.get('stats', {})
        )
    )

Item.objects.all().delete()
Item.objects.bulk_create(items_to_create)
print(f"Re-forged {len(items_to_create)} items with exact image files.")
