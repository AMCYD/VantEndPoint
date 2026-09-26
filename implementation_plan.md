# Implementation Plan - VantEndpoint Full Stack EDR Platform Overhaul

Review and complete the VantEndpoint platform, resolving blank frontend pages, completing the Django REST backend with all core EDR modules (processes, network, services, persistence, Sysmon), implementing a resilient Windows collection and detection engine, adding Swagger/OpenAPI documentation at `/api/docs/`, and adding test suites and verification.

## User Review Required

> [!IMPORTANT]
> **Key Architectural Decisions & Environment Constraints Identified:**
> 1. **Pip & Google Fonts Network Sandbox:** The local environment restricts outbound socket connections (`WinError 10013`), which previously broke `npm run build` (due to `next/font/google` trying to fetch Inter from `fonts.googleapis.com`) and blocked `pip install psutil`.
> 2. **Resilient Native Windows Collection:** To ensure the collector is 100% operational regardless of pip package installation status, the collector layer will implement a multi-tiered architecture: using `pywin32` / `wmi` / `psutil` when present, and falling back seamlessly to Python's standard library `ctypes` (calling Windows Win32 APIs like `kernel32`, `advapi32`) and native Windows utilities (`wevtutil.exe` for Sysmon, `powershell.exe`, `tasklist.exe`, `netstat.exe`, `reg.exe query`). This guarantees **real live Windows endpoint data and Sysmon events** are gathered on any Windows machine!
> 3. **AG Grid v36 Modern Dark Theming:** The blank frontend pages stem from missing client-side module registration (`ClientSideRowModelModule` not registered on client), Server Component AG Grid registration in `layout.tsx`, and outdated theme classes. We will unify AG Grid under a sleek, resilient `<CyberDataGrid>` component with client-side module registry, custom cyber-dark theme, and graceful offline fallbacks.

---

## Root Causes of Critical Issues

### 1. Why Frontend Pages Render Blank:
- **`next/font/google` Build Failure:** `app/layout.tsx` imports `Inter` from `next/font/google`, which fails in restricted/offline environments and aborts SSR compilation.
- **AG Grid Module Registration in Server Component:** `ModuleRegistry.registerModules([AllCommunityModule])` in `layout.tsx` is executed on the server and is never registered in the client bundle.
- **Fragmented Page Registrations:** Individual pages (`processes`, `services`) either register only `ValidationModule` or have registration commented out, completely breaking table rendering in AG Grid v36.
- **Field Name Mismatches:** `/network` defined columns `process` and `ip`, whereas backend returns `pid`, `laddr`, `raddr`, `status`.
- **Misplaced Templates & Missing Routes:** `/dashboard` contained an unrelated "Student Course" template; `/settings` was missing entirely, yielding 404s.
- **Unprotected API Calls:** If Django was booting or returned errors, pages had no fallback states or retry UI, resulting in blank panels.

### 2. Incomplete Django Backend:
- `apps/threat_intel` and `apps/reports` contain only `apps.py` (no models, serializers, views, or endpoints).
- `apps/investigation` lacked models and persistence endpoints (`/api/persistence/`, `/api/sysmon/`, `/api/snapshot/`).
- `collector/` only had basic psutil stubs with no Sysmon log parsing or Windows persistence collection.
- `engine/` had only a dummy hashing stub with no anomaly detection, IOC matching, or threat scoring.
- `/api/docs/` OpenAPI/Swagger documentation was missing.

---

## Proposed Changes

### Component 1: Frontend Architecture & Blank Page Resolution

#### [MODIFY] [globals.css](file:///e:/Projects/VantEndPoint/frontend/src/app/globals.css)
- Define a system-native, cyber-themed typography stack (Inter-compatible fallback, monospace font for hashes/PIDs/IPs).
- Provide complete AG Grid dark theme CSS rules, glassmorphic panels, and badge styles for security threat levels (Critical, High, Medium, Low).

#### [MODIFY] [layout.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/layout.tsx)
- Remove `next/font/google` dependency to ensure 100% reliable offline Turbopack SSR builds.
- Configure client-side module initialization and structured sidebar navigation.

#### [NEW] [CyberDataGrid.tsx](file:///e:/Projects/VantEndPoint/frontend/src/components/CyberDataGrid.tsx)
- Reusable, bulletproof AG Grid wrapper registering `AllCommunityModule` safely on the client.
- Built-in search filter, row count indicator, CSV export button, loading skeleton, and error boundary with fallback states so tables never render blank.

#### [MODIFY] [processes/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/processes/page.tsx)
- Replace broken AG Grid logic with `<CyberDataGrid>`.
- Rich column schema: PID, Process Name, Executable Path, User, CPU %, Memory %, Status, Threat Score badge, Actions (inspect details).
- Process details modal showing cmdline, loaded modules, socket connections, and hash.

#### [MODIFY] [network/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/network/page.tsx)
- Correct column mapping matching backend data: PID, Process Name, Protocol, Local Address:Port, Remote Address:Port, State/Status.
- Security badge highlighting external vs internal connections and suspicious ports.

#### [MODIFY] [services/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/services/page.tsx)
- Working AG Grid with service name, display name, status (Running/Stopped), start type (Auto/Demand/Disabled), PID, and binary path.

#### [MODIFY] [users/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/users/page.tsx)
- User session monitor: username, session terminal, host, logon time, active processes count.

#### [NEW] [persistence/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/persistence/page.tsx)
- EDR Persistence View: Windows Registry Run keys (`HKLM`/`HKCU`), Scheduled Tasks, and Startup Folder items with risk indicators.

#### [NEW] [sysmon/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/sysmon/page.tsx)
- Real-time Sysmon Event Viewer: Event IDs 1 (Process Create), 3 (Network Connect), 7 (Image Load), 8 (CreateRemoteThread), 11 (File Create), 22 (DNS), severity badges, and raw event XML/JSON inspection.

#### [MODIFY] [security/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/security/page.tsx)
- Live endpoint threat analysis: dynamic risk score gauge, active threats counter, MITRE ATT&CK coverage matrix (T1059, T1003, T1055, etc.), and recent security alert logs.

#### [MODIFY] [page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/page.tsx) & [MODIFY] [dashboard/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/dashboard/page.tsx)
- Clean up unrelated student dashboard code.
- Provide a unified EDR Command Center: live telemetry (CPU, RAM, Disks), process summary, network activity, threat alerts, and one-click "Scan Endpoint" action.

#### [NEW] [threat-intel/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/threat-intel/page.tsx) & [NEW] [reports/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/reports/page.tsx) & [NEW] [settings/page.tsx](file:///e:/Projects/VantEndPoint/frontend/src/app/settings/page.tsx)
- Complete remaining feature views: IOC Management and lookup, Investigation Report generator (download PDF/JSON/CSV), and EDR Agent Settings.

#### [MODIFY] [api.ts](file:///e:/Projects/VantEndPoint/frontend/src/services/api.ts)
- Comprehensive API client covering all endpoints with resilient error handling and demo fallback modes so the UI is immediately responsive under all conditions.

---

### Component 2: Windows & Sysmon Collector Layer (`backend/collector/`)

#### [MODIFY] [backend/collector/base.py](file:///e:/Projects/VantEndPoint/backend/collector/base.py)
- Define clean abstract interfaces: `ProcessCollector`, `NetworkCollector`, `SystemCollector`, `ServiceCollector`, `PersistenceCollector`, `SysmonCollector`.

#### [NEW] [backend/collector/sysmon.py](file:///e:/Projects/VantEndPoint/backend/collector/sysmon.py)
- Sysmon collector querying `Microsoft-Windows-Sysmon/Operational` via `wevtutil.exe qe` / `powershell Get-WinEvent` / `pywin32.win32evtlog`.
- Parse Event IDs:
  - Event 1: Process Creation (CommandLine, Image, ParentImage, Hashes, User)
  - Event 3: Network Connection (SourceIp, DestinationIp, DestinationPort, Protocol)
  - Event 7: Image Loaded (Signed status, Signature, Hashes)
  - Event 8: CreateRemoteThread (SourceProcessId, TargetProcessId)
  - Event 11: FileCreate (TargetFilename)
  - Event 22: DNS Query (QueryName, QueryStatus)
- Structured fallback events if Sysmon is not currently enabled on the test endpoint.

#### [NEW] [backend/collector/persistence.py](file:///e:/Projects/VantEndPoint/backend/collector/persistence.py)
- Inspect Windows Registry Run/RunOnce keys (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`, `HKLM\...`), Windows Startup folders, and Scheduled Tasks via `schtasks.exe /query /fo csv`.

#### [NEW] [backend/collector/windows_native.py](file:///e:/Projects/VantEndPoint/backend/collector/windows_native.py)
- Resilient native Windows collector leveraging standard library `ctypes` and Windows CLI tools (`netstat -ano`, `tasklist /v /fo csv`, `sc query`, `wmic`/powershell).
- Enriches processes with file hashes (SHA256), parent PID, and authenticode digital signature status.

#### [MODIFY] [backend/collector/psutil_impl.py](file:///e:/Projects/VantEndPoint/backend/collector/psutil_impl.py) & [MODIFY] [backend/psutil.py](file:///e:/Projects/VantEndPoint/backend/psutil.py)
- Wire collectors to seamlessly use psutil/pywin32/wmi when available, and fall back to `windows_native.py` so real endpoint data is always returned.

---

### Component 3: Security & Detection Engine (`backend/engine/`)

#### [MODIFY] [backend/engine/security/hashing.py](file:///e:/Projects/VantEndPoint/backend/engine/security/hashing.py)
- Implement genuine SHA256 and MD5 file hashing with chunked file reading.
- Implement authenticode signature verification using `powershell Get-AuthenticodeSignature` / WinTrust.

#### [NEW] [backend/engine/detection/anomaly.py](file:///e:/Projects/VantEndPoint/backend/engine/detection/anomaly.py)
- Anomaly detection rules:
  - Execution from suspicious paths (`%TEMP%`, `%APPDATA%`, `\Downloads\`, `\Users\Public\`).
  - Masquerading system processes (e.g. `svchost.exe`, `lsass.exe`, `csrss.exe` running from outside `System32`).
  - Suspicious command-line arguments (PowerShell `-enc`, `-w hidden`, `downloadstring`, `IEX`, `certutil -urlcache`, `cmd.exe /c powershell`).
  - Suspicious parent-child process relationships (Office documents or web browsers spawning `cmd.exe`, `powershell.exe`, or `cscript.exe`).
  - Network anomalies (connections to non-standard ports or suspicious outbound communication).

#### [NEW] [backend/engine/detection/ioc.py](file:///e:/Projects/VantEndPoint/backend/engine/detection/ioc.py)
- Fast IOC lookup engine: compares current process hashes, remote IPs, and domain queries against known threat indicators stored in the database or feed.

#### [NEW] [backend/engine/detection/scoring.py](file:///e:/Projects/VantEndPoint/backend/engine/detection/scoring.py)
- Composite Risk Scoring algorithm (0-100 score, Low/Medium/High/Critical tier).
- MITRE ATT&CK mapping engine (assigns technique IDs like T1059.001, T1003, T1055, T1547.001 to detected alerts).

#### [NEW] [backend/engine/export/exporter.py](file:///e:/Projects/VantEndPoint/backend/engine/export/exporter.py)
- Export investigation snapshots and alerts to JSON, CSV, and structured executive markdown/text formats.

---

### Component 4: Django Apps, Models, Serializers, Views & Swagger (`backend/`)

#### [MODIFY] [backend/apps/investigation/](file:///e:/Projects/VantEndPoint/backend/apps/investigation)
- `models.py`: `EndpointProcess`, `NetworkConnection`, `PersistenceItem`, `SecurityAlert`, `SysmonEvent`, `InvestigationSnapshot`.
- `serializers.py`: DRF serializers for processes, connections, services, persistence, sysmon events, alerts, and snapshots.
- `views.py`: Complete views:
  - `ProcessListView` (with `?search=`, `?suspicious=`, `?sort=`), `ProcessDetailView` (with hash & detection analysis).
  - `NetworkListView` (with `?status=`, `?port=`).
  - `ServiceListView`, `UserListView`, `SystemInfoView`.
  - `PersistenceListView` (Registry, Scheduled Tasks, Startup).
  - `SysmonEventListView` (with `?event_id=`, `?severity=`).
  - `SnapshotView` (POST trigger snapshot, GET snapshot history).

#### [MODIFY] [backend/apps/threat_intel/](file:///e:/Projects/VantEndPoint/backend/apps/threat_intel)
- `models.py`: `IOC` (type: ip, domain, hash, filename, pattern; value; threat_level; description; mitre_technique), `ThreatFeed`.
- `serializers.py` & `views.py`: CRUD endpoints for IOCs, scan current endpoint against IOC database, get threat statistics.

#### [MODIFY] [backend/apps/reports/](file:///e:/Projects/VantEndPoint/backend/apps/reports)
- `models.py`: `SecurityReport` (title, report_type, status, summary, findings_json, risk_score, created_at).
- `serializers.py` & `views.py`: Generate reports from current snapshot, list reports, export report findings.

#### [MODIFY] [backend/api/urls.py](file:///e:/Projects/VantEndPoint/backend/api/urls.py) & [MODIFY] [backend/config/urls.py](file:///e:/Projects/VantEndPoint/backend/config/urls.py)
- Centralized routing for all endpoints: `/api/processes/`, `/api/network/`, `/api/services/`, `/api/users/`, `/api/system/`, `/api/persistence/`, `/api/sysmon/`, `/api/threat-intel/`, `/api/reports/`, `/api/snapshot/`.
- OpenAPI schema endpoint at `/api/schema/`.
- Swagger UI interactive documentation at `/api/docs/`.

#### [MODIFY] [backend/config/settings.py](file:///e:/Projects/VantEndPoint/backend/config/settings.py)
- Allow CORS for both `http://localhost:3000` and `http://127.0.0.1:3000`.
- Security logging configuration.
- DRF configuration supporting both JWT and session/token permissions.

---

### Component 5: Testing, Scripts & Documentation

#### [NEW] [backend/tests/](file:///e:/Projects/VantEndPoint/backend/tests)
- Unit tests:
  - `test_collectors.py`: Process, network, system, persistence, and Sysmon event parsing.
  - `test_detection_engine.py`: Anomaly detection rules, IOC matching, and threat scoring.
  - `test_api_endpoints.py`: DRF endpoints for processes, network, sysmon, threat intel, reports, and Swagger docs.

#### [MODIFY] [Start_VantEndpoint.bat](file:///e:/Projects/VantEndPoint/Start_VantEndpoint.bat) & [MODIFY] [Stop_VantEndpoint.bat](file:///e:/Projects/VantEndPoint/Stop_VantEndpoint.bat)
- Ensure window titles match `Stop_VantEndpoint.bat` process cleanup tags.
- Run migrations automatically on startup if pending.

#### [MODIFY] [README.md](file:///e:/Projects/VantEndPoint/README.md)
- Update with full endpoint documentation, Sysmon collection setup, threat engine overview, and development commands.

---

## Verification Plan

### Automated Tests
1. **Frontend Production Build:**
   ```powershell
   cd e:\Projects\VantEndPoint\frontend
   npm run build
   ```
   *Verify Turbopack build succeeds with 0 errors and all routes (`/`, `/processes`, `/network`, `/services`, `/users`, `/security`, `/system`, `/persistence`, `/sysmon`, `/threat-intel`, `/reports`, `/settings`) compile.*
2. **Backend Migrations & Django Checks:**
   ```powershell
   cd e:\Projects\VantEndPoint\backend
   venv\Scripts\python.exe manage.py makemigrations
   venv\Scripts\python.exe manage.py migrate
   venv\Scripts\python.exe manage.py check
   ```
3. **Backend Test Suite:**
   ```powershell
   cd e:\Projects\VantEndPoint\backend
   venv\Scripts\python.exe manage.py test tests
   ```
   *Verify all collector, engine, and DRF endpoint tests pass.*

### Manual & Browser Verification
1. **Interactive UI Verification:**
   - Launch servers and browse `http://localhost:3000`.
   - Verify every page renders immediately without blank screens or console exceptions.
   - Verify AG Grid displays real processes, network sockets, services, users, and persistence items.
   - Verify Security Dashboard displays live threat indicators and MITRE ATT&CK mappings.
2. **API & Swagger Verification:**
   - Navigate to `http://127.0.0.1:8000/api/docs/` and verify OpenAPI/Swagger documentation loads and executes sample queries.
