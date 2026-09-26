from django.test import TestCase
from collector.windows_native import WindowsNativeCollector
from collector.sysmon import WindowsSysmonCollector
from collector.persistence import WindowsPersistenceCollector

class CollectorTestCase(TestCase):
    def test_process_collector(self):
        procs = WindowsNativeCollector.get_processes()
        self.assertIsInstance(procs, list)
        self.assertGreater(len(procs), 0)
        first = procs[0]
        self.assertIn('pid', first)
        self.assertIn('name', first)
        self.assertIn('cpu_percent', first)
        self.assertIn('memory_percent', first)

    def test_network_collector(self):
        conns = WindowsNativeCollector.get_connections()
        self.assertIsInstance(conns, list)
        self.assertGreater(len(conns), 0)
        first = conns[0]
        self.assertIn('protocol', first)
        self.assertIn('local_address', first)
        self.assertIn('remote_address', first)
        self.assertIn('status', first)

    def test_system_collector(self):
        info = WindowsNativeCollector.get_system_info()
        self.assertIsInstance(info, dict)
        self.assertIn('cpu_count', info)
        self.assertIn('virtual_memory', info)
        self.assertIn('disk_usage', info)
        self.assertGreater(info['cpu_count'], 0)

    def test_services_collector(self):
        services = WindowsNativeCollector.get_services()
        self.assertIsInstance(services, list)
        self.assertGreater(len(services), 0)
        first = services[0]
        self.assertIn('name', first)
        self.assertIn('status', first)

    def test_sysmon_collector(self):
        collector = WindowsSysmonCollector()
        events = collector.get_sysmon_events(max_events=10)
        self.assertIsInstance(events, list)
        self.assertGreater(len(events), 0)
        first = events[0]
        self.assertIn('event_id', first)
        self.assertIn('event_type', first)
        self.assertIn('severity', first)

    def test_persistence_collector(self):
        collector = WindowsPersistenceCollector()
        items = collector.get_persistence_items()
        self.assertIsInstance(items, list)
        self.assertGreater(len(items), 0)
        first = items[0]
        self.assertIn('type', first)
        self.assertIn('name', first)
        self.assertIn('path', first)
