from rest_framework import serializers
from .models import SecurityReport

class SecurityReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityReport
        fields = '__all__'
