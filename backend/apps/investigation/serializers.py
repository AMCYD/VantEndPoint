from rest_framework import serializers
from .models import InvestigationSnapshot, SecurityAlert

class InvestigationSnapshotSerializer(models_serializer := serializers.ModelSerializer):
    class Meta:
        model = InvestigationSnapshot
        fields = '__all__'


class SecurityAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityAlert
        fields = '__all__'


class ProcessItemSerializer(serializers.Serializer):
    pid = serializers.IntegerField()
    name = serializers.CharField()
    exe = serializers.CharField(allow_blank=True, required=False)
    username = serializers.CharField(allow_blank=True, required=False)
    status = serializers.CharField(allow_blank=True, required=False)
    cpu_percent = serializers.FloatField(required=False)
    memory_percent = serializers.FloatField(required=False)
    threat_score = serializers.IntegerField(required=False)
    threat_level = serializers.CharField(required=False)
    anomaly_flags = serializers.ListField(child=serializers.CharField(), required=False)
    mitre_techniques = serializers.ListField(child=serializers.CharField(), required=False)


class NetworkItemSerializer(serializers.Serializer):
    protocol = serializers.CharField()
    local_address = serializers.CharField()
    remote_address = serializers.CharField()
    status = serializers.CharField()
    pid = serializers.IntegerField(allow_null=True)
    is_external = serializers.BooleanField(required=False)
    threat_score = serializers.IntegerField(required=False)


class ServiceItemSerializer(serializers.Serializer):
    name = serializers.CharField()
    display_name = serializers.CharField(allow_blank=True)
    status = serializers.CharField()
    start_type = serializers.CharField(allow_blank=True)
    pid = serializers.IntegerField(allow_null=True, required=False)
    binpath = serializers.CharField(allow_blank=True, required=False)


class PersistenceItemSerializer(serializers.Serializer):
    type = serializers.CharField()
    location = serializers.CharField()
    name = serializers.CharField()
    path = serializers.CharField()
    risk_level = serializers.CharField()


class SysmonEventItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    event_id = serializers.IntegerField()
    event_type = serializers.CharField()
    timestamp = serializers.CharField()
    process_name = serializers.CharField(allow_blank=True, required=False)
    process_id = serializers.IntegerField(allow_null=True, required=False)
    command_line = serializers.CharField(allow_blank=True, required=False)
    parent_process = serializers.CharField(allow_null=True, required=False)
    user = serializers.CharField(allow_blank=True, required=False)
    severity = serializers.CharField()
