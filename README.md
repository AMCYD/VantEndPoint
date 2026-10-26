# VantEndpoint

Endpoint Investigation, System Monitoring, and Security Analysis Platform.

VantEndpoint is a lightweight EDR/DFIR tool designed to provide deep visibility into local endpoints. It allows Security Analysts, SOC teams, and Incident Responders to investigate processes, network connections, persistence mechanisms, and system behavior.

## Folder Structure

```
VantEndpoint/
│
├── backend/            # Django REST Framework backend
│   ├── api/            # Centralized DRF routing
│   ├── apps/           # Django applications (investigation, reports, threat_intel)
│   ├── collector/      # Abstract data collection layer
│   ├── engine/         # Security and detection engines
│   └── manage.py       # Django CLI
│
├── frontend/           # Next.js React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── features/   # Feature-based view modules
│   │   ├── layouts/    # Global layouts (Sidebar, TopNav)
│   │   ├── services/   # Axios API clients
│   │   └── lib/        # Utilities
│   └── package.json    # Node dependencies
│
├── Install_Dependencies.bat
├── Update_Dependencies.bat
├── Start_VantEndpoint.bat
├── Stop_VantEndpoint.bat
└── README.md
```

## Prerequisites

- **Python 3.13+** (Must be in PATH)
- **Node.js 18+** (Must be in PATH)

## Installation & First-Time Setup

1. Clone or download this repository.
2. Double-click **`Install_Dependencies.bat`**
   - This will automatically create a Python virtual environment, install the backend packages, and install all Next.js frontend dependencies.
3. Once the installation finishes successfully, press any key to close the window.

## Running the Application

To start VantEndpoint, double-click **`Start_VantEndpoint.bat`**.

This script will:
1. Verify the virtual environment.
2. Start the Django API Server in a new window.
3. Start the Next.js Frontend Server in a new window.
4. Automatically open your default web browser to `http://localhost:3000`.

## Stopping the Application

To shut down VantEndpoint, double-click **`Stop_VantEndpoint.bat`**. This gracefully terminates both backend and frontend processes.

## Updating

If you pull new changes from the repository, double-click **`Update_Dependencies.bat`** to ensure your Python and Node.js environments are up-to-date.

## Default URLs

- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Common Troubleshooting

- **"Python is not installed"**: Ensure Python is added to your Windows PATH during installation.
- **Backend fails to start**: Run `Install_Dependencies.bat` to verify the `venv` was created correctly.
- **Ports already in use**: Ensure no other application is running on port 8000 or 3000. You can use Task Manager or run `Stop_VantEndpoint.bat` to clear hanging processes.

## API Documentation

The backend exposes standard REST endpoints (e.g., `/api/processes/`, `/api/network/`). 

*(A Swagger/OpenAPI spec will be available at `/api/docs/` once fully implemented)*

## Commands Used During Development

- Frontend Dev: `npm run dev`
- Frontend Build: `npm run build`
- Backend Dev: `python manage.py runserver`
- Backend Migrations: `python manage.py makemigrations` and `python manage.py migrate`

# AmerTehan
