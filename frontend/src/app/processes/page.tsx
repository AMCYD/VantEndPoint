"use client";
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { InvestigationService } from '@/services/api';
import type { ColDef } from "ag-grid-community";

import { ModuleRegistry, ValidationModule } from "ag-grid-community";

ModuleRegistry.registerModules([
  ValidationModule
]);

export default function ProcessesPage() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columnDefs: ColDef[] = [
    { field: 'pid', headerName: 'PID', width: 100 },
    { field: 'name', headerName: 'Process Name', flex: 1 },
    { field: 'username', headerName: 'User', width: 150 },
    { field: 'cpu_percent', headerName: 'CPU %', width: 100 },
    { field: 'memory_percent', headerName: 'Memory %', width: 120 },
  ];

  useEffect(() => {
    InvestigationService.getProcesses()
      .then(data => {
        setRowData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching processes:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h2 className="text-2xl font-bold text-slate-100">Process Investigation</h2>
        <p className="text-slate-400">View and analyze running processes.</p>
      </header>

      <div className="flex-1 ag-theme-alpine-dark w-full min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">Loading processes...</div>
        ) : (
          <AgGridReact<any>
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={50}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
          />
        )}
      </div>
    </div>
  );
}


