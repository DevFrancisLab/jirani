import hashlib, hmac, json, os
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import Count
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods
from .models import Organization, Resident, Conversation, Message, Development, CommunityConcern
from .services.ai import interpret_message
from .services.concerns import update_hotspot
from .services.whatsapp import send_text

def data(value,status=200): return JsonResponse(value,status=status,safe=False)
def org_for(request): return request.user.jirani_organizations.first()

@csrf_exempt
@require_http_methods(['GET','POST'])
def whatsapp_webhook(request):
    if request.method=='GET':
        ok=request.GET.get('hub.mode')=='subscribe' and hmac.compare_digest(request.GET.get('hub.verify_token',''),os.getenv('WHATSAPP_VERIFY_TOKEN',''))
        return HttpResponse(request.GET.get('hub.challenge','')) if ok else HttpResponseForbidden()
    secret=os.getenv('WHATSAPP_APP_SECRET')
    if secret:
        actual=request.headers.get('X-Hub-Signature-256',''); expected='sha256='+hmac.new(secret.encode(),request.body,hashlib.sha256).hexdigest()
        if not hmac.compare_digest(actual,expected): return HttpResponseForbidden()
    try: payload=json.loads(request.body)
    except json.JSONDecodeError: return data({'error':'invalid payload'},400)
    for entry in payload.get('entry',[]):
      for change in entry.get('changes',[]):
       value=change.get('value',{})
       for incoming in value.get('messages',[]):
        mid,sender=incoming.get('id'),incoming.get('from')
        if not mid or not sender or incoming.get('type') not in ('text','image') or Message.objects.filter(whatsapp_message_id=mid).exists(): continue
        # Meta entry.id is the business account id. Never route a webhook to another tenant.
        org=Organization.objects.filter(whatsapp_business_account_id=str(entry.get('id'))).first()
        if not org and Organization.objects.count()==1: org=Organization.objects.first()
        if not org: continue
        with transaction.atomic():
          resident,_=Resident.objects.get_or_create(organization=org,whatsapp_id=sender)
          conversation=Conversation.objects.filter(resident=resident,channel='whatsapp').order_by('-updated_at').first() or Conversation.objects.create(resident=resident)
          text=incoming.get('text',{}).get('body','') if incoming['type']=='text' else ''
          Message.objects.create(conversation=conversation,direction='INBOUND',message_type=incoming['type'],text=text,whatsapp_message_id=mid,metadata={'media_id':incoming.get('image',{}).get('id')} if incoming['type']=='image' else {})
          result=interpret_message(text,conversation.development) if text else None
          response=result.response if result else 'I received your image. Image interpretation is not configured yet; please describe what you want to report.'
          if result and result.category and result.concern and not result.needs_clarification:
            concern=CommunityConcern.objects.create(resident=resident,conversation=conversation,development=conversation.development,category=result.category,description=result.concern,location=conversation.development.location if conversation.development else '',ai_metadata={'intent':result.intent})
            update_hotspot(concern)
          Message.objects.create(conversation=conversation,direction='OUTBOUND',text=response,whatsapp_message_id=send_text(sender,response))
    return data({'status':'ok'})

def dev_json(d): return {'id':d.id,'name':d.name,'location':d.location,'latitude':d.latitude,'longitude':d.longitude,'type':d.development_type,'stage':d.stage,'response_count':d.conversations.count()}
@login_required
@require_GET
def overview(request):
    org=org_for(request)
    if not org:return data({'detail':'organization access required'},403)
    qs=CommunityConcern.objects.filter(resident__organization=org)
    return data({'active_developments':org.developments.exclude(stage='Completed').count(),'community_responses':qs.count(),'recurring_concerns':qs.filter(status__in=['RECURRING','AGGREGATED']).count(),'potential_hotspots':org.hotspots.count(),'category_breakdown':list(qs.values('category').annotate(count=Count('id')))})
@login_required
@require_GET
def developments(request):
    org=org_for(request)
    if not org:return data({'detail':'organization access required'},403)
    qs=org.developments.all()
    if request.GET.get('search'):qs=qs.filter(name__icontains=request.GET['search'])
    return data([dev_json(d) for d in qs])
@login_required
@require_GET
def development_detail(request,development_id):
    d=Development.objects.filter(organization=org_for(request),id=development_id).first()
    if not d:return data({'detail':'not found'},404)
    value=dev_json(d);value.update(description=d.description,concern_breakdown=list(d.concerns.values('category').annotate(count=Count('id'))));return data(value)
@login_required
@require_GET
def concerns(request):
    org=org_for(request)
    if not org:return data({'detail':'organization access required'},403)
    qs=CommunityConcern.objects.filter(resident__organization=org)
    for key in ('category','status','development_id'):
      if request.GET.get(key):qs=qs.filter(**{key:request.GET[key]})
    return data([{'id':x.id,'category':x.category,'development_id':x.development_id,'location':x.location,'status':x.status,'created_at':x.created_at.isoformat(),'description':x.description,'latitude':x.latitude,'longitude':x.longitude}for x in qs])
@login_required
@require_GET
def map_data(request):
    org=org_for(request)
    if not org:return data({'detail':'organization access required'},403)
    return data({'developments':[dev_json(d)for d in org.developments.exclude(latitude=None).exclude(longitude=None)],'hotspots':[{'id':h.id,'category':h.category,'latitude':h.latitude,'longitude':h.longitude,'related_concern_count':h.related_concern_count,'building_count':h.building_count,'description':h.description}for h in org.hotspots.all()]})
@login_required
@require_GET
def insights(request):
    org=org_for(request)
    if not org:return data({'detail':'organization access required'},403)
    qs=CommunityConcern.objects.filter(resident__organization=org)
    return data({'category_counts':list(qs.values('category').annotate(count=Count('id'))),'emerging_patterns':list(org.hotspots.values('id','category','related_concern_count','building_count','description'))})
