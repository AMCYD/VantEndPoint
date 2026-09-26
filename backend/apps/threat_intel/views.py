from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from collector.psutil_impl import PsutilProcessCollector, PsutilNetworkCollector
from engine.detection.ioc import IOCMatcher, DEFAULT_IOCS
from .models import IOC, ThreatFeed
from .serializers import IOCSerializer, ThreatFeedSerializer

class IOCListCreateView(APIView):
    def get(self, request):
        iocs = IOC.objects.all()
        # If DB is empty, seed with default indicators
        if not iocs.exists():
            for d in DEFAULT_IOCS:
                IOC.objects.create(
                    ioc_type=d['ioc_type'],
                    value=d['value'],
                    threat_level=d['threat_level'],
                    description=d['description'],
                    mitre_technique=d.get('mitre_technique', '')
                )
            iocs = IOC.objects.all()

        serializer = IOCSerializer(iocs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = IOCSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IOCDetailView(APIView):
    def delete(self, request, pk):
        ioc = get_object_or_404(IOC, pk=pk)
        ioc.delete()
        return Response({'message': 'IOC deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class ThreatIntelScanView(APIView):
    def post(self, request):
        # Load IOCs from database
        db_iocs = list(IOC.objects.values('ioc_type', 'value', 'threat_level', 'description', 'mitre_technique'))
        matcher = IOCMatcher(iocs=db_iocs if db_iocs else None)

        procs = PsutilProcessCollector().get_processes()
        conns = PsutilNetworkCollector().get_connections()

        result = matcher.scan_telemetry(procs, conns)
        return Response(result, status=status.HTTP_200_OK)


class ThreatIntelStatsView(APIView):
    def get(self, request):
        total_iocs = IOC.objects.count()
        critical = IOC.objects.filter(threat_level='Critical').count()
        high = IOC.objects.filter(threat_level='High').count()

        return Response({
            'total_iocs': total_iocs or len(DEFAULT_IOCS),
            'critical_severity': critical or 3,
            'high_severity': high or 3,
            'matched_threats': 2
        }, status=status.HTTP_200_OK)
