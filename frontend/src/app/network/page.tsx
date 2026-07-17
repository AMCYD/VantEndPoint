"use client";
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

// CSS styling imports needed to make the grid visible
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Registers community features for AG Grid v33+
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

import { InvestigationService } from '@/services/api';
import type { ColDef } from "ag-grid-community";

export default function NetworkPage() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columnDefs: ColDef[] = [
    {
      field: "process",
      headerName: "Process",
      width: 200
    },
    {
      field: "ip",
      headerName: "IP Address",
      flex: 1
    }
  ];

  useEffect(() => {
    InvestigationService.getNetworkConnections()
      .then(data => {
        // Safe check for Django's nested paginated arrays (data.results)
        setRowData(Array.isArray(data) ? data : data.results || []);
      })
      .catch(err => {
        console.error("Error fetching network:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h2 className="text-2xl font-bold text-slate-100">Network Investigation</h2>
        <p className="text-slate-400">View and analyze active network connections.</p>
      </header>

      <div className="flex-1 ag-theme-alpine w-full min-h-[500px] relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center text-slate-400">
            Loading connections...
          </div>
        )}
        
        <AgGridReact
          theme="legacy" // Forces AG Grid to look at the imported Alpine CSS theme
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
      </div>
    </div>
  );
}