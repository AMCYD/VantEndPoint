"use client";

import React, { useEffect, useState, useMemo } from "react";
import CyberDataGrid from "@/components/CyberDataGrid";
import { InvestigationService, SysmonEventItem } from "@/services/api";
import { ColDef } from "ag-grid-community";
import { TerminalSquare, ShieldAlert, Filter } from "lucide-react";

export default function SysmonPage() {
  const [rowData, setRowData] = useState<SysmonEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(undefined);

  const fetchSysmon = (eventId?: number) => {
    setLoading(true);
    setError(null);
    InvestigationService.getSysmonEvents({ event_id: eventId })
      .then((data) => {
        setRowData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Sysmon events:", err);
        setError(err.message || "Failed to load Sysmon event log stream.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSysmon(selectedEventId);
  }, [selectedEventId]);

  const columnDefs = useMemo<ColDef<SysmonEventItem>[]>(
    () => [
      {
        field: "event_id",
        headerName: "Event ID",
        width: 105,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-cyan-400 font-bold">
            EID {params.value}
          </span>
        ),
      },
      {
        field: "event_type",
        headerName: "Event Classification",
        width: 170,
        cellRenderer: (params: any) => (
          <span className="font-semibold text-xs text-slate-200">{params.value}</span>
        ),
      },
      {
        field: "severity",
        headerName: "Severity",
        width: 110,
        cellRenderer: (params: any) => {
          const sev = params.value || "Info";
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                sev === "Critical"
                  ? "bg-red-950/70 text-red-400 border border-red-800"
                  : sev === "High"
                  ? "bg-amber-950/70 text-amber-400 border border-amber-800"
                  : sev === "Medium"
                  ? "bg-purple-950/60 text-purple-300 border border-purple-800"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {sev}
            </span>
          );
        },
      },
      {
        field: "timestamp",
        headerName: "Event Timestamp",
        width: 160,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400">{params.value}</span>
        ),
      },
      {
        field: "process_name",
        headerName: "Process Entity",
        width: 160,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-200">{params.value || "-"}</span>
        ),
      },
      {
        field: "command_line",
        headerName: "Command Execution / Network Destination",
        flex: 2,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-300 truncate block" title={params.value}>
            {params.value || "-"}
          </span>
        ),
      },
      {
        field: "user",
        headerName: "Security User",
        width: 160,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400">{params.value || "SYSTEM"}</span>
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
            <TerminalSquare className="text-cyber-accent" size={24} />
            Sysmon Deep Telemetry Stream
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Windows Sysmon Operational events: Process Creations (1), Network Connects (3), Image Loads (7), CreateRemoteThread (8), and DNS queries (22).
          </p>
        </div>

        {/* Filter by Event ID */}
        <div className="flex items-center space-x-1.5 bg-cyber-surface/60 p-1 rounded-lg border border-cyber-border text-xs">
          <button
            onClick={() => setSelectedEventId(undefined)}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedEventId === undefined ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setSelectedEventId(1)}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedEventId === 1 ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            Process (1)
          </button>
          <button
            onClick={() => setSelectedEventId(3)}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedEventId === 3 ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            Network (3)
          </button>
          <button
            onClick={() => setSelectedEventId(7)}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedEventId === 7 ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            DLL Load (7)
          </button>
          <button
            onClick={() => setSelectedEventId(22)}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedEventId === 22 ? "bg-cyan-600 text-white font-medium" : "text-slate-400 hover:text-white"
            }`}
          >
            DNS (22)
          </button>
        </div>
      </div>

      <CyberDataGrid<SysmonEventItem>
        title="Ingested Sysmon Operational Logs"
        subtitle="Microsoft-Windows-Sysmon/Operational live events"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        onRefresh={() => fetchSysmon(selectedEventId)}
        height="calc(100vh - 220px)"
      />
    </div>
  );
}
