from django.urls import path
from apps.investigation.views import ProcessListView, ProcessDetailView, NetworkListView, SystemInfoView, ServiceListView, UserListView

urlpatterns = [
    path('processes/', ProcessListView.as_view(), name='process-list'),
    path('processes/<int:pid>/', ProcessDetailView.as_view(), name='process-detail'),
    path('network/', NetworkListView.as_view(), name='network-list'),
    path('system/', SystemInfoView.as_view(), name='system-info'),
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('users/', UserListView.as_view(), name='user-list'),
]
