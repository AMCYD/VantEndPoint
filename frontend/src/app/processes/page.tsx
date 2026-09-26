"use client";

import React, { useEffect, useState, useMemo } from "react";
import CyberDataGrid from "@/components/CyberDataGrid";
import { InvestigationService, ProcessItem } from "@/services/api";
import { ColDef } from "ag-grid-community";
import { Activity, ShieldAlert, X, AlertTriangle, Terminal, Cpu } from "lucide-react";

export default function ProcessesPage() {
  const [rowData, setRowData] = useState<ProcessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<ProcessItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchProcesses = () => {
    setLoading(true);
    setError(null);
    InvestigationService.getProcesses()
      .then((data) => {
        setRowData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching processes:", err);
        setError(err.message || "Failed to load live process list.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const handleInspectProcess = (proc: ProcessItem) => {
    setSelectedProcess(proc);
    setModalLoading(true);
    InvestigationService.getProcessDetails(proc.pid)
      .then((details) => {
        setSelectedProcess({ ...proc, ...details });
      })
      .catch((err) => {
        console.warn("Could not fetch extended details:", err);
      })
      .finally(() => {
        setModalLoading(false);
      });
  };

  const handleKillProcess = async (pid: number) => {
    if (!confirm(`Are you sure you want to terminate Process PID ${pid}?`)) return;
    try {
      await InvestigationService.terminateProcess(pid);
      setActionMessage(`Process PID ${pid} terminated successfully.`);
      setSelectedProcess(null);
      fetchProcesses();
    } catch (err: any) {
      setActionMessage(`Failed to terminate PID ${pid}: ${err.message}`);
    }
  };

  const columnDefs = useMemo<ColDef<ProcessItem>[]>(
    () => [
      {
        field: "pid",
        headerName: "PID",
        width: 90,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-cyan-400 font-semibold">{params.value}</span>
        ),
      },
      {
        field: "name",
        headerName: "Process Name",
        flex: 1.2,
        cellRenderer: (params: any) => (
          <div className="flex items-center space-x-2 py-1">
            <Activity size={14} className="text-slate-400 flex-shrink-0" />
            <span className="font-medium text-slate-100">{params.value}</span>
          </div>
        ),
      },
      {
        headerName: "Risk Tier",
        width: 120,
        valueGetter: (params: any) => params.data?.threat_score || 0,
        cellRenderer: (params: any) => {
          const score = params.value || 0;
          if (score >= 75) {
            return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/70 text-red-400 border border-red-800">CRITICAL ({score})</span>;
          }
          if (score >= 40) {
            return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/70 text-amber-400 border border-amber-800">SUSPICIOUS ({score})</span>;
          }
          return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/50 text-emerald-400 border border-emerald-800">CLEAN ({score})</span>;
        },
      },
      {
        field: "username",
        headerName: "User Context",
        width: 170,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400">{params.value || "SYSTEM"}</span>
        ),
      },
      {
        field: "cpu_percent",
        headerName: "CPU %",
        width: 95,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-300">
            {typeof params.value === "number" ? `${params.value.toFixed(1)}%` : "0.0%"}
          </span>
        ),
      },
      {
        field: "memory_percent",
        headerName: "Mem %",
        width: 95,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-300">
            {typeof params.value === "number" ? `${params.value.toFixed(1)}%` : "0.0%"}
          </span>
        ),
      },
      {
        field: "exe",
        headerName: "Executable Binary Path",
        flex: 2,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-400 truncate block" title={params.value}>
            {params.value || "Protected System Process"}
          </span>
        ),
      },
      {
        headerName: "Actions",
        width: 110,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
          <button
            onClick={() => handleInspectProcess(params.data)}
            className="text-[11px] px-2.5 py-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 rounded transition-colors"
          >
            Inspect
          </button>
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
            <Activity className="text-cyber-accent" size={24} />
            Live Process Investigation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time process telemetry, execution context, hashes, and behavioral anomaly flags.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-cyber-surface border border-cyber-border rounded text-xs text-cyan-300 flex justify-between items-center">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Cyber Data Grid */}
      <CyberDataGrid<ProcessItem>
        title="Active Endpoint Processes"
        subtitle="Sort, filter and inspect active Windows processes"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        onRefresh={fetchProcesses}
        height="calc(100vh - 220px)"
      />

      {/* Process Inspector Modal */}
      {selectedProcess && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cyber-panel border border-cyber-border rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyber-border pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-cyber-surface border border-cyber-border">
                  <Activity size={20} className="text-cyber-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    {selectedProcess.name}
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyber-surface text-cyan-400 border border-cyber-border">
                      PID {selectedProcess.pid}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">{selectedProcess.username || "NT AUTHORITY\\SYSTEM"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            {/* Behavioral Risk Banner */}
            {(selectedProcess.threat_score || 0) >= 40 ? (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg flex items-start space-x-3">
                <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-red-300">
                    Behavioral Anomaly Detected (Threat Score: {selectedProcess.threat_score}/100)
                  </p>
                  {selectedProcess.anomaly_flags && selectedProcess.anomaly_flags.length > 0 && (
                    <ul className="list-disc list-inside text-red-300/90 space-y-0.5">
                      {selectedProcess.anomaly_flags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-2 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-400 flex items-center space-x-2">
                <ShieldAlert size={16} />
                <span>Baseline Process: No known behavioral anomalies detected.</span>
              </div>
            )}

            {/* Process Details Grid */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Executable Path</label>
                <p className="font-mono text-slate-200 bg-cyber-dark p-2 rounded border border-cyber-border break-all mt-1">
                  {selectedProcess.exe || "Protected / System Path"}
                </p>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Command Line</label>
                <p className="font-mono text-slate-200 bg-cyber-dark p-2 rounded border border-cyber-border break-all mt-1">
                  {Array.isArray(selectedProcess.cmdline)
                    ? selectedProcess.cmdline.join(" ")
                    : selectedProcess.cmdline || selectedProcess.name}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-cyber-dark p-2 rounded border border-cyber-border">
                  <span className="text-slate-500 block text-[10px]">CPU Usage</span>
                  <span className="font-mono text-cyan-400 font-semibold">{selectedProcess.cpu_percent || 0}%</span>
                </div>
                <div className="bg-cyber-dark p-2 rounded border border-cyber-border">
                  <span className="text-slate-500 block text-[10px]">Memory Usage</span>
                  <span className="font-mono text-cyan-400 font-semibold">{selectedProcess.memory_percent || 0}%</span>
                </div>
                <div className="bg-cyber-dark p-2 rounded border border-cyber-border">
                  <span className="text-slate-500 block text-[10px]">Threads</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedProcess.num_threads || 1}</span>
                </div>
                <div className="bg-cyber-dark p-2 rounded border border-cyber-border">
                  <span className="text-slate-500 block text-[10px]">Status</span>
                  <span className="font-mono text-emerald-400 font-semibold">{selectedProcess.status || "running"}</span>
                </div>
              </div>

              {selectedProcess.hash_sha256 && (
                <div>
                  <label className="text-slate-400 font-medium">SHA-256 Hash</label>
                  <p className="font-mono text-slate-300 bg-cyber-dark p-2 rounded border border-cyber-border break-all mt-1 text-[11px]">
                    {selectedProcess.hash_sha256}
                  </p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-cyber-border">
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-xs px-4 py-2 bg-cyber-surface hover:bg-slate-800 text-slate-300 rounded border border-cyber-border transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleKillProcess(selectedProcess.pid)}
                className="text-xs px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/50 rounded transition-colors font-medium"
              >
                Terminate Process (Kill)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
