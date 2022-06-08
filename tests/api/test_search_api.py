import requests
import unittest
import urllib.parse


# SEARCH_URL = 'http://localhost:8000/search'
SEARCH_URL = 'http://oih.staging.derilinx.com:8000/search'


class TestSearchApi(unittest.TestCase):

    def test_search_no_result(self):
        res = requests.get(SEARCH_URL)
        self.assertEqual(res.status_code, 422)

    def test_search_text(self):
        search_word = 'Calcium'
        res = requests.get(SEARCH_URL + f'?text={search_word}')
        response_json = res.json()
        self.assertEqual(len(response_json), 10, 'Expected 10 results for Calcium')
        self.assertEqual(response_json[0]['id'], 'https://edmerp.seadatanet.org/report/7985')
        self.assertEqual(response_json[0]['type'], 'ResearchProject')
        self.assertEqual(response_json[0]['name'], 'The impact of Coccolithophorid blooms off western Ireland')

        search_word = 'Calcium water'
        res = requests.get(SEARCH_URL + f'?text={urllib.parse.quote(search_word)}')
        response_json = res.json()
        self.assertEqual(len(response_json), 10, 'Expected 10 results for Calcium water')
        self.assertEqual(response_json[0]['id'], 'https://oceanexpert.org/expert/43319')
        self.assertEqual(response_json[0]['type'], 'Person')
        self.assertEqual(response_json[0]['name'], 'Jennifer Waters')

    def test_search_on_type_and_text(self):
        res = requests.get(SEARCH_URL, json={'text': 'Calcium', 'type': 'ResearchProject'})
        response_json = res.json()
        self.assertEqual(len(response_json), 4, 'Expected 4 results for ResearchProject')
        for doc in response_json:
            self.assertEqual(doc['type'], 'ResearchProject')

