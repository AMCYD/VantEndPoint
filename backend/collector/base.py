from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class ProcessCollector(ABC):
    @abstractmethod
    def get_processes(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_process_details(self, pid: int) -> Dict[str, Any]:
        pass


class NetworkCollector(ABC):
    @abstractmethod
    def get_connections(self) -> List[Dict[str, Any]]:
        pass


class SystemCollector(ABC):
    @abstractmethod
    def get_system_info(self) -> Dict[str, Any]:
        pass


class ServiceCollector(ABC):
    @abstractmethod
    def get_services(self) -> List[Dict[str, Any]]:
        pass


class UserCollector(ABC):
    @abstractmethod
    def get_users(self) -> List[Dict[str, Any]]:
        pass


class PersistenceCollector(ABC):
    @abstractmethod
    def get_persistence_items(self) -> List[Dict[str, Any]]:
        pass


class SysmonCollector(ABC):
    @abstractmethod
    def get_sysmon_events(self, max_events: int = 100, event_id: Optional[int] = None) -> List[Dict[str, Any]]:
        pass
