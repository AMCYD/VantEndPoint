"use client";
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, themeQuartz, ClientSideRowModelModule } from 'ag-grid-community';
import { InvestigationService } from '@/services/api';
import type { ColDef } from "ag-grid-community";

// 1. REGISTER THE MODULE GLOBALLY AT THE TOP-LEVEL (OUTSIDE THE COMPONENT)
ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default function UsersPage() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Balanced schema mapping using 'name' and 'pid' from your Python collectors
  const columnDefs: ColDef[] = [
    { field: "name", headerName: "Username", width: 200 },
    { field: "pid", headerName: "Session PID", flex: 1 }
  ];

  useEffect(() => {
    InvestigationService.getUsers()
      .then(data => {
        setRowData(Array.isArray(data) ? data : data.results || []);
      })
      .catch(err => {
        console.error("Error fetching users from Django:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const gridTheme = themeQuartz.withParams({
    backgroundColor: "#0f172a", 
    foregroundColor: "#f1f5f9", 
    headerBackgroundColor: "#1e293b", 
    rowHoverColor: "#334155",
  });

  return (
    <div className="space-y-6 h-full flex flex-col p-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-100">User Management</h2>
      </header>

      <div className="flex-1 w-full min-h-[400px] relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Loading backend data...
          </div>
        ) : (
          <AgGridReact
            theme={gridTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
          />
        )}
      </div>
    </div>
  );
}