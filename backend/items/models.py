from django.db import models

class Item(models.Model):
    riot_id = models.CharField(max_length=20, default="")
    image_file = models.CharField(max_length=50, default="")
    name = models.CharField(max_length=100)
    total_cost = models.IntegerField()
    base_cost = models.IntegerField()
    sell_price = models.IntegerField(default=0)
    stats = models.JSONField(default=dict)
    description = models.TextField(default="")
    
    def __str__(self):
        return self.name

class Champion(models.Model):
    id_name = models.CharField(max_length=100, unique=True)
    riot_id = models.CharField(max_length=20, default="")
    image_file = models.CharField(max_length=50, default="")
    name = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    lore = models.TextField()
    tags = models.JSONField(default=list)
    stats = models.JSONField(default=dict)
    spells = models.JSONField(default=list)
    passive = models.JSONField(default=dict)

    def __str__(self):
        return self.name
