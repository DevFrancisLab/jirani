import json, logging, os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
logger = logging.getLogger(__name__)
def send_text(recipient,text):
    token,phone=os.getenv('WHATSAPP_ACCESS_TOKEN'),os.getenv('WHATSAPP_PHONE_NUMBER_ID')
    if not token or not phone: return None
    version=os.getenv('WHATSAPP_API_VERSION','v21.0')
    req=Request(f'https://graph.facebook.com/{version}/{phone}/messages',data=json.dumps({'messaging_product':'whatsapp','to':recipient,'type':'text','text':{'body':text}}).encode(),headers={'Authorization':f'Bearer {token}','Content-Type':'application/json'})
    try:
        with urlopen(req,timeout=12) as r: return json.loads(r.read()).get('messages',[{}])[0].get('id')
    except HTTPError as error:
        try:
            provider_error = json.loads(error.read()).get('error', {})
            logger.warning('WhatsApp delivery request was rejected (HTTP %s, provider code %s, subcode %s, type %s).', error.code, provider_error.get('code'), provider_error.get('error_subcode'), provider_error.get('type'))
        except (ValueError, KeyError):
            logger.warning('WhatsApp delivery request was rejected (HTTP %s).', error.code)
    except URLError:
        logger.warning('WhatsApp delivery request could not reach Meta.')
    except (ValueError, KeyError):
        logger.warning('WhatsApp delivery response had an unexpected format.')
    return None
