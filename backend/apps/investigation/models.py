from django.db import models

class InvestigationSnapshot(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    risk_score = models.IntegerField(default=0)
    total_processes = models.IntegerField(default=0)
    total_connections = models.IntegerField(default=0)
    total_services = models.IntegerField(default=0)
    summary = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Snapshot #{self.id} - Risk: {self.risk_score} ({self.created_at})"


class SecurityAlert(models.Model):
    SEVERITY_CHOICES = [
        ('Critical', 'Critical'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
        ('Info', 'Info'),
    ]

    title = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Medium')
    category = models.CharField(max_length=100, default='Behavioral Anomaly')
    description = models.TextField()
    mitre_technique = models.CharField(max_length=50, blank=True, default='')
    process_id = models.IntegerField(null=True, blank=True)
    process_name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.title}"
