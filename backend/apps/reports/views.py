from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from collector.psutil_impl import PsutilProcessCollector, PsutilNetworkCollector, PsutilPersistenceCollector
from engine.detection.ioc import IOCMatcher
from engine.detection.scoring import ThreatScorer
from engine.export.exporter import ReportExporter
from .models import SecurityReport
from .serializers import SecurityReportSerializer

class ReportListCreateView(APIView):
    def get(self, request):
        reports = SecurityReport.objects.all()
        # Seed initial baseline report if empty
        if not reports.exists():
            SecurityReport.objects.create(
                title="Endpoint Incident Forensics Snapshot",
                report_type="Forensic Investigation",
                status="Completed",
                summary="Elevated threat activity detected: Suspicious encoded PowerShell process and external C2 socket connection identified.",
                risk_score=78,
                findings_json={
                    "total_processes": 142,
                    "total_connections": 28,
                    "active_threats": 2,
                    "mitre_techniques": ["T1059.001", "T1071.001", "T1547.001"]
                }
            )
            reports = SecurityReport.objects.all()

        serializer = SecurityReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        title = request.data.get('title', 'Forensic Audit Report')
        report_type = request.data.get('report_type', 'Forensic Investigation')

        procs = PsutilProcessCollector().get_processes()
        conns = PsutilNetworkCollector().get_connections()
        persistence = PsutilPersistenceCollector().get_persistence_items()

        matcher = IOCMatcher()
        ioc_scan = matcher.scan_telemetry(procs, conns)
        assessment = ThreatScorer.calculate_endpoint_score(procs, conns, persistence, ioc_scan.get('matches', []))

        report = SecurityReport.objects.create(
            title=title,
            report_type=report_type,
            status="Completed",
            summary=f"Automated EDR audit completed. Analyzed {len(procs)} processes, {len(conns)} sockets, and {len(persistence)} persistence mechanisms. Overall Endpoint Risk Score: {assessment['risk_score']}/100.",
            risk_score=assessment['risk_score'],
            findings_json={
                "total_processes": len(procs),
                "total_connections": len(conns),
                "total_persistence": len(persistence),
                "assessment": assessment,
                "ioc_matches": ioc_scan.get('matches', [])
            }
        )

        serializer = SecurityReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReportDetailView(APIView):
    def get(self, request, pk):
        report = get_object_or_404(SecurityReport, pk=pk)
        serializer = SecurityReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReportExportView(APIView):
    def get(self, request, pk):
        report = get_object_or_404(SecurityReport, pk=pk)
        export_format = request.query_params.get('format', 'json').lower()

        if export_format == 'csv':
            procs = PsutilProcessCollector().get_processes()
            csv_content = ReportExporter.to_csv(procs)
            response = HttpResponse(csv_content, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="report_{pk}_processes.csv"'
            return response

        # Default JSON export
        report_dict = {
            'id': report.id,
            'title': report.title,
            'report_type': report.report_type,
            'status': report.status,
            'summary': report.summary,
            'risk_score': report.risk_score,
            'findings': report.findings_json,
            'created_at': report.created_at.isoformat()
        }
        json_content = ReportExporter.to_json(report_dict)
        response = HttpResponse(json_content, content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="report_{pk}.json"'
        return response
