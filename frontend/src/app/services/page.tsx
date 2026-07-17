// "use client";
// import { useEffect, useState } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';
// import { InvestigationService } from '@/services/api';
// import type { ColDef } from "ag-grid-community";

"use client";
import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';

//import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
//ModuleRegistry.registerModules([AllCommunityModule]);

import { InvestigationService } from '@/services/api';
import type { ColDef } from "ag-grid-community";


export default function ServicesPage() {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

 const columnDefs: ColDef[] = ([
  { field: 'name', headerName: 'Service Name', flex: 1 },
  { field: 'display_name', headerName: 'Display Name', flex: 1.5 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'start_type', headerName: 'Start Type', width: 120 },
  { field: 'pid', headerName: 'PID', width: 100 },
  { field: 'username', headerName: 'Run As', width: 150 },
  { field: 'binpath', headerName: 'Executable Path', flex: 2 },
]);

  useEffect(() => {
    InvestigationService.getServices()
      .then(data => {
        setRowData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching services:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h2 className="text-2xl font-bold text-slate-100">Windows Services</h2>
        <p className="text-slate-400">View and analyze loaded services.</p>
      </header>

      <div className="flex-1 ag-theme-alpine-dark w-full min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">Loading services...</div>
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

