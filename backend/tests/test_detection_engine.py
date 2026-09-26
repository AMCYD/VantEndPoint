from django.test import TestCase
from engine.detection.anomaly import AnomalyDetector
from engine.detection.ioc import IOCMatcher
from engine.detection.scoring import ThreatScorer
from engine.security.hashing import calculate_sha256

class DetectionEngineTestCase(TestCase):
    def test_clean_process(self):
        proc = {
            'pid': 100,
            'name': 'notepad.exe',
            'exe': 'C:\\Windows\\System32\\notepad.exe',
            'cmdline': ['notepad.exe']
        }
        res = AnomalyDetector.analyze_process(proc)
        self.assertFalse(res['is_anomalous'])
        self.assertEqual(res['threat_score'], 0)
        self.assertEqual(res['threat_level'], 'Low')

    def test_encoded_powershell_anomaly(self):
        proc = {
            'pid': 4820,
            'name': 'powershell.exe',
            'exe': 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
            'cmdline': ['powershell.exe', '-enc', 'SQBFAFgAIAAoAE4AZQB3...']
        }
        res = AnomalyDetector.analyze_process(proc)
        self.assertTrue(res['is_anomalous'])
        self.assertGreaterEqual(res['threat_score'], 40)
        self.assertIn('T1059.001', res['mitre_techniques'])

    def test_masquerading_system_binary(self):
        proc = {
            'pid': 9999,
            'name': 'svchost.exe',
            'exe': 'C:\\Users\\User\\AppData\\Local\\Temp\\svchost.exe',
            'cmdline': ['svchost.exe']
        }
        res = AnomalyDetector.analyze_process(proc)
        self.assertTrue(res['is_anomalous'])
        self.assertGreaterEqual(res['threat_score'], 65)
        self.assertIn('T1036.005', res['mitre_techniques'])

    def test_c2_port_anomaly(self):
        conn = {
            'protocol': 'TCP',
            'local_address': '192.168.1.10:50000',
            'remote_address': '185.220.101.5:4444',
            'raddr': {'ip': '185.220.101.5', 'port': 4444}
        }
        res = AnomalyDetector.analyze_connection(conn)
        self.assertTrue(res['is_anomalous'])
        self.assertGreaterEqual(res['threat_score'], 50)
        self.assertIn('T1071.001', res['mitre_techniques'])

    def test_ioc_matching(self):
        matcher = IOCMatcher([
            {'ioc_type': 'ip', 'value': '185.220.101.5', 'threat_level': 'Critical', 'description': 'C2', 'mitre_technique': 'T1071'},
            {'ioc_type': 'filename', 'value': 'bad_script.bat', 'threat_level': 'High', 'description': 'Malicious script', 'mitre_technique': 'T1547'}
        ])

        procs = [{'pid': 1, 'name': 'bad_script.bat', 'exe': ''}]
        conns = [{'pid': 1, 'raddr': {'ip': '185.220.101.5', 'port': 4444}}]

        scan = matcher.scan_telemetry(procs, conns)
        self.assertGreaterEqual(scan['threat_score'], 70)
        self.assertEqual(len(scan['matches']), 2)

    def test_threat_scoring(self):
        procs = [{'pid': 1, 'name': 'test.exe', 'threat_score': 75, 'mitre_techniques': ['T1059']}]
        conns = [{'pid': 1, 'threat_score': 60, 'mitre_techniques': ['T1071']}]
        persistence = [{'name': 'autorun', 'risk_level': 'High'}]
        ioc_matches = [{'severity': 'Critical', 'mitre': 'T1071.001', 'description': 'C2 hit'}]

        res = ThreatScorer.calculate_endpoint_score(procs, conns, persistence, ioc_matches)
        self.assertGreaterEqual(res['risk_score'], 75)
        self.assertEqual(res['threat_tier'], 'Critical')
        self.assertIn('T1059', res['mitre_techniques'])
        self.assertIn('T1071', res['mitre_techniques'])
