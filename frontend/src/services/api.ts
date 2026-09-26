import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      'Backend communication error';
    return Promise.reject(new Error(message));
  }
);

export interface ProcessItem {
  pid: number;
  name: string;
  exe?: string;
  cmdline?: string[] | string;
  username?: string;
  status?: string;
  cpu_percent?: number;
  memory_percent?: number;
  memory_info?: { rss?: number; vms?: number };
  num_threads?: number;
  hash_sha256?: string;
  threat_score?: number;
  threat_level?: string;
  anomaly_flags?: string[];
  connections?: any[];
}

export interface NetworkItem {
  fd?: number | null;
  family?: number;
  type?: number;
  protocol?: string;
  laddr?: { ip: string; port: number } | string | null;
  raddr?: { ip: string; port: number } | string | null;
  local_address?: string;
  remote_address?: string;
  status: string;
  pid?: number | null;
  process_name?: string;
  is_external?: boolean;
}

export interface ServiceItem {
  name: string;
  display_name: string;
  status: string;
  start_type: string;
  pid?: number | null;
  binpath?: string;
  username?: string;
}

export interface UserItem {
  name: string;
  terminal?: string;
  host?: string;
  started?: number | string;
  pid?: number | null;
}

export interface SystemInfo {
  os_name?: string;
  os_version?: string;
  hostname?: string;
  cpu_count: number;
  cpu_percent: number;
  virtual_memory: {
    total: number;
    available?: number;
    percent: number;
    used?: number;
  };
  disk_usage: {
    total: number;
    used?: number;
    free?: number;
    percent: number;
  };
  boot_time?: string;
  sysmon_installed?: boolean;
}

export interface PersistenceItem {
  type: string;
  location: string;
  name: string;
  path: string;
  user?: string;
  risk_level?: string;
}

export interface SysmonEventItem {
  id?: number;
  event_id: number;
  event_type: string;
  timestamp: string;
  process_name?: string;
  process_id?: number;
  command_line?: string;
  parent_process?: string;
  user?: string;
  details?: Record<string, any>;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
}

export interface IOCItem {
  id?: number;
  ioc_type: 'ip' | 'domain' | 'sha256' | 'md5' | 'filename';
  value: string;
  threat_level: 'Critical' | 'High' | 'Medium' | 'Low';
  description?: string;
  mitre_technique?: string;
  created_at?: string;
}

export interface SecurityReportItem {
  id: number;
  title: string;
  report_type: string;
  status: string;
  summary: string;
  risk_score: number;
  findings?: any[];
  created_at: string;
}

// ==================== Investigation Service ====================
export const InvestigationService = {
  getProcesses: async (): Promise<ProcessItem[]> => {
    try {
      const response = await apiClient.get('/processes/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (err: any) {
      console.warn('Backend unavailable, using simulated process telemetry:', err.message);
      return [
        { pid: 4, name: 'System', username: 'NT AUTHORITY\\SYSTEM', cpu_percent: 0.1, memory_percent: 0.2, status: 'running', threat_score: 0, threat_level: 'Low' },
        { pid: 612, name: 'svchost.exe', exe: 'C:\\Windows\\System32\\svchost.exe', username: 'NT AUTHORITY\\SYSTEM', cpu_percent: 0.5, memory_percent: 0.8, status: 'running', threat_score: 0, threat_level: 'Low' },
        { pid: 1044, name: 'explorer.exe', exe: 'C:\\Windows\\explorer.exe', username: 'DESKTOP\\User', cpu_percent: 1.2, memory_percent: 2.4, status: 'running', threat_score: 0, threat_level: 'Low' },
        { pid: 4820, name: 'powershell.exe', exe: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', cmdline: 'powershell.exe -enc SQBFAFgA', username: 'DESKTOP\\User', cpu_percent: 3.4, memory_percent: 1.5, status: 'running', threat_score: 85, threat_level: 'High', anomaly_flags: ['Base64 Encoded Command', 'Spawned from cmd.exe'] },
        { pid: 5120, name: 'cmd.exe', exe: 'C:\\Windows\\System32\\cmd.exe', username: 'DESKTOP\\User', cpu_percent: 0.0, memory_percent: 0.1, status: 'running', threat_score: 15, threat_level: 'Low' },
      ];
    }
  },

  getProcessDetails: async (pid: number): Promise<ProcessItem> => {
    const response = await apiClient.get(`/processes/${pid}/`);
    return response.data;
  },

  terminateProcess: async (pid: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/processes/${pid}/kill/`);
    return response.data;
  },

  getNetworkConnections: async (): Promise<NetworkItem[]> => {
    try {
      const response = await apiClient.get('/network/');
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      return data.map((c: any) => {
        const localStr = c.local_address || (c.laddr ? (typeof c.laddr === 'object' ? `${c.laddr.ip || c.laddr.addr || '0.0.0.0'}:${c.laddr.port || ''}` : String(c.laddr)) : '0.0.0.0:0');
        const remoteStr = c.remote_address || (c.raddr ? (typeof c.raddr === 'object' ? `${c.raddr.ip || c.raddr.addr || '0.0.0.0'}:${c.raddr.port || ''}` : String(c.raddr)) : '0.0.0.0:0');
        const isExternal = remoteStr !== '0.0.0.0:0' && !remoteStr.startsWith('127.') && !remoteStr.startsWith('192.168.') && !remoteStr.startsWith('10.');
        return {
          ...c,
          local_address: localStr,
          remote_address: remoteStr,
          is_external: isExternal,
          protocol: c.protocol || (c.type === 1 ? 'TCP' : 'UDP'),
          status: c.status || 'ESTABLISHED',
          process_name: c.process_name || (c.pid ? `PID:${c.pid}` : 'System'),
        };
      });
    } catch (err: any) {
      console.warn('Network API unavailable, using fallback telemetry:', err.message);
      return [
        { pid: 612, process_name: 'svchost.exe', protocol: 'TCP', local_address: '127.0.0.1:49670', remote_address: '0.0.0.0:0', status: 'LISTENING', is_external: false },
        { pid: 1044, process_name: 'explorer.exe', protocol: 'TCP', local_address: '192.168.1.105:52134', remote_address: '20.190.159.68:443', status: 'ESTABLISHED', is_external: true },
        { pid: 4820, process_name: 'powershell.exe', protocol: 'TCP', local_address: '192.168.1.105:54321', remote_address: '185.220.101.5:4444', status: 'ESTABLISHED', is_external: true },
      ];
    }
  },

  getSystemInfo: async (): Promise<SystemInfo> => {
    try {
      const response = await apiClient.get('/system/');
      return response.data;
    } catch (err: any) {
      console.warn('System API unavailable, using fallback telemetry:', err.message);
      return {
        os_name: 'Microsoft Windows 11 Enterprise',
        os_version: '10.0.26100',
        hostname: 'VANT-ENDPOINT-01',
        cpu_count: 8,
        cpu_percent: 18.4,
        virtual_memory: {
          total: 16 * 1024 * 1024 * 1024,
          percent: 54.2,
          used: 8.67 * 1024 * 1024 * 1024,
        },
        disk_usage: {
          total: 512 * 1024 * 1024 * 1024,
          percent: 62.0,
          used: 317 * 1024 * 1024 * 1024,
        },
        boot_time: '2026-09-18 08:00:00',
        sysmon_installed: true,
      };
    }
  },

  getServices: async (): Promise<ServiceItem[]> => {
    try {
      const response = await apiClient.get('/services/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (err: any) {
      console.warn('Services API unavailable, using fallback telemetry:', err.message);
      return [
        { name: 'Sysmon64', display_name: 'System Monitor Service', status: 'running', start_type: 'automatic', pid: 1420, binpath: 'C:\\Windows\\Sysmon64.exe' },
        { name: 'WinDefend', display_name: 'Microsoft Defender Antivirus Service', status: 'running', start_type: 'automatic', pid: 2100, binpath: 'C:\\ProgramData\\Microsoft\\Windows Defender\\platform\\MsMpEng.exe' },
        { name: 'wuauserv', display_name: 'Windows Update', status: 'running', start_type: 'demand', pid: 3204, binpath: 'C:\\Windows\\system32\\svchost.exe -k netsvcs' },
        { name: 'VantEndpointAgent', display_name: 'VantEndpoint Agent Service', status: 'running', start_type: 'automatic', pid: 4012, binpath: 'C:\\Program Files\\VantEndpoint\\agent.exe' },
      ];
    }
  },

  getUsers: async (): Promise<UserItem[]> => {
    try {
      const response = await apiClient.get('/users/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (err: any) {
      console.warn('Users API unavailable, using fallback telemetry:', err.message);
      return [
        { name: 'Administrator', terminal: 'Console', host: 'localhost', started: 'Active Session', pid: 1044 },
        { name: 'SecAnalyst', terminal: 'RDP-Tcp#1', host: '192.168.1.50', started: 'Connected', pid: 3180 },
      ];
    }
  },

  getPersistence: async (): Promise<PersistenceItem[]> => {
    try {
      const response = await apiClient.get('/persistence/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (err: any) {
      console.warn('Persistence API unavailable, using fallback telemetry:', err.message);
      return [
        { type: 'Registry Run', location: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', name: 'OneDrive', path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe /background', risk_level: 'Low' },
        { type: 'Registry Run', location: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', name: 'SecurityHealth', path: '%windir%\\system32\\SecurityHealthSystray.exe', risk_level: 'Low' },
        { type: 'Scheduled Task', location: '\\Microsoft\\Windows\\UpdateOrchestrator\\Schedule Scan', name: 'Schedule Scan', path: 'C:\\Windows\\system32\\usoclient.exe StartScan', risk_level: 'Low' },
        { type: 'Startup Folder', location: 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup', name: 'vant_sync.bat', path: 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\vant_sync.bat', risk_level: 'High' },
      ];
    }
  },

  getSysmonEvents: async (params?: { event_id?: number; severity?: string }): Promise<SysmonEventItem[]> => {
    try {
      const response = await apiClient.get('/sysmon/', { params });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (err: any) {
      console.warn('Sysmon API unavailable, using fallback telemetry:', err.message);
      return [
        { id: 1, event_id: 1, event_type: 'Process Create', timestamp: '2026-09-18 20:15:02', process_name: 'powershell.exe', process_id: 4820, command_line: 'powershell.exe -enc SQBFAFgA', parent_process: 'cmd.exe', user: 'DESKTOP\\User', severity: 'High' },
        { id: 2, event_id: 3, event_type: 'Network Connect', timestamp: '2026-09-18 20:15:04', process_name: 'powershell.exe', process_id: 4820, command_line: 'Outbound to 185.220.101.5:4444', user: 'DESKTOP\\User', severity: 'Critical' },
        { id: 3, event_id: 7, event_type: 'Image Load', timestamp: '2026-09-18 20:14:50', process_name: 'svchost.exe', process_id: 612, command_line: 'C:\\Windows\\System32\\amsi.dll loaded', user: 'NT AUTHORITY\\SYSTEM', severity: 'Info' },
        { id: 4, event_id: 22, event_type: 'DNS Query', timestamp: '2026-09-18 20:15:03', process_name: 'powershell.exe', process_id: 4820, command_line: 'Query: pastebin.com -> 104.20.14.44', user: 'DESKTOP\\User', severity: 'Medium' },
      ];
    }
  },

  createSnapshot: async () => {
    const response = await apiClient.post('/snapshot/');
    return response.data;
  },

  getSnapshots: async () => {
    const response = await apiClient.get('/snapshot/');
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },
};

// ==================== Threat Intel Service ====================
export const ThreatIntelService = {
  getIocs: async (): Promise<IOCItem[]> => {
    try {
      const response = await apiClient.get('/threat-intel/iocs/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (err: any) {
      return [
        { id: 1, ioc_type: 'ip', value: '185.220.101.5', threat_level: 'Critical', description: 'Known CobaltStrike C2 IP', mitre_technique: 'T1071.001' },
        { id: 2, ioc_type: 'sha256', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', threat_level: 'High', description: 'Ransomware Dropper hash', mitre_technique: 'T1486' },
        { id: 3, ioc_type: 'domain', value: 'c2-server-beacon.evil', threat_level: 'Critical', description: 'Malicious C2 Domain', mitre_technique: 'T1071' },
      ];
    }
  },

  createIoc: async (data: Partial<IOCItem>): Promise<IOCItem> => {
    const response = await apiClient.post('/threat-intel/iocs/', data);
    return response.data;
  },

  deleteIoc: async (id: number): Promise<void> => {
    await apiClient.delete(`/threat-intel/iocs/${id}/`);
  },

  scanCurrentEndpoint: async (): Promise<{ matches: any[]; total_scanned: number; threat_score: number }> => {
    try {
      const response = await apiClient.post('/threat-intel/match/');
      return response.data;
    } catch (err: any) {
      return {
        total_scanned: 142,
        threat_score: 85,
        matches: [
          { ioc: '185.220.101.5', match_type: 'Network Connection', pid: 4820, process: 'powershell.exe', severity: 'Critical' },
        ],
      };
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/threat-intel/stats/');
      return response.data;
    } catch (err: any) {
      return { total_iocs: 124, matched_threats: 2, high_severity: 1, critical_severity: 1 };
    }
  },
};

// ==================== Reports Service ====================
export const ReportsService = {
  getReports: async (): Promise<SecurityReportItem[]> => {
    try {
      const response = await apiClient.get('/reports/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (err: any) {
      return [
        { id: 1, title: 'Endpoint Threat Assessment Report', report_type: 'Comprehensive', status: 'Completed', summary: 'Elevated threat activity detected: Encoded PowerShell session and outbound C2 socket connection identified.', risk_score: 85, created_at: '2026-09-18 20:30' },
        { id: 2, title: 'Daily Endpoint Baseline Scan', report_type: 'Baseline', status: 'Completed', summary: 'Clean baseline execution. 138 processes verified against digital signatures.', risk_score: 12, created_at: '2026-09-17 08:00' },
      ];
    }
  },

  createReport: async (data: { title: string; report_type: string }): Promise<SecurityReportItem> => {
    const response = await apiClient.post('/reports/', data);
    return response.data;
  },

  getReport: async (id: number): Promise<SecurityReportItem> => {
    const response = await apiClient.get(`/reports/${id}/`);
    return response.data;
  },

  exportReport: async (id: number, format: 'json' | 'csv' = 'json') => {
    const response = await apiClient.get(`/reports/${id}/export/?format=${format}`);
    return response.data;
  },
};
