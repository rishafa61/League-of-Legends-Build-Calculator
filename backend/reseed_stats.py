import os
import sys
import json
import re
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
    if maps.get("11", False) and (gold.get("purchasable", False) and gold.get("total", 0) > 0) and inStore:
        if name not in valid_items:
            info['true_id'] = item_id
            valid_items[name] = info
        else:
            current_best_id = str(valid_items[name].get('true_id', '9999999'))
            if len(item_id) < len(current_best_id) or (len(item_id) == len(current_best_id) and item_id < current_best_id):
                info['true_id'] = item_id
                valid_items[name] = info

def parse_stats(description):
    stats = {}
    stats_block = re.search(r'<stats>(.*?)</stats>', description, re.IGNORECASE | re.DOTALL)
    if stats_block:
        lines = stats_block.group(1).split('<br>')
        for line in lines:
            match = re.search(r'<attention>([\d\.]+)(%?)</attention>\s*(.*)', line)
            if match:
                val = float(match.group(1))
                is_percent = match.group(2) == '%'
                stat_name = match.group(3).strip()
                
                if "Attack Damage" in stat_name: stats['FlatPhysicalDamageMod'] = val
                elif "Ability Power" in stat_name: stats['FlatMagicDamageMod'] = val
                elif "Armor" in stat_name and "Penetration" not in stat_name: stats['FlatArmorMod'] = val
                elif "Magic Resist" in stat_name: stats['FlatSpellBlockMod'] = val
                elif "Health" in stat_name and "Regen" not in stat_name: stats['FlatHPPoolMod'] = val
                elif "Mana" in stat_name and "Regen" not in stat_name: stats['FlatMPPoolMod'] = val
                elif "Ability Haste" in stat_name: stats['AbilityHaste'] = val
                elif "Attack Speed" in stat_name: stats['PercentAttackSpeedMod'] = val / 100.0
                elif "Move" in stat_name:
                    if is_percent: stats['PercentMovementSpeedMod'] = val / 100.0
                    else: stats['FlatMovementSpeedMod'] = val
                elif "Life Steal" in stat_name: stats['PercentLifeStealMod'] = val / 100.0
                elif "Critical Strike" in stat_name: stats['FlatCritChanceMod'] = val / 100.0
                elif "Base Mana Regen" in stat_name: stats['BaseManaRegen'] = val / 100.0
                elif "Base Health Regen" in stat_name: stats['BaseHealthRegen'] = val / 100.0
                elif "Lethality" in stat_name: stats['Lethality'] = val
                elif "Magic Penetration" in stat_name: stats['MagicPenetration'] = val
    return stats

items_to_create = []
for name, info in valid_items.items():
    gold_info = info.get('gold', {})
    desc = info.get('description', '')
    parsed_stats = parse_stats(desc)
    
    # If parser failed, fallback to raw stats object
    if not parsed_stats:
        parsed_stats = info.get('stats', {})
        
    items_to_create.append(
        Item(
            riot_id=info.get('true_id', ''),
            image_file=info.get('image', {}).get('full', f"{info.get('true_id')}.png"),
            name=name,
            total_cost=gold_info.get('total', 0),
            base_cost=gold_info.get('base', 0),
            sell_price=gold_info.get('sell', 0),
            stats=parsed_stats,
            description=desc
        )
    )

Item.objects.all().delete()
Item.objects.bulk_create(items_to_create)
print(f"Parsed and seeded {len(items_to_create)} items with true stats.")
