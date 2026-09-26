"use client";

import React, { useEffect, useState, useMemo } from "react";
import CyberDataGrid from "@/components/CyberDataGrid";
import { InvestigationService, PersistenceItem } from "@/services/api";
import { ColDef } from "ag-grid-community";
import { Key, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";

export default function PersistencePage() {
  const [rowData, setRowData] = useState<PersistenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersistence = () => {
    setLoading(true);
    setError(null);
    InvestigationService.getPersistence()
      .then((data) => {
        setRowData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching persistence items:", err);
        setError(err.message || "Failed to query persistence mechanisms.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPersistence();
  }, []);

  const columnDefs = useMemo<ColDef<PersistenceItem>[]>(
    () => [
      {
        field: "type",
        headerName: "Mechanism Type",
        width: 160,
        cellRenderer: (params: any) => (
          <span className="font-semibold text-xs text-slate-200">{params.value}</span>
        ),
      },
      {
        field: "name",
        headerName: "Entry / Key Name",
        width: 170,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-cyan-400 font-semibold">{params.value}</span>
        ),
      },
      {
        field: "risk_level",
        headerName: "Risk Tier",
        width: 110,
        cellRenderer: (params: any) => {
          const isHigh = params.value === "High";
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                isHigh
                  ? "bg-red-950/70 text-red-400 border border-red-800"
                  : "bg-emerald-950/50 text-emerald-400 border border-emerald-800"
              }`}
            >
              {params.value || "Low"}
            </span>
          );
        },
      },
      {
        field: "location",
        headerName: "Registry Key / Task Folder",
        flex: 1.2,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400 truncate block" title={params.value}>
            {params.value}
          </span>
        ),
      },
      {
        field: "path",
        headerName: "Target Binary / Command",
        flex: 2,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-300 truncate block" title={params.value}>
            {params.value}
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
            <Key className="text-cyber-accent" size={24} />
            Windows Persistence Forensics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit autoruns, Registry Run/RunOnce keys, Scheduled Tasks, and Startup Folder executables.
          </p>
        </div>
      </div>

      <CyberDataGrid<PersistenceItem>
        title="Detected Windows Persistence Mechanisms"
        subtitle="Autoruns and scheduled task execution vectors"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        onRefresh={fetchPersistence}
        height="calc(100vh - 220px)"
      />
    </div>
  );
}
