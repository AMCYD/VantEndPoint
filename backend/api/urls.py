from django.urls import path
from apps.investigation.views import (
    ProcessListView,
    ProcessDetailView,
    ProcessKillView,
    NetworkListView,
    SystemInfoView,
    ServiceListView,
    UserListView,
    PersistenceListView,
    SysmonEventListView,
    SnapshotView,
)
from apps.threat_intel.views import (
    IOCListCreateView,
    IOCDetailView,
    ThreatIntelScanView,
    ThreatIntelStatsView,
)
from apps.reports.views import (
    ReportListCreateView,
    ReportDetailView,
    ReportExportView,
)
from api.docs import OpenApiSchemaView, SwaggerDocsView

urlpatterns = [
    # OpenAPI & Swagger
    path('schema/', OpenApiSchemaView.as_view(), name='openapi-schema'),
    path('docs/', SwaggerDocsView.as_view(), name='swagger-docs'),

    # Investigation Endpoints
    path('processes/', ProcessListView.as_view(), name='process-list'),
    path('processes/<int:pid>/', ProcessDetailView.as_view(), name='process-detail'),
    path('processes/<int:pid>/kill/', ProcessKillView.as_view(), name='process-kill'),
    path('network/', NetworkListView.as_view(), name='network-list'),
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('system/', SystemInfoView.as_view(), name='system-info'),
    path('persistence/', PersistenceListView.as_view(), name='persistence-list'),
    path('sysmon/', SysmonEventListView.as_view(), name='sysmon-list'),
    path('snapshot/', SnapshotView.as_view(), name='snapshot'),

    # Threat Intelligence Endpoints
    path('threat-intel/iocs/', IOCListCreateView.as_view(), name='threat-intel-iocs'),
    path('threat-intel/iocs/<int:pk>/', IOCDetailView.as_view(), name='threat-intel-ioc-detail'),
    path('threat-intel/match/', ThreatIntelScanView.as_view(), name='threat-intel-match'),
    path('threat-intel/stats/', ThreatIntelStatsView.as_view(), name='threat-intel-stats'),

    # Reports Endpoints
    path('reports/', ReportListCreateView.as_view(), name='reports-list'),
    path('reports/<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('reports/<int:pk>/export/', ReportExportView.as_view(), name='report-export'),
]
