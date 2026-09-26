"use client";

import React, { useEffect, useState, useMemo } from "react";
import CyberDataGrid from "@/components/CyberDataGrid";
import { ThreatIntelService, IOCItem } from "@/services/api";
import { ColDef } from "ag-grid-community";
import { Flame, Plus, Trash2, Search, CheckCircle2 } from "lucide-react";

export default function ThreatIntelPage() {
  const [rowData, setRowData] = useState<IOCItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIoc, setNewIoc] = useState<Partial<IOCItem>>({
    ioc_type: "ip",
    value: "",
    threat_level: "High",
    description: "",
    mitre_technique: "",
  });

  const fetchIocs = () => {
    setLoading(true);
    setError(null);
    ThreatIntelService.getIocs()
      .then((data) => {
        setRowData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching IOCs:", err);
        setError(err.message || "Failed to load IOC database.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIocs();
  }, []);

  const handleAddIoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIoc.value) return;
    try {
      await ThreatIntelService.createIoc(newIoc);
      setShowAddModal(false);
      setNewIoc({ ioc_type: "ip", value: "", threat_level: "High", description: "", mitre_technique: "" });
      fetchIocs();
    } catch (err: any) {
      alert(`Error saving IOC: ${err.message}`);
    }
  };

  const handleDeleteIoc = async (id: number) => {
    if (!confirm("Are you sure you want to delete this IOC indicator?")) return;
    try {
      await ThreatIntelService.deleteIoc(id);
      fetchIocs();
    } catch (err: any) {
      alert(`Error deleting IOC: ${err.message}`);
    }
  };

  const columnDefs = useMemo<ColDef<IOCItem>[]>(
    () => [
      {
        field: "ioc_type",
        headerName: "Type",
        width: 110,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-cyber-surface text-cyan-400 border border-cyber-border font-semibold">
            {params.value}
          </span>
        ),
      },
      {
        field: "value",
        headerName: "Indicator Value (Hash / IP / Domain)",
        flex: 1.5,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-100 font-bold">{params.value}</span>
        ),
      },
      {
        field: "threat_level",
        headerName: "Threat Severity",
        width: 130,
        cellRenderer: (params: any) => {
          const lvl = params.value || "Medium";
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                lvl === "Critical"
                  ? "bg-red-950/70 text-red-400 border border-red-800 font-bold"
                  : lvl === "High"
                  ? "bg-amber-950/70 text-amber-400 border border-amber-800"
                  : "bg-purple-950/60 text-purple-300 border border-purple-800"
              }`}
            >
              {lvl}
            </span>
          );
        },
      },
      {
        field: "mitre_technique",
        headerName: "MITRE ATT&CK",
        width: 140,
        cellRenderer: (params: any) => (
          <span className="font-mono text-xs text-slate-300">{params.value || "-"}</span>
        ),
      },
      {
        field: "description",
        headerName: "Threat Intelligence Context",
        flex: 2,
        cellRenderer: (params: any) => (
          <span className="text-xs text-slate-400">{params.value || "-"}</span>
        ),
      },
      {
        headerName: "Actions",
        width: 90,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => (
          <button
            onClick={() => params.data?.id && handleDeleteIoc(params.data.id)}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded transition-colors"
            title="Delete IOC"
          >
            <Trash2 size={15} />
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
            <Flame className="text-cyber-accent" size={24} />
            Threat Intelligence & IOC Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain curated Indicators of Compromise (IPs, C2 domains, malicious SHA-256 hashes) and correlate with endpoint telemetry.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors shadow"
        >
          <Plus size={15} />
          <span>Add Threat IOC</span>
        </button>
      </div>

      <CyberDataGrid<IOCItem>
        title="Configured Indicators of Compromise"
        subtitle="Active matching rules against live endpoint telemetry"
        rowData={rowData}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        onRefresh={fetchIocs}
        height="calc(100vh - 220px)"
      />

      {/* Add IOC Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cyber-panel border border-cyber-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus size={18} className="text-cyber-accent" />
              Add Indicator of Compromise
            </h3>

            <form onSubmit={handleAddIoc} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">IOC Type</label>
                <select
                  value={newIoc.ioc_type}
                  onChange={(e) => setNewIoc({ ...newIoc, ioc_type: e.target.value as any })}
                  className="w-full bg-cyber-dark text-slate-200 p-2 rounded border border-cyber-border focus:border-cyan-500 focus:outline-none"
                >
                  <option value="ip">IP Address</option>
                  <option value="domain">Domain / Hostname</option>
                  <option value="sha256">SHA-256 File Hash</option>
                  <option value="md5">MD5 File Hash</option>
                  <option value="filename">Malicious Filename</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Indicator Value</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 185.220.101.5 or hash"
                  value={newIoc.value}
                  onChange={(e) => setNewIoc({ ...newIoc, value: e.target.value })}
                  className="w-full bg-cyber-dark text-slate-200 p-2 rounded border border-cyber-border focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Threat Severity</label>
                <select
                  value={newIoc.threat_level}
                  onChange={(e) => setNewIoc({ ...newIoc, threat_level: e.target.value as any })}
                  className="w-full bg-cyber-dark text-slate-200 p-2 rounded border border-cyber-border focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">MITRE ATT&CK Technique</label>
                <input
                  type="text"
                  placeholder="e.g. T1071.001"
                  value={newIoc.mitre_technique}
                  onChange={(e) => setNewIoc({ ...newIoc, mitre_technique: e.target.value })}
                  className="w-full bg-cyber-dark text-slate-200 p-2 rounded border border-cyber-border focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Context / Description</label>
                <textarea
                  rows={3}
                  placeholder="Threat actor reference, malware campaign notes..."
                  value={newIoc.description}
                  onChange={(e) => setNewIoc({ ...newIoc, description: e.target.value })}
                  className="w-full bg-cyber-dark text-slate-200 p-2 rounded border border-cyber-border focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-cyber-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-cyber-surface hover:bg-slate-800 text-slate-300 rounded border border-cyber-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                >
                  Save Indicator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
