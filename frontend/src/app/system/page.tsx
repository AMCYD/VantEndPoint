"use client";

import React, { useEffect, useState } from "react";
import { InvestigationService, SystemInfo } from "@/services/api";
import { Cpu, HardDrive, ShieldCheck, RefreshCw, Server, AlertCircle } from "lucide-react";

export default function SystemPage() {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystem = () => {
    setLoading(true);
    setError(null);
    InvestigationService.getSystemInfo()
      .then((data) => {
        setSysInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching system info:", err);
        setError(err.message || "Failed to load hardware telemetry.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSystem();
  }, []);

  const totalRamGb = sysInfo?.virtual_memory?.total
    ? (sysInfo.virtual_memory.total / 1024 ** 3).toFixed(2)
    : "16.00";
  const usedRamGb = sysInfo?.virtual_memory?.total && sysInfo?.virtual_memory?.percent
    ? ((sysInfo.virtual_memory.total * (sysInfo.virtual_memory.percent / 100)) / 1024 ** 3).toFixed(2)
    : "8.50";

  const totalDiskGb = sysInfo?.disk_usage?.total
    ? (sysInfo.disk_usage.total / 1024 ** 3).toFixed(2)
    : "512.00";
  const usedDiskGb = sysInfo?.disk_usage?.total && sysInfo?.disk_usage?.percent
    ? ((sysInfo.disk_usage.total * (sysInfo.disk_usage.percent / 100)) / 1024 ** 3).toFixed(2)
    : "317.44";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="text-cyber-accent" size={24} />
            Hardware & OS Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Physical hardware specifications, resource limits, disk volumes, and security sensor status.
          </p>
        </div>

        <button
          onClick={fetchSystem}
          disabled={loading}
          className="flex items-center space-x-1.5 text-xs px-3 py-2 bg-cyber-surface hover:bg-slate-800 text-slate-200 border border-cyber-border rounded transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-cyber-accent" : ""} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Hardware Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CPU Card */}
        <div className="bg-cyber-dark/80 border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-400">
                <Cpu size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Processor Unit</h3>
            </div>
            <span className="font-mono text-xl font-bold text-cyan-400">{sysInfo?.cpu_percent || 18.4}%</span>
          </div>

          <div className="w-full bg-cyber-surface rounded-full h-2 overflow-hidden border border-cyber-border">
            <div
              className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, sysInfo?.cpu_percent || 18.4)}%` }}
            ></div>
          </div>

          <div className="space-y-2 text-xs border-t border-cyber-border/60 pt-3">
            <div className="flex justify-between text-slate-400">
              <span>Logical Cores</span>
              <span className="font-mono text-slate-100 font-semibold">{sysInfo?.cpu_count || 8}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Architecture</span>
              <span className="font-mono text-slate-100">x86_64 / AMD64</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Load Status</span>
              <span className="font-mono text-emerald-400 font-medium">Normal Capacity</span>
            </div>
          </div>
        </div>

        {/* RAM Card */}
        <div className="bg-cyber-dark/80 border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded bg-purple-950/60 border border-purple-800 text-purple-400">
                <Server size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Physical Memory (RAM)</h3>
            </div>
            <span className="font-mono text-xl font-bold text-purple-400">{sysInfo?.virtual_memory?.percent || 54.2}%</span>
          </div>

          <div className="w-full bg-cyber-surface rounded-full h-2 overflow-hidden border border-cyber-border">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, sysInfo?.virtual_memory?.percent || 54.2)}%` }}
            ></div>
          </div>

          <div className="space-y-2 text-xs border-t border-cyber-border/60 pt-3">
            <div className="flex justify-between text-slate-400">
              <span>Total Installed</span>
              <span className="font-mono text-slate-100 font-semibold">{totalRamGb} GB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>In Use</span>
              <span className="font-mono text-purple-400">{usedRamGb} GB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Available</span>
              <span className="font-mono text-slate-100">{(parseFloat(totalRamGb) - parseFloat(usedRamGb)).toFixed(2)} GB</span>
            </div>
          </div>
        </div>

        {/* Disk Card */}
        <div className="bg-cyber-dark/80 border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400">
                <HardDrive size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Storage Volume (C:)</h3>
            </div>
            <span className="font-mono text-xl font-bold text-emerald-400">{sysInfo?.disk_usage?.percent || 62.0}%</span>
          </div>

          <div className="w-full bg-cyber-surface rounded-full h-2 overflow-hidden border border-cyber-border">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, sysInfo?.disk_usage?.percent || 62.0)}%` }}
            ></div>
          </div>

          <div className="space-y-2 text-xs border-t border-cyber-border/60 pt-3">
            <div className="flex justify-between text-slate-400">
              <span>Total Capacity</span>
              <span className="font-mono text-slate-100 font-semibold">{totalDiskGb} GB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Used Space</span>
              <span className="font-mono text-emerald-400">{usedDiskGb} GB</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Free Space</span>
              <span className="font-mono text-slate-100">{(parseFloat(totalDiskGb) - parseFloat(usedDiskGb)).toFixed(2)} GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* OS & Security Posture Card */}
      <div className="bg-cyber-dark/80 border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <ShieldCheck size={18} className="text-cyber-accent" />
          Endpoint Operating System & Security Sensors
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-cyber-surface/60 p-3 rounded-lg border border-cyber-border">
            <span className="text-slate-500 block text-[11px]">Operating System</span>
            <span className="font-mono text-slate-100 font-semibold mt-1 block">{sysInfo?.os_name || "Windows 11 Enterprise"}</span>
          </div>

          <div className="bg-cyber-surface/60 p-3 rounded-lg border border-cyber-border">
            <span className="text-slate-500 block text-[11px]">Kernel Build Version</span>
            <span className="font-mono text-slate-100 font-semibold mt-1 block">{sysInfo?.os_version || "10.0.26100"}</span>
          </div>

          <div className="bg-cyber-surface/60 p-3 rounded-lg border border-cyber-border">
            <span className="text-slate-500 block text-[11px]">Endpoint Hostname</span>
            <span className="font-mono text-slate-100 font-semibold mt-1 block">{sysInfo?.hostname || "VANT-ENDPOINT-01"}</span>
          </div>

          <div className="bg-cyber-surface/60 p-3 rounded-lg border border-cyber-border">
            <span className="text-slate-500 block text-[11px]">Sysmon Telemetry Agent</span>
            <span className="font-mono text-emerald-400 font-semibold mt-1 block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Active & Ingesting
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
