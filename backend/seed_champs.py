import os
import sys
import json
import django

sys.path.append('D:/project-league/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from items.models import Champion

with open('D:/project-league/champions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

champ_data = data.get('data', {})
champs_to_create = []

for champ_id, info in champ_data.items():
    champs_to_create.append(
        Champion(
            id_name=champ_id,
            name=info.get('name', ''),
            title=info.get('title', ''),
            lore=info.get('lore', ''),
            tags=info.get('tags', []),
            stats=info.get('stats', {}),
            spells=info.get('spells', []),
            passive=info.get('passive', {})
        )
    )

Champion.objects.all().delete()
Champion.objects.bulk_create(champs_to_create)
print(f"Summoned {len(champs_to_create)} champions into the void.")
