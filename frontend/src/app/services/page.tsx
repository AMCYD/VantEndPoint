"use client";

import React, { useEffect, useState, useMemo } from "react";
import CyberDataGrid from "@/components/CyberDataGrid";
import { InvestigationService, ServiceItem } from "@/services/api";
import { ColDef } from "ag-grid-community";
import { ServerCog, ShieldCheck, PlayCircle, StopCircle } from "lucide-react";

export default function ServicesPage() {
  const [rowData, setRowData] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = () => {
    setLoading(true);
    setError(null);
    InvestigationService.getServices()
      .then((data) => {
        setRowData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        setError(err.message || "Failed to load Windows services list.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const columnDefs = useMemo<ColDef<ServiceItem>[]>(
    () => [
      {
        field: "name",
        headerName: "Service Key",
        width: 170,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs font-semibold text-cyan-400">{params.value}</span>
        ),
      },
      {
        field: "display_name",
        headerName: "Display Name",
        flex: 1.2,
        cellRenderer: (params: any) => (
          <span className="text-xs font-medium text-slate-200">{params.value || params.data?.name}</span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        cellRenderer: (params: any) => {
          const isRunning = params.value === "running" || params.value === "RUNNING";
          return (
            <div className="flex items-center space-x-1.5">
              {isRunning ? (
                <span className="flex items-center text-xs text-emerald-400 font-mono gap-1">
                  <PlayCircle size={13} />
                  <span>RUNNING</span>
                </span>
              ) : (
                <span className="flex items-center text-xs text-slate-500 font-mono gap-1">
                  <StopCircle size={13} />
                  <span>STOPPED</span>
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: "start_type",
        headerName: "Startup Type",
        width: 130,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400 capitalize">{params.value || "demand"}</span>
        ),
      },
      {
        field: "pid",
        headerName: "PID",
        width: 90,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400">{params.value || "-"}</span>
        ),
      },
      {
        field: "binpath",
        headerName: "Service Binary Executable Path",
        flex: 2,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400 truncate block" title={params.value}>
            {params.value || "svchost.exe (Shared Host)"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ServerCog className="text-cyber-accent" size={24} />
            Windows Services Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit installed Windows background services, startup types, loaded driver binaries, and service privileges.
          </p>
        </div>
      </div>

      <CyberDataGrid<ServiceItem>
        title="Loaded Windows Services"
        subtitle="Daemon status and executable binary verification"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        onRefresh={fetchServices}
        height="calc(100vh - 220px)"
      />
    </div>
  );
}
