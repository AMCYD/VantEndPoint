from django.test import TestCase, Client
from rest_framework import status
import json

class ApiEndpointsTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_processes_endpoint(self):
        response = self.client.get('/api/processes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        first = data[0]
        self.assertIn('pid', first)
        self.assertIn('threat_score', first)

    def test_network_endpoint(self):
        response = self.client.get('/api/network/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        first = data[0]
        self.assertIn('protocol', first)
        self.assertIn('local_address', first)

    def test_services_endpoint(self):
        response = self.client.get('/api/services/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_system_endpoint(self):
        response = self.client.get('/api/system/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('cpu_count', data)
        self.assertIn('virtual_memory', data)

    def test_persistence_endpoint(self):
        response = self.client.get('/api/persistence/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_sysmon_endpoint(self):
        response = self.client.get('/api/sysmon/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, list)

    def test_snapshot_endpoints(self):
        # POST snapshot
        post_res = self.client.post('/api/snapshot/')
        self.assertEqual(post_res.status_code, status.HTTP_201_CREATED)
        post_data = post_res.json()
        self.assertIn('snapshot_id', post_data)
        self.assertIn('risk_score', post_data)

        # GET snapshot
        get_res = self.client.get('/api/snapshot/')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(get_res.json()), 0)

    def test_threat_intel_endpoints(self):
        # GET iocs
        get_res = self.client.get('/api/threat-intel/iocs/')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertGreater(len(get_res.json()), 0)

        # POST ioc
        payload = {
            'ioc_type': 'ip',
            'value': '103.200.15.88',
            'threat_level': 'High',
            'description': 'Test C2',
            'mitre_technique': 'T1071'
        }
        create_res = self.client.post('/api/threat-intel/iocs/', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)

        # POST match
        match_res = self.client.post('/api/threat-intel/match/')
        self.assertEqual(match_res.status_code, status.HTTP_200_OK)
        match_data = match_res.json()
        self.assertIn('total_scanned', match_data)
        self.assertIn('threat_score', match_data)

    def test_reports_endpoints(self):
        # GET reports
        get_res = self.client.get('/api/reports/')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)

        # POST report
        post_res = self.client.post('/api/reports/', data=json.dumps({'title': 'Unit Test Report'}), content_type='application/json')
        self.assertEqual(post_res.status_code, status.HTTP_201_CREATED)
        rep_id = post_res.json()['id']

        # GET export
        export_res = self.client.get(f'/api/reports/{rep_id}/export/?format=json')
        self.assertEqual(export_res.status_code, status.HTTP_200_OK)

    def test_openapi_and_swagger_docs(self):
        schema_res = self.client.get('/api/schema/')
        self.assertEqual(schema_res.status_code, status.HTTP_200_OK)
        schema = schema_res.json()
        self.assertEqual(schema['openapi'], '3.0.3')
        self.assertIn('/processes/', schema['paths'])
        self.assertIn('/sysmon/', schema['paths'])

        docs_res = self.client.get('/api/docs/')
        self.assertEqual(docs_res.status_code, status.HTTP_200_OK)
        self.assertIn(b'swagger-ui', docs_res.content)
