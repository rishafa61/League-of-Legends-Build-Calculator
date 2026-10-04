import os, sys, json, re, django
sys.path.append('D:/project-league/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from items.models import Item

with open('D:/project-league/items.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

valid_items = {}
for item_id, info in data['data'].items():
    name = info.get('name', 'Unknown')
    maps = info.get('maps', {})
    gold = info.get('gold', {})
    if maps.get("11", False) and (gold.get("purchasable", False) and gold.get("total", 0) > 0) and info.get('inStore', True):
        info['true_id'] = item_id
        if name not in valid_items:
            valid_items[name] = info
        else:
            current = str(valid_items[name].get('true_id', '9999999'))
            if len(item_id) < len(current) or (len(item_id) == len(current) and item_id < current):
                valid_items[name] = info

# Hardcode fix for Riot's API bug on World Atlas
if 'World Atlas' in valid_items:
    valid_items['World Atlas']['description'] = '<mainText><stats><attention>30</attention> Health<br><attention>25%</attention> Base Health Regen<br><attention>25%</attention> Base Mana Regen<br><attention>3</attention> Gold Per 10 Seconds</stats></mainText>'

def parse_stats(description):
    stats = {}
    stats_block = re.search(r'<stats>(.*?)</stats>', description, re.IGNORECASE | re.DOTALL)
    if stats_block:
        for line in stats_block.group(1).split('<br>'):
            match = re.search(r'<attention>([\d\.]+)(%?)</attention>\s*(.*)', line)
            if match:
                val = float(match.group(1))
                is_percent = match.group(2) == '%'
                stat_name = match.group(3).strip()
                
                # Full stat mapping logic
                if "Attack Damage" in stat_name: stats['FlatPhysicalDamageMod'] = val
                elif "Ability Power" in stat_name: stats['FlatMagicDamageMod'] = val
                elif "Armor" in stat_name and "Penetration" not in stat_name: stats['FlatArmorMod'] = val
                elif "Armor Penetration" in stat_name: stats['PercentArmorPenetrationMod'] = val / 100.0
                elif "Magic Resist" in stat_name: stats['FlatSpellBlockMod'] = val
                elif "Magic Penetration" in stat_name:
                    if is_percent: stats['PercentMagicPenetrationMod'] = val / 100.0
                    else: stats['FlatMagicPenetrationMod'] = val
                elif "Health" in stat_name and "Regen" not in stat_name: stats['FlatHPPoolMod'] = val
                elif "Mana" in stat_name and "Regen" not in stat_name: stats['FlatMPPoolMod'] = val
                elif "Ability Haste" in stat_name: stats['AbilityHaste'] = val
                elif "Attack Speed" in stat_name: stats['PercentAttackSpeedMod'] = val / 100.0
                elif "Move" in stat_name:
                    if is_percent: stats['PercentMovementSpeedMod'] = val / 100.0
                    else: stats['FlatMovementSpeedMod'] = val
                elif "Life Steal" in stat_name: stats['PercentLifeStealMod'] = val / 100.0
                elif "Omnivamp" in stat_name: stats['Omnivamp'] = val / 100.0
                elif "Critical Strike" in stat_name: stats['FlatCritChanceMod'] = val / 100.0
                elif "Base Mana Regen" in stat_name: stats['BaseManaRegen'] = val / 100.0
                elif "Base Health Regen" in stat_name: stats['BaseHealthRegen'] = val / 100.0
                elif "Lethality" in stat_name: stats['Lethality'] = val
                elif "Heal and Shield" in stat_name: stats['HealAndShieldPower'] = val / 100.0
                elif "Gold Per 10" in stat_name: stats['GoldPer10'] = val
    return stats

items_to_create = []
for name, info in valid_items.items():
    desc = info.get('description', '')
    parsed_stats = parse_stats(desc)
    if not parsed_stats: parsed_stats = info.get('stats', {})
    
    items_to_create.append(Item(
        riot_id=info['true_id'],
        image_file=info.get('image', {}).get('full', f"{info['true_id']}.png"),
        name=name,
        total_cost=info.get('gold', {}).get('total', 0),
        base_cost=info.get('gold', {}).get('base', 0),
        sell_price=info.get('gold', {}).get('sell', 0),
        stats=parsed_stats,
        description=desc
    ))

Item.objects.all().delete()
Item.objects.bulk_create(items_to_create)
print("Complete. Woven all stats including Armor Pen, Omnivamp, Heal/Shield Power, and fixed World Atlas.")
