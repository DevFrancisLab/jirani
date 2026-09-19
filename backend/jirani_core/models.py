from django.conf import settings
from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=200)
    whatsapp_business_account_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='jirani_organizations')
    created_at = models.DateTimeField(auto_now_add=True)

class Resident(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='residents')
    whatsapp_id = models.CharField(max_length=64)
    display_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: unique_together = [('organization', 'whatsapp_id')]

class Development(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='developments')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    development_type = models.CharField(max_length=80)
    stage = models.CharField(max_length=80)
    floors = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Conversation(models.Model):
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='conversations')
    development = models.ForeignKey(Development, on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    channel = models.CharField(max_length=30, default='whatsapp')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    class Direction(models.TextChoices): INBOUND = 'INBOUND'; OUTBOUND = 'OUTBOUND'
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    direction = models.CharField(max_length=10, choices=Direction.choices)
    message_type = models.CharField(max_length=20, default='text')
    text = models.TextField(blank=True)
    whatsapp_message_id = models.CharField(max_length=128, unique=True, null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class CommunityConcern(models.Model):
    class Category(models.TextChoices):
        TRAFFIC = 'TRAFFIC'; WATER_SEWER = 'WATER_SEWER'; DRAINAGE = 'DRAINAGE'; ENVIRONMENT = 'ENVIRONMENT'; OTHER = 'OTHER'
    class Status(models.TextChoices): OPEN = 'OPEN'; RECURRING = 'RECURRING'; AGGREGATED = 'AGGREGATED'
    resident = models.ForeignKey(Resident, on_delete=models.SET_NULL, null=True, related_name='concerns')
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, related_name='concerns')
    development = models.ForeignKey(Development, on_delete=models.SET_NULL, null=True, blank=True, related_name='concerns')
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True); longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.OPEN)
    ai_metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True); updated_at = models.DateTimeField(auto_now=True)

class PotentialHotspot(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='hotspots')
    category = models.CharField(max_length=20, choices=CommunityConcern.Category.choices)
    location = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True); longitude = models.FloatField(null=True, blank=True)
    related_concern_count = models.PositiveIntegerField(default=0); building_count = models.PositiveIntegerField(default=0)
    related_developments = models.ManyToManyField(Development, blank=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True); updated_at = models.DateTimeField(auto_now=True)
