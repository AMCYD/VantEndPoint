from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from collector.psutil_impl import PsutilProcessCollector, PsutilNetworkCollector, PsutilSystemCollector

class ProcessListView(APIView):
    def get(self, request):
        collector = PsutilProcessCollector()
        processes = collector.get_processes()
        return Response(processes, status=status.HTTP_200_OK)

class ProcessDetailView(APIView):
    def get(self, request, pid):
        collector = PsutilProcessCollector()
        details = collector.get_process_details(pid)
        if 'error' in details:
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        return Response(details, status=status.HTTP_200_OK)

class NetworkListView(APIView):
    def get(self, request):
        collector = PsutilNetworkCollector()
        connections = collector.get_connections()
        return Response(connections, status=status.HTTP_200_OK)

class SystemInfoView(APIView):
    def get(self, request):
        collector = PsutilSystemCollector()
        info = collector.get_system_info()
        return Response(info, status=status.HTTP_200_OK)

from collector.psutil_impl import PsutilServiceCollector

class ServiceListView(APIView):
    def get(self, request):
        collector = PsutilServiceCollector()
        services = collector.get_services()
        return Response(services, status=status.HTTP_200_OK)

from collector.psutil_impl import PsutilUserCollector

class UserListView(APIView):
    def get(self, request):
        collector = PsutilUserCollector()
        users = collector.get_users()
        return Response(users, status=status.HTTP_200_OK)
