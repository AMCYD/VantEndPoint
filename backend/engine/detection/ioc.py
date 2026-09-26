from typing import List, Dict, Any, Optional

DEFAULT_IOCS = [
    {'ioc_type': 'ip', 'value': '185.220.101.5', 'threat_level': 'Critical', 'description': 'CobaltStrike C2 Server', 'mitre_technique': 'T1071.001'},
    {'ioc_type': 'ip', 'value': '194.26.29.42', 'threat_level': 'High', 'description': 'LockBit Ransomware Ingress Proxy', 'mitre_technique': 'T1486'},
    {'ioc_type': 'domain', 'value': 'c2.malicious.org', 'threat_level': 'Critical', 'description': 'Active Command & Control Domain', 'mitre_technique': 'T1071'},
    {'ioc_type': 'domain', 'value': 'beacon.threat-net.xyz', 'threat_level': 'High', 'description': 'Sliver C2 Domain', 'mitre_technique': 'T1071'},
    {'ioc_type': 'sha256', 'value': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'threat_level': 'Critical', 'description': 'Malicious Dropper Payload Hash', 'mitre_technique': 'T1204'},
    {'ioc_type': 'filename', 'value': 'vant_sync.bat', 'threat_level': 'High', 'description': 'Unverified Persistence Batch Script', 'mitre_technique': 'T1547.001'},
]

class IOCMatcher:
    """Matches endpoint artifacts against a database of Threat Indicators (IOCs)."""

    def __init__(self, iocs: Optional[List[Dict[str, Any]]] = None):
        self.iocs = iocs if iocs is not None else DEFAULT_IOCS

    def match_ip(self, ip: str) -> Optional[Dict[str, Any]]:
        if not ip or ip in ('127.0.0.1', '0.0.0.0', '::1'):
            return None
        for ioc in self.iocs:
            if ioc['ioc_type'] == 'ip' and ioc['value'] == ip:
                return ioc
        return None

    def match_hash(self, hash_val: str) -> Optional[Dict[str, Any]]:
        if not hash_val:
            return None
        hash_clean = hash_val.lower().strip()
        for ioc in self.iocs:
            if ioc['ioc_type'] in ('sha256', 'md5') and ioc['value'].lower() == hash_clean:
                return ioc
        return None

    def match_domain(self, domain: str) -> Optional[Dict[str, Any]]:
        if not domain:
            return None
        domain_clean = domain.lower().strip()
        for ioc in self.iocs:
            if ioc['ioc_type'] == 'domain' and ioc['value'].lower() == domain_clean:
                return ioc
        return None

    def match_filename(self, filename: str) -> Optional[Dict[str, Any]]:
        if not filename:
            return None
        fname_clean = filename.lower().strip()
        for ioc in self.iocs:
            if ioc['ioc_type'] == 'filename' and ioc['value'].lower() == fname_clean:
                return ioc
        return None

    def scan_telemetry(self, processes: List[Dict[str, Any]], connections: List[Dict[str, Any]]) -> Dict[str, Any]:
        matches = []
        for p in processes:
            # Check hash
            h_match = self.match_hash(p.get('hash_sha256', ''))
            if h_match:
                matches.append({
                    'ioc': h_match['value'],
                    'ioc_type': h_match['ioc_type'],
                    'severity': h_match['threat_level'],
                    'description': h_match['description'],
                    'mitre': h_match.get('mitre_technique', ''),
                    'matched_entity': f"Process {p.get('name')} (PID: {p.get('pid')})"
                })
            # Check filename
            f_match = self.match_filename(p.get('name', ''))
            if f_match:
                matches.append({
                    'ioc': f_match['value'],
                    'ioc_type': f_match['ioc_type'],
                    'severity': f_match['threat_level'],
                    'description': f_match['description'],
                    'mitre': f_match.get('mitre_technique', ''),
                    'matched_entity': f"Process Name: {p.get('name')} (PID: {p.get('pid')})"
                })

        for c in connections:
            raddr = c.get('raddr', {})
            ip = raddr.get('ip') if isinstance(raddr, dict) else (c.get('remote_address', '').split(':')[0] if ':' in c.get('remote_address', '') else None)
            if ip:
                ip_match = self.match_ip(ip)
                if ip_match:
                    matches.append({
                        'ioc': ip_match['value'],
                        'ioc_type': ip_match['ioc_type'],
                        'severity': ip_match['threat_level'],
                        'description': ip_match['description'],
                        'mitre': ip_match.get('mitre_technique', ''),
                        'matched_entity': f"Network Socket to {ip} (PID: {c.get('pid')})"
                    })

        total_scanned = len(processes) + len(connections)
        threat_score = 15
        if any(m['severity'] == 'Critical' for m in matches):
            threat_score = 90
        elif any(m['severity'] == 'High' for m in matches):
            threat_score = 70
        elif matches:
            threat_score = 45

        return {
            'total_scanned': total_scanned,
            'threat_score': threat_score,
            'matches': matches
        }
