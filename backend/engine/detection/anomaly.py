import os
import re
from typing import List, Dict, Any

SUSPICIOUS_PATHS = [
    r'\temp\\',
    r'\appdata\local\temp\\',
    r'\users\public\\',
    r'\downloads\\',
    r'c:\perflogs\\',
]

CRITICAL_SYSTEM_BINARIES = [
    'svchost.exe',
    'lsass.exe',
    'csrss.exe',
    'services.exe',
    'smss.exe',
    'wininit.exe',
    'winlogon.exe',
]

SUSPICIOUS_CMD_PATTERNS = [
    (re.compile(r'-(?:enc|encodedcommand)\s+[A-Za-z0-9+/=]{8,}', re.IGNORECASE), 'Base64 Encoded PowerShell Command', 'T1059.001'),
    (re.compile(r'downloadstring|downloadfile|iex\s*\(', re.IGNORECASE), 'PowerShell Web Download & Execute (IEX)', 'T1059.001'),
    (re.compile(r'certutil(?:\.exe)?\s+(?:-[a-z0-9]+\s+)*(?:-urlcache|-decode|-split)', re.IGNORECASE), 'CertUtil LOLBIN Ingress / Decode', 'T1105'),
    (re.compile(r'bitsadmin(?:\.exe)?\s+/transfer', re.IGNORECASE), 'BitsAdmin LOLBIN File Transfer', 'T1197'),
    (re.compile(r'mshta(?:\.exe)?\s+(?:http|javascript|vbscript)', re.IGNORECASE), 'Mshta Execution of Remote Script', 'T1218.005'),
    (re.compile(r'regsvr32(?:\.exe)?\s+(?:/s\s+|/u\s+|/n\s+|/i:http)', re.IGNORECASE), 'Regsvr32 Squiblydoo Remote Scriptlet', 'T1218.010'),
    (re.compile(r'vssadmin(?:\.exe)?\s+delete\s+shadows', re.IGNORECASE), 'Vssadmin Shadow Copy Deletion (Ransomware Tactic)', 'T1490'),
    (re.compile(r'wmic(?:\.exe)?\s+shadowcopy\s+delete', re.IGNORECASE), 'WMIC Shadow Copy Deletion', 'T1490'),
    (re.compile(r'mimikatz|sekurlsa|kerberos::', re.IGNORECASE), 'Mimikatz Credential Dumping Keyword', 'T1003'),
]

SUSPICIOUS_PORTS = {
    4444: 'Metasploit / Cobalt Strike Default Listener',
    1337: 'Common Backdoor / C2 Port',
    8888: 'Alternative HTTP / C2 Port',
    6667: 'IRC Botnet C2 Port',
    9001: 'Tor / C2 Relay Port',
    31337: 'Legacy BackOrifice C2 Port',
}

class AnomalyDetector:
    """Evaluates processes, commands, and network connections for anomalous cyber threat patterns."""

    @staticmethod
    def analyze_process(proc: Dict[str, Any]) -> Dict[str, Any]:
        flags = []
        mitre_techniques = []
        threat_score = 0

        name = proc.get('name', '').lower()
        exe = proc.get('exe', '').lower()
        cmdline = proc.get('cmdline', [])
        cmd_str = " ".join(cmdline) if isinstance(cmdline, list) else str(cmdline)

        # 1. System Process Masquerading
        for sys_bin in CRITICAL_SYSTEM_BINARIES:
            if name == sys_bin:
                if exe and 'system32' not in exe and 'syswow64' not in exe:
                    flags.append(f"Masquerading system process: {name} executed from non-System32 path ({exe})")
                    mitre_techniques.append('T1036.005')
                    threat_score += 65

        # 2. Suspicious Execution Path
        for s_path in SUSPICIOUS_PATHS:
            if s_path in exe:
                flags.append(f"Execution from suspicious/untrusted directory: {exe}")
                mitre_techniques.append('T1036')
                threat_score += 35
                break

        # 3. Suspicious Command Line Arguments
        for pattern, desc, technique in SUSPICIOUS_CMD_PATTERNS:
            if pattern.search(cmd_str):
                flags.append(f"Suspicious CLI pattern: {desc}")
                mitre_techniques.append(technique)
                threat_score += 45

        # 4. In-Memory or Unsigned Binary
        if not exe and name not in ('system', 'system idle process', 'registry'):
            flags.append(f"Process has no associated image file on disk: {name}")
            mitre_techniques.append('T1055')
            threat_score += 20

        # Cap score at 100
        threat_score = min(100, threat_score)

        return {
            'is_anomalous': len(flags) > 0,
            'anomaly_flags': flags,
            'mitre_techniques': list(set(mitre_techniques)),
            'threat_score': threat_score,
            'threat_level': 'Critical' if threat_score >= 70 else 'High' if threat_score >= 40 else 'Medium' if threat_score >= 20 else 'Low'
        }

    @staticmethod
    def analyze_connection(conn: Dict[str, Any]) -> Dict[str, Any]:
        flags = []
        mitre_techniques = []
        threat_score = 0

        raddr = conn.get('raddr', {})
        port = 0
        if isinstance(raddr, dict):
            port = raddr.get('port', 0)
        elif isinstance(conn.get('remote_address'), str) and ':' in conn.get('remote_address', ''):
            try:
                port = int(conn['remote_address'].rsplit(':', 1)[1])
            except ValueError:
                port = 0

        if port in SUSPICIOUS_PORTS:
            flags.append(f"Connection to suspicious C2 port {port} ({SUSPICIOUS_PORTS[port]})")
            mitre_techniques.append('T1071.001')
            threat_score += 55

        return {
            'is_anomalous': len(flags) > 0,
            'anomaly_flags': flags,
            'mitre_techniques': list(set(mitre_techniques)),
            'threat_score': threat_score,
            'threat_level': 'Critical' if threat_score >= 70 else 'High' if threat_score >= 40 else 'Medium' if threat_score >= 20 else 'Low'
        }
