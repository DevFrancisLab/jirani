import json, logging, os
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
VALID_CATEGORIES = {'TRAFFIC','WATER_SEWER','DRAINAGE','ENVIRONMENT','OTHER'}
logger = logging.getLogger(__name__)
@dataclass
class AIResult: intent:str; category:str|None; concern:str|None; needs_clarification:bool; response:str
def parse_result(data):
    if not isinstance(data, dict) or not isinstance(data.get('response'),str): raise ValueError('Invalid AI response')
    category=data.get('category')
    if category is not None and category not in VALID_CATEGORIES: raise ValueError('Invalid concern category')
    return AIResult(str(data.get('intent','general')),category,data.get('concern') if isinstance(data.get('concern'),str) else None,bool(data.get('needs_clarification')),data['response'])
def interpret_message(text, development=None):
    key,model=os.getenv('CEREBRAS_API_KEY'),os.getenv('CEREBRAS_MODEL')
    if not key or not model: return AIResult('general',None,None,True,'Thanks for your message. Please tell me the issue or development location so I can help.')
    context=f'Confirmed development: {development.name}. {development.description}' if development else 'No confirmed development.'
    prompt='You are Jirani, a concise community participation assistant. Do not invent facts, claim causation, or make decisions. Return ONLY JSON with intent, category (TRAFFIC/WATER_SEWER/DRAINAGE/ENVIRONMENT/OTHER/null), concern, needs_clarification, response. '+context+' Resident: '+text
    request=Request('https://api.cerebras.ai/v1/chat/completions',data=json.dumps({'model':model,'messages':[{'role':'system','content':prompt}],'response_format':{'type':'json_object'}}).encode(),headers={'Authorization':f'Bearer {key}','Content-Type':'application/json'})
    try:
        with urlopen(request,timeout=12) as r: return parse_result(json.loads(json.loads(r.read())['choices'][0]['message']['content']))
    except HTTPError as error:
        try:
            provider_error=json.loads(error.read()).get('error',{})
            logger.warning('Cerebras request was rejected (HTTP %s, provider code %s, type %s).',error.code,provider_error.get('code'),provider_error.get('type'))
        except (ValueError, KeyError): logger.warning('Cerebras request was rejected (HTTP %s).',error.code)
    except URLError: logger.warning('Cerebras request could not reach the provider.')
    except (ValueError, KeyError, TypeError): logger.warning('Cerebras response had an unexpected format.')
    return AIResult('general',None,None,True,'I could not process that just now. Please try again shortly.')
