from django.db import models

class SecurityReport(models.Model):
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=100, default='Forensic Investigation')
    status = models.CharField(max_length=50, default='Completed')
    summary = models.TextField(blank=True, default='')
    risk_score = models.IntegerField(default=0)
    findings_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.report_type}] {self.title} (Score: {self.risk_score})"
