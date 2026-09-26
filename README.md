# VantEndpoint

**Enterprise Endpoint Investigation, System Monitoring, and Security Analysis Platform.**

VantEndpoint is an endpoint detection and response (EDR) and digital forensics (DFIR) platform designed to provide visibility into Windows endpoints. It allows Security Analysts, SOC teams, and Incident Responders to investigate live processes, network connections, persistence mechanisms, Sysmon events, and system behavior.

---

## Key Features

- **EDR Command Center:** Live endpoint risk score, CPU/RAM/Disk telemetry gauges, active threat count, and one-click forensic scans.
- **Process Investigation:** Live process tree with CPU/memory consumption, command lines, memory-safe SHA-256 chunked hashing, and Microsoft Authenticode digital signature verification.
- **Network Forensics:** Real-time TCP/UDP socket monitoring with external IP scoping, local/remote ports, and C2 listener detection.
- **Windows Persistence Audit:** Automatic inspection of Registry Run/RunOnce keys (`HKCU` and `HKLM`), Windows Startup folders, and active Scheduled Tasks.
- **Sysmon Operational Telemetry:** Ingestion and parsing of `Microsoft-Windows-Sysmon/Operational` events (Process Create 1, Network Connect 3, Image Load 7, CreateRemoteThread 8, FileCreate 11, DNS Query 22).
- **Behavioral Detection Engine:** Rule-based anomaly detection identifying LOLBIN abuse (`certutil`, `bitsadmin`, `mshta`), Base64 encoded PowerShell commands, system process masquerading, and suspicious execution directories (`%TEMP%`, `%APPDATA%`, `\Public\`).
- **Threat Intelligence (IOC) Matching:** Match active telemetry against known malicious hashes, C2 IP addresses, and malicious domains mapped to MITRE ATT&CK techniques.
- **Forensic Reports & DFIR Audits:** Export investigation findings to JSON, CSV, and markdown summaries.
- **Interactive OpenAPI/Swagger:** Full interactive API documentation served at `/api/docs/`.

---

## Folder Structure

```
VantEndpoint/
│
├── backend/                  # Django REST Framework backend
│   ├── api/                  # Centralized DRF routing & OpenAPI/Swagger documentation
│   │   ├── urls.py           # API endpoints routing
│   │   └── docs.py           # OpenAPI 3.0 specification & Swagger UI
│   ├── apps/                 # Django applications
│   │   ├── investigation/    # Processes, network, system, persistence, Sysmon & snapshots
│   │   ├── threat_intel/     # IOC database & live indicator matching
│   │   └── reports/          # Forensic report generation & exports
│   ├── collector/            # Multi-tiered endpoint telemetry collectors
│   │   ├── base.py           # Abstract collector interfaces
│   │   ├── windows_native.py # Ctypes & Windows native telemetry (tasklist, netstat, sc)
│   │   ├── sysmon.py         # Microsoft-Windows-Sysmon event log parser
│   │   ├── persistence.py    # Registry Run keys, Scheduled Tasks, Startup folder
│   │   └── psutil_impl.py    # Unified collector adapter
│   ├── engine/               # Security and detection engines
│   │   ├── detection/        # Anomaly detection, IOC matching, and threat scoring (0-100)
│   │   ├── security/         # Memory-safe SHA-256/MD5 hashing & Authenticode signature check
│   │   └── export/           # JSON, CSV, and summary report exporters
│   ├── tests/                # Automated backend test suite (collectors, engine, API)
│   └── manage.py             # Django CLI
│
├── frontend/                 # Next.js React frontend
│   ├── src/
│   │   ├── app/              # App router pages (dashboard, processes, network, sysmon, etc.)
│   │   ├── components/       # CyberDataGrid with dark cyber styling & CSV export
│   │   ├── layouts/          # EDR Sidebar navigation
│   │   └── services/         # Axios API clients & fallback telemetry
│   └── package.json          # Node dependencies
│
├── Install_Dependencies.bat  # Automated dependency installation script
├── Update_Dependencies.bat   # Dependency update script
├── Start_VantEndpoint.bat    # Automated startup script (migrations, backend, frontend, browser)
├── Stop_VantEndpoint.bat     # Graceful process and port termination script
└── README.md
```

---

## Prerequisites

- **Python 3.13+** (Must be in PATH)
- **Node.js 18+** (Must be in PATH)
- **Windows OS** (For native Windows collectors and Sysmon logs)

---

## Installation & First-Time Setup

1. Double-click **`Install_Dependencies.bat`**
   - Automatically creates the Python virtual environment, installs backend requirements, and installs Next.js dependencies.
2. Once the installation completes, press any key to close the window.

---

## Running the Application

To start VantEndpoint, double-click **`Start_VantEndpoint.bat`**.

This script will:
1. Verify the Python virtual environment.
2. Apply any pending database migrations automatically.
3. Start the Django API Server (`http://127.0.0.1:8000`).
4. Start the Next.js Frontend Server (`http://localhost:3000`).
5. Open your default web browser to the dashboard.

---

## Stopping the Application

To shut down VantEndpoint, double-click **`Stop_VantEndpoint.bat`**. This terminates the server processes and frees ports `8000` and `3000`.

---

## Default URLs

- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Root:** [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Swagger/OpenAPI Documentation:** [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **OpenAPI JSON Schema:** [http://127.0.0.1:8000/api/schema/](http://127.0.0.1:8000/api/schema/)

---

## REST API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/processes/` | `GET` | List active processes with anomaly flags and threat scores |
| `/api/processes/<pid>/` | `GET` | Deep process details, hashes, command line, threads |
| `/api/processes/<pid>/kill/` | `POST` | Terminate process by PID |
| `/api/network/` | `GET` | Active TCP/UDP socket connections and remote IPs |
| `/api/services/` | `GET` | Installed Windows services and binary paths |
| `/api/users/` | `GET` | Active interactive user sessions and terminal hosts |
| `/api/system/` | `GET` | Hardware specs, CPU usage, RAM and disk metrics |
| `/api/persistence/` | `GET` | Registry Run keys, Scheduled Tasks, Startup folder |
| `/api/sysmon/` | `GET` | Query Sysmon event log stream (`?event_id=`, `?severity=`) |
| `/api/snapshot/` | `GET`, `POST` | Retrieve or trigger full endpoint forensic snapshot |
| `/api/threat-intel/iocs/` | `GET`, `POST` | Manage threat indicators (IP, domain, hash) |
| `/api/threat-intel/match/` | `POST` | Run live IOC scan across running endpoint artifacts |
| `/api/reports/` | `GET`, `POST` | Generate or view archived forensic audit reports |
| `/api/reports/<id>/export/` | `GET` | Export report findings (`?format=json` or `?format=csv`) |
| `/api/docs/` | `GET` | Interactive Swagger UI API documentation |
| `/api/schema/` | `GET` | Raw OpenAPI 3.0.3 specification in JSON |

---

## Running Automated Tests

### Backend Test Suite (Django / Pytest)
```powershell
cd backend
venv\Scripts\python.exe manage.py test tests
```

### Frontend Production Build Validation
```powershell
cd frontend
npm run build
```
