from django.conf import settings
from jirani_core.models import CommunityConcern, PotentialHotspot
def update_hotspot(concern):
    if not concern.location: return None
    qs=CommunityConcern.objects.filter(resident__organization=concern.resident.organization,category=concern.category,location__iexact=concern.location)
    if qs.count()<settings.JIRANI_HOTSPOT_MIN_CONCERNS: return None
    h,_=PotentialHotspot.objects.update_or_create(organization=concern.resident.organization,category=concern.category,location=concern.location,defaults={'related_concern_count':qs.count(),'building_count':qs.count(),'latitude':concern.latitude,'longitude':concern.longitude,'description':f'Potential pattern of {concern.get_category_display().lower()} reports; not evidence of causation.'})
    h.related_developments.set(qs.exclude(development=None).values_list('development_id',flat=True)); qs.update(status='AGGREGATED'); return h
