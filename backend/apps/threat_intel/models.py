from django.db import models

class IOC(models.Model):
    TYPE_CHOICES = [
        ('ip', 'IP Address'),
        ('domain', 'Domain'),
        ('sha256', 'SHA-256 Hash'),
        ('md5', 'MD5 Hash'),
        ('filename', 'Filename'),
    ]

    SEVERITY_CHOICES = [
        ('Critical', 'Critical'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]

    ioc_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    value = models.CharField(max_length=255, unique=True)
    threat_level = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='High')
    description = models.TextField(blank=True, default='')
    mitre_technique = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.ioc_type.upper()}] {self.value} ({self.threat_level})"


class ThreatFeed(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField()
    is_active = models.BooleanField(default=True)
    last_synced = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name
