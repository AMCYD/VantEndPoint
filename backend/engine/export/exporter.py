import json
import csv
import io
from typing import Dict, Any, List

class ReportExporter:
    """Exports forensic investigation snapshots to JSON, CSV, and text summaries."""

    @staticmethod
    def to_json(report_data: Dict[str, Any]) -> str:
        return json.dumps(report_data, indent=2, default=str)

    @staticmethod
    def to_csv(processes: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        if not processes:
            return ""
        fieldnames = ['pid', 'name', 'exe', 'username', 'cpu_percent', 'memory_percent', 'threat_score', 'status']
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        for p in processes:
            writer.writerow(p)
        return output.getvalue()

    @staticmethod
    def to_markdown_summary(title: str, risk_score: int, alerts: List[str], mitre: List[str]) -> str:
        md = [
            f"# {title}",
            f"**Endpoint Risk Score:** {risk_score}/100",
            f"**Posture:** {'HIGH / CRITICAL RISK' if risk_score >= 50 else 'BASELINE SAFE'}",
            "",
            "## Key Detections",
        ]
        if alerts:
            for a in alerts:
                md.append(f"- {a}")
        else:
            md.append("No active alerts detected.")

        md.extend([
            "",
            "## MITRE ATT&CK Matrix Techniques",
        ])
        if mitre:
            for m in mitre:
                md.append(f"- {m}")
        else:
            md.append("No MITRE ATT&CK techniques mapped.")

        return "\n".join(md)
