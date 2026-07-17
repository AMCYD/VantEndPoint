from abc import ABC, abstractmethod
from typing import List, Dict, Any

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
