from typing import List, Dict, Any
from .base import (
    ProcessCollector,
    NetworkCollector,
    SystemCollector,
    ServiceCollector,
    UserCollector,
    PersistenceCollector,
    SysmonCollector,
)
from .windows_native import WindowsNativeCollector
from .sysmon import WindowsSysmonCollector
from .persistence import WindowsPersistenceCollector

class PsutilProcessCollector(ProcessCollector):
    def get_processes(self) -> List[Dict[str, Any]]:
        return WindowsNativeCollector.get_processes()

    def get_process_details(self, pid: int) -> Dict[str, Any]:
        return WindowsNativeCollector.get_process_details(pid)


class PsutilNetworkCollector(NetworkCollector):
    def get_connections(self) -> List[Dict[str, Any]]:
        return WindowsNativeCollector.get_connections()


class PsutilSystemCollector(SystemCollector):
    def get_system_info(self) -> Dict[str, Any]:
        return WindowsNativeCollector.get_system_info()


class PsutilServiceCollector(ServiceCollector):
    def get_services(self) -> List[Dict[str, Any]]:
        return WindowsNativeCollector.get_services()


class PsutilUserCollector(UserCollector):
    def get_users(self) -> List[Dict[str, Any]]:
        return WindowsNativeCollector.get_users()


class PsutilPersistenceCollector(PersistenceCollector):
    def get_persistence_items(self) -> List[Dict[str, Any]]:
        collector = WindowsPersistenceCollector()
        return collector.get_persistence_items()


class PsutilSysmonCollector(SysmonCollector):
    def get_sysmon_events(self, max_events: int = 100, event_id: int = None) -> List[Dict[str, Any]]:
        collector = WindowsSysmonCollector()
        return collector.get_sysmon_events(max_events=max_events, event_id=event_id)
