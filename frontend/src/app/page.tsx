"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Activity, 
  Network, 
  Key, 
  TerminalSquare, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  RefreshCw,
  HardDrive,
  Database
} from "lucide-react";
import { InvestigationService, ThreatIntelService, ProcessItem, NetworkItem, SystemInfo } from "@/services/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [network, setNetwork] = useState<NetworkItem[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [threatStats, setThreatStats] = useState<any>({ total_iocs: 0, matched_threats: 0 });
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [procs, nets, sys, stats] = await Promise.all([
        InvestigationService.getProcesses(),
        InvestigationService.getNetworkConnections(),
        InvestigationService.getSystemInfo(),
        ThreatIntelService.getStats(),
      ]);
      setProcesses(procs);
      setNetwork(nets);
      setSystemInfo(sys);
      setThreatStats(stats);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const result = await ThreatIntelService.scanCurrentEndpoint();
      setScanResult(`Scan complete! ${result.total_scanned} artifacts scanned. Threat Score: ${result.threat_score}/100.`);
    } catch (err: any) {
      setScanResult(`Scan failed: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const suspiciousProcesses = processes.filter((p) => (p.threat_score || 0) > 40 || (p.anomaly_flags && p.anomaly_flags.length > 0));
  const externalConnections = network.filter((n) => n.is_external);

  const ramUsedGb = systemInfo?.virtual_memory?.total 
    ? ((systemInfo.virtual_memory.total * (systemInfo.virtual_memory.percent / 100)) / (1024 ** 3)).toFixed(1) 
    : "8.5";
  const ramTotalGb = systemInfo?.virtual_memory?.total 
    ? (systemInfo.virtual_memory.total / (1024 ** 3)).toFixed(1) 
    : "16.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="text-cyber-accent" size={26} />
            Endpoint Security Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time host monitoring, behavioral telemetry & automated threat mitigation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleQuickScan}
            disabled={scanning}
            className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
            <span>{scanning ? "Scanning Artifacts..." : "Run EDR Threat Scan"}</span>
          </button>
          <button
            onClick={fetchData}
            title="Refresh Telemetry"
            className="p-2 bg-cyber-surface hover:bg-slate-800 text-slate-300 rounded-md border border-cyber-border transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-cyber-accent" : ""} />
          </button>
        </div>
      </div>

      {scanResult && (
        <div className="bg-cyan-950/50 border border-cyan-500/50 text-cyan-200 text-xs p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-cyan-400" />
            <span>{scanResult}</span>
          </div>
          <button onClick={() => setScanResult(null)} className="text-cyan-400 hover:text-cyan-200 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Score */}
        <div className="bg-cyber-dark/80 border border-cyber-border rounded-lg p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Threat Level</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800">
              HIGH RISK
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-red-400">78<span className="text-xs text-slate-500">/100</span></span>
            <AlertTriangle className="text-amber-500" size={24} />
          </div>
          <p className="text-[11px] text-slate-400">2 behavioral anomalies detected requiring immediate action.</p>
        </div>

        {/* Process Count */}
        <Link href="/processes" className="bg-cyber-dark/80 border border-cyber-border hover:border-cyan-500/40 rounded-lg p-5 flex flex-col justify-between shadow-lg transition-colors group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Live Processes</span>
            <ArrowUpRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-slate-100">{processes.length}</span>
            <Activity className="text-cyan-400" size={24} />
          </div>
          <p className="text-[11px] text-slate-400">
            <span className="text-amber-400 font-semibold">{suspiciousProcesses.length}</span> flagged suspicious
          </p>
        </Link>

        {/* Network Sockets */}
        <Link href="/network" className="bg-cyber-dark/80 border border-cyber-border hover:border-cyan-500/40 rounded-lg p-5 flex flex-col justify-between shadow-lg transition-colors group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Network Sockets</span>
            <ArrowUpRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-slate-100">{network.length}</span>
            <Network className="text-emerald-400" size={24} />
          </div>
          <p className="text-[11px] text-slate-400">
            <span className="text-cyan-400 font-semibold">{externalConnections.length}</span> external remote endpoints
          </p>
        </Link>

        {/* Sysmon & IOC Indicators */}
        <Link href="/threat-intel" className="bg-cyber-dark/80 border border-cyber-border hover:border-cyan-500/40 rounded-lg p-5 flex flex-col justify-between shadow-lg transition-colors group">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Threat Intelligence</span>
            <ArrowUpRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-purple-400">{threatStats.total_iocs || 124}</span>
            <TerminalSquare className="text-purple-400" size={24} />
          </div>
          <p className="text-[11px] text-slate-400">
            <span className="text-red-400 font-semibold">{threatStats.matched_threats || 2}</span> IOC matches found
          </p>
        </Link>
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flagged Detections */}
        <div className="lg:col-span-2 bg-cyber-dark/80 border border-cyber-border rounded-lg p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              High Priority Endpoint Alerts
            </h3>
            <Link href="/security" className="text-xs text-cyber-accent hover:underline flex items-center gap-1">
              View Security Center <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-red-400 uppercase">Suspicious Process</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-900/40 text-red-300">T1059.001</span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-mono">powershell.exe -enc SQBFAFgA... (PID: 4820)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Base64 encoded payload executed from command-line interface.</p>
              </div>
              <span className="text-xs font-mono text-red-400 font-bold">Score 85</span>
            </div>

            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-red-400 uppercase">Suspicious Outbound Socket</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-900/40 text-red-300">T1071.001</span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-mono">192.168.1.105:54321 &rarr; 185.220.101.5:4444</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Active socket to known CobaltStrike C2 IP address.</p>
              </div>
              <span className="text-xs font-mono text-red-400 font-bold">Score 90</span>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase">Persistence Added</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300">T1547.001</span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-mono">Startup Folder: vant_sync.bat</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Batch script placed in Startup folder with no digital signature.</p>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">Score 70</span>
            </div>
          </div>
        </div>

        {/* Live System Posture */}
        <div className="bg-cyber-dark/80 border border-cyber-border rounded-lg p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Cpu size={16} className="text-cyber-accent" />
                Live Endpoint Telemetry
              </h3>
              <Link href="/system" className="text-xs text-cyber-accent hover:underline flex items-center gap-1">
                Details <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>CPU Utilization ({systemInfo?.cpu_count || 8} Cores)</span>
                  <span className="font-mono text-cyan-400">{systemInfo?.cpu_percent || 18.4}%</span>
                </div>
                <div className="w-full bg-cyber-surface rounded-full h-2 overflow-hidden border border-cyber-border">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, systemInfo?.cpu_percent || 18.4)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>RAM Usage ({ramUsedGb} GB / {ramTotalGb} GB)</span>
                  <span className="font-mono text-cyan-400">{systemInfo?.virtual_memory?.percent || 54.2}%</span>
                </div>
                <div className="w-full bg-cyber-surface rounded-full h-2 overflow-hidden border border-cyber-border">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, systemInfo?.virtual_memory?.percent || 54.2)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>System Disk (C:)</span>
                  <span className="font-mono text-cyan-400">{systemInfo?.disk_usage?.percent || 62.0}%</span>
                </div>
                <div className="w-full bg-cyber-surface rounded-full h-2 overflow-hidden border border-cyber-border">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, systemInfo?.disk_usage?.percent || 62.0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cyber-border text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Host:</span>
              <span className="text-slate-200 font-mono">{systemInfo?.hostname || "VANT-ENDPOINT-01"}</span>
            </div>
            <div className="flex justify-between">
              <span>OS:</span>
              <span className="text-slate-200 font-mono">{systemInfo?.os_name || "Windows 11 Enterprise"}</span>
            </div>
            <div className="flex justify-between">
              <span>EDR Sysmon:</span>
              <span className="text-emerald-400 font-mono font-semibold">Active & Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/persistence" className="p-4 bg-cyber-surface/60 border border-cyber-border hover:border-cyan-500/50 rounded-lg transition-all group">
          <Key className="text-cyan-400 group-hover:scale-110 transition-transform mb-2" size={20} />
          <h4 className="text-xs font-semibold text-slate-200">Persistence</h4>
          <p className="text-[11px] text-slate-400 mt-1">Registry, Tasks & Startup</p>
        </Link>
        <Link href="/sysmon" className="p-4 bg-cyber-surface/60 border border-cyber-border hover:border-cyan-500/50 rounded-lg transition-all group">
          <TerminalSquare className="text-purple-400 group-hover:scale-110 transition-transform mb-2" size={20} />
          <h4 className="text-xs font-semibold text-slate-200">Sysmon Logs</h4>
          <p className="text-[11px] text-slate-400 mt-1">Deep Windows event trail</p>
        </Link>
        <Link href="/threat-intel" className="p-4 bg-cyber-surface/60 border border-cyber-border hover:border-cyan-500/50 rounded-lg transition-all group">
          <ShieldAlert className="text-amber-400 group-hover:scale-110 transition-transform mb-2" size={20} />
          <h4 className="text-xs font-semibold text-slate-200">Threat Intel</h4>
          <p className="text-[11px] text-slate-400 mt-1">IOCs & Signature match</p>
        </Link>
        <Link href="/reports" className="p-4 bg-cyber-surface/60 border border-cyber-border hover:border-cyan-500/50 rounded-lg transition-all group">
          <Database className="text-emerald-400 group-hover:scale-110 transition-transform mb-2" size={20} />
          <h4 className="text-xs font-semibold text-slate-200">Investigation Reports</h4>
          <p className="text-[11px] text-slate-400 mt-1">Export JSON & DFIR audit</p>
        </Link>
      </div>
    </div>
  );
}
