from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from typing import Dict, Any

from collector.psutil_impl import (
    PsutilProcessCollector,
    PsutilNetworkCollector,
    PsutilSystemCollector,
    PsutilServiceCollector,
    PsutilUserCollector,
    PsutilPersistenceCollector,
    PsutilSysmonCollector,
)
from collector.windows_native import WindowsNativeCollector
from engine.detection.anomaly import AnomalyDetector
from engine.detection.scoring import ThreatScorer
from engine.detection.ioc import IOCMatcher
from engine.security.hashing import calculate_sha256, verify_signature
from .models import InvestigationSnapshot, SecurityAlert
from .serializers import InvestigationSnapshotSerializer, SecurityAlertSerializer


class ProcessListView(APIView):
    def get(self, request):
        collector = PsutilProcessCollector()
        processes = collector.get_processes()

        # Enrich with behavioral anomaly detection
        enriched = []
        search = request.query_params.get('search', '').lower()
        only_suspicious = request.query_params.get('suspicious', '').lower() in ('true', '1')

        for p in processes:
            # Filter search
            if search and search not in p.get('name', '').lower() and search not in str(p.get('pid', '')):
                continue

            analysis = AnomalyDetector.analyze_process(p)
            p_data = {
                **p,
                'threat_score': analysis['threat_score'],
                'threat_level': analysis['threat_level'],
                'anomaly_flags': analysis['anomaly_flags'],
                'mitre_techniques': analysis['mitre_techniques']
            }

            if only_suspicious and not analysis['is_anomalous']:
                continue

            enriched.append(p_data)

        # Sort suspicious first by default
        enriched.sort(key=lambda x: x.get('threat_score', 0), reverse=True)
        return Response(enriched, status=status.HTTP_200_OK)


class ProcessDetailView(APIView):
    def get(self, request, pid):
        collector = PsutilProcessCollector()
        details = collector.get_process_details(pid)
        if 'error' in details:
            return Response(details, status=status.HTTP_404_NOT_FOUND)

        # Calculate genuine SHA-256 hash if executable path exists
        exe_path = details.get('exe', '')
        if exe_path:
            details['hash_sha256'] = calculate_sha256(exe_path)
            details['signature'] = verify_signature(exe_path)

        analysis = AnomalyDetector.analyze_process(details)
        details['threat_score'] = analysis['threat_score']
        details['threat_level'] = analysis['threat_level']
        details['anomaly_flags'] = analysis['anomaly_flags']
        details['mitre_techniques'] = analysis['mitre_techniques']

        return Response(details, status=status.HTTP_200_OK)


class ProcessKillView(APIView):
    def post(self, request, pid):
        success = WindowsNativeCollector.terminate_process(pid)
        if success:
            return Response({'success': True, 'message': f'Process PID {pid} successfully terminated.'}, status=status.HTTP_200_OK)
        return Response({'success': False, 'message': f'Failed to terminate PID {pid}. Access Denied or Process Exited.'}, status=status.HTTP_400_BAD_REQUEST)


class NetworkListView(APIView):
    def get(self, request):
        collector = PsutilNetworkCollector()
        connections = collector.get_connections()

        enriched = []
        for c in connections:
            analysis = AnomalyDetector.analyze_connection(c)
            enriched.append({
                **c,
                'threat_score': analysis['threat_score'],
                'threat_level': analysis['threat_level'],
                'anomaly_flags': analysis['anomaly_flags'],
                'mitre_techniques': analysis['mitre_techniques']
            })

        return Response(enriched, status=status.HTTP_200_OK)


class SystemInfoView(APIView):
    def get(self, request):
        collector = PsutilSystemCollector()
        info = collector.get_system_info()
        return Response(info, status=status.HTTP_200_OK)


class ServiceListView(APIView):
    def get(self, request):
        collector = PsutilServiceCollector()
        services = collector.get_services()
        return Response(services, status=status.HTTP_200_OK)


class UserListView(APIView):
    def get(self, request):
        collector = PsutilUserCollector()
        users = collector.get_users()
        return Response(users, status=status.HTTP_200_OK)


class PersistenceListView(APIView):
    def get(self, request):
        collector = PsutilPersistenceCollector()
        items = collector.get_persistence_items()
        return Response(items, status=status.HTTP_200_OK)


class SysmonEventListView(APIView):
    def get(self, request):
        collector = PsutilSysmonCollector()
        event_id = request.query_params.get('event_id')
        eid = int(event_id) if event_id and event_id.isdigit() else None
        limit = int(request.query_params.get('limit', 100))

        events = collector.get_sysmon_events(max_events=limit, event_id=eid)

        # Optional severity filter
        sev_filter = request.query_params.get('severity')
        if sev_filter:
            events = [e for e in events if e.get('severity', '').lower() == sev_filter.lower()]

        return Response(events, status=status.HTTP_200_OK)


class SnapshotView(APIView):
    def get(self, request):
        snapshots = InvestigationSnapshot.objects.all()[:20]
        serializer = InvestigationSnapshotSerializer(snapshots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        procs = PsutilProcessCollector().get_processes()
        conns = PsutilNetworkCollector().get_connections()
        services = PsutilServiceCollector().get_services()
        persistence = PsutilPersistenceCollector().get_persistence_items()

        # IOC scan
        matcher = IOCMatcher()
        scan_res = matcher.scan_telemetry(procs, conns)

        # Score assessment
        assessment = ThreatScorer.calculate_endpoint_score(
            procs, conns, persistence, scan_res.get('matches', [])
        )

        snapshot = InvestigationSnapshot.objects.create(
            risk_score=assessment['risk_score'],
            total_processes=len(procs),
            total_connections=len(conns),
            total_services=len(services),
            summary=f"Audit completed: {len(procs)} processes, {len(conns)} sockets. Risk Tier: {assessment['threat_tier']}."
        )

        return Response({
            'snapshot_id': snapshot.id,
            'created_at': snapshot.created_at,
            'risk_score': snapshot.risk_score,
            'assessment': assessment,
            'message': 'Forensic snapshot captured and saved.'
        }, status=status.HTTP_201_CREATED)
