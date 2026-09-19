import json
from unittest.mock import patch
from django.test import TestCase, override_settings
from jirani_core.models import Organization, Resident, Conversation, Message, CommunityConcern
from jirani_core.services.ai import AIResult

class WebhookTests(TestCase):
    def setUp(self): self.org=Organization.objects.create(name='Team Urbana')
    def payload(self, message_id='wamid.1', body='Sewer is overflowing'):
        return {'entry':[{'changes':[{'value':{'messages':[{'id':message_id,'from':'254700000000','type':'text','text':{'body':body}}]}}]}]}
    @override_settings(JIRANI_HOTSPOT_MIN_CONCERNS=2)
    @patch('jirani_core.views.send_text',return_value='wamid.out')
    @patch('jirani_core.views.interpret_message',return_value=AIResult('community_concern','WATER_SEWER','Sewer overflow',False,'Recorded.'))
    def test_text_creates_resident_conversation_messages_and_concern(self, *_):
        response=self.client.post('/webhooks/whatsapp/',data=json.dumps(self.payload()),content_type='application/json')
        self.assertEqual(response.status_code,200); self.assertEqual(Resident.objects.count(),1); self.assertEqual(Conversation.objects.count(),1); self.assertEqual(Message.objects.count(),2)
        self.assertEqual(CommunityConcern.objects.get().category,'WATER_SEWER')
    @patch('jirani_core.views.send_text', return_value=None)
    @patch('jirani_core.views.interpret_message',return_value=AIResult('general',None,None,True,'Please clarify.'))
    def test_duplicate_webhook_is_idempotent(self,*_):
        content=json.dumps(self.payload())
        self.client.post('/webhooks/whatsapp/',data=content,content_type='application/json'); self.client.post('/webhooks/whatsapp/',data=content,content_type='application/json')
        self.assertEqual(Message.objects.filter(direction='INBOUND').count(),1)
    def test_verification(self):
        with patch.dict('os.environ',{'WHATSAPP_VERIFY_TOKEN':'token'}):
            r=self.client.get('/webhooks/whatsapp/',{'hub.mode':'subscribe','hub.verify_token':'token','hub.challenge':'challenge'})
        self.assertEqual(r.status_code,200);self.assertEqual(r.content,b'challenge')
