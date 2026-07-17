# Mock psutil for testing environment where pip is unavailable

class Process:
    def __init__(self, pid=1):
        self._pid = pid
        
    @property
    def pid(self):
        return self._pid
        
    def name(self):
        return "mock_process.exe"
        
    def exe(self):
        return "C:\\mock\\mock_process.exe"
        
    def cmdline(self):
        return ["mock_process.exe", "--mock"]
        
    def username(self):
        return "NT AUTHORITY\\SYSTEM"
        
    def status(self):
        return "running"
        
    def cpu_percent(self):
        return 5.0
        
    class MemInfo:
        def _asdict(self):
            return {'rss': 1024000, 'vms': 2048000}
            
    def memory_info(self):
        return self.MemInfo()
        
    def num_threads(self):
        return 4
        
    def connections(self):
        return []
        
    def oneshot(self):
        class DummyContextManager:
            def __enter__(self): pass
            def __exit__(self, exc_type, exc_val, exc_tb): pass
        return DummyContextManager()

def process_iter(attrs=None):
    class MockProcessInfo:
        def __init__(self):
            self.info = {
                'pid': 1,
                'name': 'mock_process.exe',
                'username': 'mock_user',
                'cpu_percent': 1.2,
                'memory_percent': 0.5
            }
    return [MockProcessInfo()]

def net_connections(kind='all'):
    return []

def cpu_count(logical=True):
    return 8

def cpu_percent(interval=1):
    return 12.5

class VirtualMemory:
    def _asdict(self):
        return {'total': 16000000000, 'percent': 45.0}

def virtual_memory():
    return VirtualMemory()

class DiskUsage:
    def _asdict(self):
        return {'total': 500000000000, 'percent': 60.0}

def disk_usage(path):
    return DiskUsage()

def users():
    return []

def win_service_iter():
    return []

class NoSuchProcess(Exception): pass
class AccessDenied(Exception): pass
class ZombieProcess(Exception): pass
