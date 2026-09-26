from django.http import JsonResponse, HttpResponse
from django.views import View

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "VantEndpoint EDR API",
        "version": "1.0.0",
        "description": "Enterprise Endpoint Investigation, System Monitoring, Sysmon Forensics, and Security Analysis Platform REST API."
    },
    "servers": [
        {"url": "http://127.0.0.1:8000/api", "description": "Local VantEndpoint API Server"}
    ],
    "paths": {
        "/processes/": {
            "get": {
                "summary": "List running processes",
                "description": "Returns active processes with CPU, memory, execution path, and behavioral anomaly scores.",
                "parameters": [
                    {"name": "search", "in": "query", "schema": {"type": "string"}, "description": "Search by process name or PID"},
                    {"name": "suspicious", "in": "query", "schema": {"type": "boolean"}, "description": "Filter only anomalous processes"}
                ],
                "responses": {"200": {"description": "List of running processes"}}
            }
        },
        "/processes/{pid}/": {
            "get": {
                "summary": "Get process details",
                "description": "Returns comprehensive details for a specific PID, including command line, loaded modules, SHA-256 hash, and digital signature status.",
                "parameters": [{"name": "pid", "in": "path", "required": True, "schema": {"type": "integer"}}],
                "responses": {"200": {"description": "Process detail response"}, "404": {"description": "Process not found"}}
            }
        },
        "/processes/{pid}/kill/": {
            "post": {
                "summary": "Terminate process",
                "description": "Gracefully terminates a running process by its PID.",
                "parameters": [{"name": "pid", "in": "path", "required": True, "schema": {"type": "integer"}}],
                "responses": {"200": {"description": "Process terminated successfully"}, "400": {"description": "Failed to terminate"}}
            }
        },
        "/network/": {
            "get": {
                "summary": "List active network sockets",
                "description": "Returns active TCP/UDP sockets, local and remote endpoints, socket state, and C2 risk flags.",
                "responses": {"200": {"description": "List of active network connections"}}
            }
        },
        "/services/": {
            "get": {
                "summary": "List Windows services",
                "description": "Returns installed services, daemon status, startup type, and executable paths.",
                "responses": {"200": {"description": "List of services"}}
            }
        },
        "/users/": {
            "get": {
                "summary": "List active user sessions",
                "description": "Returns logged-in users, interactive console sessions, and terminal states.",
                "responses": {"200": {"description": "List of user sessions"}}
            }
        },
        "/system/": {
            "get": {
                "summary": "Get system hardware telemetry",
                "description": "Returns OS version, processor cores, CPU load, RAM usage, and disk volumes.",
                "responses": {"200": {"description": "System hardware and OS specs"}}
            }
        },
        "/persistence/": {
            "get": {
                "summary": "List persistence mechanisms",
                "description": "Returns Windows Registry Run/RunOnce keys, Scheduled Tasks, and Startup Folder items.",
                "responses": {"200": {"description": "List of persistence items"}}
            }
        },
        "/sysmon/": {
            "get": {
                "summary": "Query Sysmon Operational logs",
                "description": "Returns parsed Microsoft-Windows-Sysmon/Operational events (Process Create, Network Connect, Image Load, DNS).",
                "parameters": [
                    {"name": "event_id", "in": "query", "schema": {"type": "integer"}, "description": "Filter by Event ID (1, 3, 7, 22)"},
                    {"name": "severity", "in": "query", "schema": {"type": "string"}, "description": "Filter by severity (Critical, High, Medium, Info)"}
                ],
                "responses": {"200": {"description": "List of Sysmon events"}}
            }
        },
        "/snapshot/": {
            "get": {
                "summary": "List archived investigation snapshots",
                "responses": {"200": {"description": "List of snapshots"}}
            },
            "post": {
                "summary": "Capture new forensic snapshot",
                "description": "Executes full endpoint collection, evaluates IOCs, computes risk score, and stores snapshot in database.",
                "responses": {"201": {"description": "Snapshot created"}}
            }
        },
        "/threat-intel/iocs/": {
            "get": {
                "summary": "List Indicators of Compromise",
                "responses": {"200": {"description": "List of IOCs"}}
            },
            "post": {
                "summary": "Create new IOC indicator",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "ioc_type": {"type": "string", "enum": ["ip", "domain", "sha256", "md5", "filename"]},
                                    "value": {"type": "string"},
                                    "threat_level": {"type": "string", "enum": ["Critical", "High", "Medium", "Low"]},
                                    "description": {"type": "string"},
                                    "mitre_technique": {"type": "string"}
                                },
                                "required": ["ioc_type", "value"]
                            }
                        }
                    }
                },
                "responses": {"201": {"description": "IOC created"}}
            }
        },
        "/threat-intel/match/": {
            "post": {
                "summary": "Scan endpoint against IOC database",
                "description": "Scans active processes, hashes, and sockets against configured threat intelligence indicators.",
                "responses": {"200": {"description": "Scan results and matched indicators"}}
            }
        },
        "/reports/": {
            "get": {
                "summary": "List forensic reports",
                "responses": {"200": {"description": "List of reports"}}
            },
            "post": {
                "summary": "Generate new security report",
                "responses": {"201": {"description": "Report generated"}}
            }
        },
        "/reports/{id}/export/": {
            "get": {
                "summary": "Export report findings",
                "parameters": [
                    {"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}},
                    {"name": "format", "in": "query", "schema": {"type": "string", "enum": ["json", "csv"]}}
                ],
                "responses": {"200": {"description": "Exported report file"}}
            }
        }
    }
}

class OpenApiSchemaView(View):
    def get(self, request):
        return JsonResponse(OPENAPI_SPEC)

class SwaggerDocsView(View):
    def get(self, request):
        html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VantEndpoint | API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #050a14; }
    .swagger-ui { background: #050a14; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #00f0ff; }
    .swagger-ui .info p, .swagger-ui .info li { color: #94a3b8; }
    .swagger-ui .scheme-container { background: #0b1326; box-shadow: none; border: 1px solid #1e2d4d; border-radius: 8px; margin: 20px 0; }
    .swagger-ui .opblock { background: #0b1326; border-radius: 8px; border: 1px solid #1e2d4d; margin-bottom: 12px; }
    .swagger-ui .opblock .opblock-summary { border-color: #1e2d4d; }
    .swagger-ui .opblock .opblock-summary-operation-id, .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-description { color: #e2e8f0; }
    .swagger-ui .opblock-body pre { background: #050a14; color: #00f0ff; }
    .swagger-ui table thead tr td, .swagger-ui table thead tr th { color: #94a3b8; border-color: #1e2d4d; }
    .swagger-ui .response-col_status { color: #00f0ff; }
    .swagger-ui .btn { border-radius: 4px; border-color: #1e2d4d; color: #e2e8f0; background: #111e38; }
    .swagger-ui .btn:hover { background: #00f0ff; color: #050a14; }
    .swagger-ui select { background: #050a14; color: #e2e8f0; border-color: #1e2d4d; }
    .swagger-ui input[type=text] { background: #050a14; color: #e2e8f0; border-color: #1e2d4d; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/schema/',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
        ],
      });
    };
  </script>
</body>
</html>"""
        return HttpResponse(html, content_type='text/html')
