"use client";

import React, { useEffect, useState, useMemo } from "react";
import CyberDataGrid from "@/components/CyberDataGrid";
import { InvestigationService, NetworkItem } from "@/services/api";
import { ColDef } from "ag-grid-community";
import { Network, Globe, Lock, AlertTriangle } from "lucide-react";

export default function NetworkPage() {
  const [rowData, setRowData] = useState<NetworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = () => {
    setLoading(true);
    setError(null);
    InvestigationService.getNetworkConnections()
      .then((data) => {
        setRowData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching network:", err);
        setError(err.message || "Failed to load network socket connections.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const columnDefs = useMemo<ColDef<NetworkItem>[]>(
    () => [
      {
        field: "pid",
        headerName: "PID",
        width: 90,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-cyan-400 font-semibold">{params.value || "-"}</span>
        ),
      },
      {
        field: "process_name",
        headerName: "Process / Application",
        width: 190,
        cellRenderer: (params: any) => (
          <span className="font-medium text-slate-200 text-xs">{params.value || `PID:${params.data?.pid}`}</span>
        ),
      },
      {
        field: "protocol",
        headerName: "Proto",
        width: 85,
        cellRenderer: (params: any) => (
          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-cyber-surface text-slate-300 border border-cyber-border">
            {params.value || "TCP"}
          </span>
        ),
      },
      {
        field: "local_address",
        headerName: "Local Endpoint",
        flex: 1.2,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-300">{params.value || "0.0.0.0:0"}</span>
        ),
      },
      {
        field: "remote_address",
        headerName: "Remote Endpoint",
        flex: 1.2,
        cellRenderer: (params: any) => {
          const val = params.value || "0.0.0.0:0";
          const isExt = params.data?.is_external;
          return (
            <div className="flex items-center space-x-2">
              <span className={`font-mono text-xs ${isExt ? "text-amber-400 font-semibold" : "text-slate-400"}`}>
                {val}
              </span>
            </div>
          );
        },
      },
      {
        field: "status",
        headerName: "Socket State",
        width: 140,
        cellRenderer: (params: any) => {
          const status = params.value || "UNKNOWN";
          const isEstablished = status === "ESTABLISHED";
          const isListening = status === "LISTEN" || status === "LISTENING";
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                isEstablished
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                  : isListening
                  ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        headerName: "Traffic Scope",
        width: 130,
        valueGetter: (params: any) => (params.data?.is_external ? "External" : "Loopback / LAN"),
        cellRenderer: (params: any) => {
          const isExt = params.data?.is_external;
          return isExt ? (
            <span className="flex items-center text-xs text-amber-400 gap-1">
              <Globe size={13} />
              <span>Public WAN</span>
            </span>
          ) : (
            <span className="flex items-center text-xs text-slate-400 gap-1">
              <Lock size={13} />
              <span>Local / Intranet</span>
            </span>
          );
        },
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
            <Network className="text-cyber-accent" size={24} />
            Network Connection Forensics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time active TCP/UDP sockets, remote connection endpoints, listening daemons, and C2 beacons.
          </p>
        </div>
      </div>

      <CyberDataGrid<NetworkItem>
        title="Endpoint Sockets & Active Connections"
        subtitle="Live socket states and external destination IPs"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        onRefresh={fetchConnections}
        height="calc(100vh - 220px)"
      />
    </div>
  );
}