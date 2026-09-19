from django.test import SimpleTestCase
from jirani_core.services.ai import parse_result
class AIValidationTests(SimpleTestCase):
    def test_valid_category_is_parsed(self): self.assertEqual(parse_result({'response':'Recorded','category':'TRAFFIC'}).category,'TRAFFIC')
    def test_invalid_category_is_rejected(self):
        with self.assertRaises(ValueError): parse_result({'response':'x','category':'MADE_UP'})
