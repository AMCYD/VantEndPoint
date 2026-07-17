import psutil
from typing import List, Dict, Any
from .base import ProcessCollector, NetworkCollector, SystemCollector, ServiceCollector

class PsutilProcessCollector(ProcessCollector):
    def get_processes(self) -> List[Dict[str, Any]]:
        processes = []
        for p in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
            try:
                processes.append(p.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        return processes

    def get_process_details(self, pid: int) -> Dict[str, Any]:
        try:
            p = psutil.Process(pid)
            with p.oneshot():
                return {
                    'pid': p.pid,
                    'name': p.name(),
                    'exe': p.exe(),
                    'cmdline': p.cmdline(),
                    'username': p.username(),
                    'status': p.status(),
                    'cpu_percent': p.cpu_percent(),
                    'memory_info': p.memory_info()._asdict(),
                    'num_threads': p.num_threads(),
                    'connections': [c._asdict() for c in p.connections()]
                }
        except Exception as e:
            return {'error': str(e)}

class PsutilNetworkCollector(NetworkCollector):
    def get_connections(self) -> List[Dict[str, Any]]:
        connections = []
        try:
            for c in psutil.net_connections(kind='all'):
                connections.append({
                    'fd': c.fd,
                    'family': c.family,
                    'type': c.type,
                    'laddr': c.laddr._asdict() if c.laddr else None,
                    'raddr': c.raddr._asdict() if c.raddr else None,
                    'status': c.status,
                    'pid': c.pid
                })
        except Exception as e:
            pass
        return connections

class PsutilSystemCollector(SystemCollector):
    def get_system_info(self) -> Dict[str, Any]:
        return {
            'cpu_count': psutil.cpu_count(logical=True),
            'cpu_percent': psutil.cpu_percent(interval=1),
            'virtual_memory': psutil.virtual_memory()._asdict(),
            'disk_usage': psutil.disk_usage('/')._asdict()
        }

class PsutilServiceCollector(ServiceCollector):
    def get_services(self) -> List[Dict[str, Any]]:
        services = []
        if hasattr(psutil, 'win_service_iter'):
            for s in psutil.win_service_iter():
                try:
                    info = s.as_dict()
                    services.append({
                        'name': info.get('name'),
                        'display_name': info.get('display_name'),
                        'status': info.get('status'),
                        'start_type': info.get('start_type'),
                        'pid': info.get('pid'),
                        'binpath': info.get('binpath'),
                        'username': info.get('username')
                    })
                except Exception:
                    pass
        return services

class PsutilUserCollector:
    def get_users(self) -> List[Dict[str, Any]]:
        users = []
        try:
            for u in psutil.users():
                users.append({
                    'name': u.name,
                    'terminal': u.terminal,
                    'host': u.host,
                    'started': u.started,
                    'pid': u.pid
                })
        except Exception:
            pass
        return users
