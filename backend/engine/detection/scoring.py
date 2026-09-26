from typing import List, Dict, Any

class ThreatScorer:
    """Calculates overall endpoint risk score (0-100) and aggregates MITRE ATT&CK coverage."""

    @staticmethod
    def calculate_endpoint_score(
        processes: List[Dict[str, Any]],
        connections: List[Dict[str, Any]],
        persistence_items: List[Dict[str, Any]],
        ioc_matches: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        score = 10  # Baseline health score
        mitre_coverage = set()
        alerts = []

        # Evaluate IOC matches
        for match in ioc_matches:
            sev = match.get('severity', 'Medium')
            if sev == 'Critical':
                score += 35
            elif sev == 'High':
                score += 25
            else:
                score += 15
            if match.get('mitre'):
                mitre_coverage.add(match['mitre'])
            alerts.append(f"IOC Hit [{sev}]: {match.get('description')} ({match.get('matched_entity')})")

        # Evaluate Processes
        for p in processes:
            p_score = p.get('threat_score', 0)
            if p_score >= 70:
                score += 25
                alerts.append(f"High-risk process: {p.get('name')} (PID: {p.get('pid')})")
            elif p_score >= 40:
                score += 10
            for tech in p.get('mitre_techniques', []):
                mitre_coverage.add(tech)

        # Evaluate Connections
        for c in connections:
            c_score = c.get('threat_score', 0)
            if c_score >= 50:
                score += 20
                alerts.append(f"Suspicious network socket: {c.get('remote_address')}")
            for tech in c.get('mitre_techniques', []):
                mitre_coverage.add(tech)

        # Evaluate Persistence
        for item in persistence_items:
            if item.get('risk_level') == 'High':
                score += 15
                mitre_coverage.add('T1547.001')
                alerts.append(f"Suspicious persistence entry: {item.get('name')}")

        final_score = min(100, max(0, score))

        tier = 'Critical' if final_score >= 75 else 'High' if final_score >= 50 else 'Medium' if final_score >= 25 else 'Low'

        return {
            'risk_score': final_score,
            'threat_tier': tier,
            'total_alerts': len(alerts),
            'alerts': alerts[:10],
            'mitre_techniques': sorted(list(mitre_coverage))
        }
