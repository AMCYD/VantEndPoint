"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, AlertTriangle, Bug, Activity, CheckCircle2, Flame, ExternalLink, RefreshCw } from "lucide-react";
import { ThreatIntelService, InvestigationService } from "@/services/api";

export default function SecurityPage() {
  const [scanning, setScanning] = useState(false);
  const [scanOutput, setScanOutput] = useState<any>(null);

  const [securityEvents, setSecurityEvents] = useState([
    { id: 1, type: "Suspicious Process", process: "powershell.exe", details: "Base64 encoded command execution (-enc SQBFAFgA...)", severity: "High", mitre: "T1059.001", time: "20:15:02" },
    { id: 2, type: "Network Anomaly", process: "powershell.exe", details: "Outbound socket to known C2 IP 185.220.101.5:4444", severity: "Critical", mitre: "T1071.001", time: "20:15:04" },
    { id: 3, type: "Persistence Mechanism", process: "cmd.exe", details: "Executable placed in Startup folder: vant_sync.bat", severity: "High", mitre: "T1547.001", time: "20:10:11" },
    { id: 4, type: "Sysmon Alert", process: "svchost.exe", details: "Potential LSASS memory read attempt (Event ID 10)", severity: "Critical", mitre: "T1003", time: "19:48:33" },
    { id: 5, type: "Unsigned Binary", process: "setup_v2.exe", details: "Binary execution without Microsoft Authenticode signature", severity: "Medium", mitre: "T1036", time: "18:22:19" },
  ]);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await ThreatIntelService.scanCurrentEndpoint();
      setScanOutput(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="text-cyber-accent" size={24} />
            Endpoint Security & Threat Detection
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            MITRE ATT&CK framework mapping, behavioral anomaly correlation, and automated risk scoring.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md shadow transition-all disabled:opacity-50"
        >
          <Flame size={14} className={scanning ? "animate-spin" : ""} />
          <span>{scanning ? "Evaluating Threat Signatures..." : "Run EDR Anomaly Scan"}</span>
        </button>
      </div>

      {scanOutput && (
        <div className="p-4 bg-cyber-dark border border-cyber-border rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-100">EDR Threat Scan Results:</span>
            <span className="font-mono text-cyan-400">Scanned {scanOutput.total_scanned} artifacts</span>
          </div>
          <p className="text-slate-300">
            Detected {scanOutput.matches?.length || 0} active threat indicators. Calculated Endpoint Risk Score:{" "}
            <span className="text-red-400 font-bold font-mono">{scanOutput.threat_score}/100</span>.
          </p>
        </div>
      )}

      {/* Threat Posture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score Circle */}
        <div className="bg-cyber-dark/80 border border-cyber-border rounded-xl p-6 flex flex-col items-center justify-center shadow-xl">
          <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-3">Calculated Endpoint Risk Score</h3>
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-red-500 bg-red-950/20 text-red-400 text-4xl font-bold font-mono shadow-lg shadow-red-950/50">
            78
          </div>
          <p className="mt-4 text-xs text-red-400 font-semibold uppercase tracking-wider">High Risk Posture</p>
          <p className="text-[11px] text-slate-400 text-center mt-1">2 critical anomalies requiring containment</p>
        </div>

        {/* MITRE ATT&CK Framework Coverage */}
        <div className="md:col-span-2 bg-cyber-dark/80 border border-cyber-border rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <Activity size={18} className="text-cyber-accent" />
              MITRE ATT&CK Matrix Correlation
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
                <span className="text-slate-400 block text-[10px] uppercase">Execution</span>
                <span className="font-mono text-amber-400 font-bold mt-1 block">T1059.001</span>
                <span className="text-[10px] text-slate-400">PowerShell Encoded Command</span>
              </div>

              <div className="p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
                <span className="text-slate-400 block text-[10px] uppercase">Command & Control</span>
                <span className="font-mono text-red-400 font-bold mt-1 block">T1071.001</span>
                <span className="text-[10px] text-slate-400">Application Layer Beaconing</span>
              </div>

              <div className="p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
                <span className="text-slate-400 block text-[10px] uppercase">Persistence</span>
                <span className="font-mono text-amber-400 font-bold mt-1 block">T1547.001</span>
                <span className="text-[10px] text-slate-400">Registry Run & Startup Folder</span>
              </div>

              <div className="p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
                <span className="text-slate-400 block text-[10px] uppercase">Credential Access</span>
                <span className="font-mono text-red-400 font-bold mt-1 block">T1003</span>
                <span className="text-[10px] text-slate-400">OS Credential Dumping</span>
              </div>

              <div className="p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
                <span className="text-slate-400 block text-[10px] uppercase">Defense Evasion</span>
                <span className="font-mono text-emerald-400 font-bold mt-1 block">CLEAR</span>
                <span className="text-[10px] text-slate-400">No AMSI bypass detected</span>
              </div>

              <div className="p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
                <span className="text-slate-400 block text-[10px] uppercase">Privilege Escalation</span>
                <span className="font-mono text-emerald-400 font-bold mt-1 block">CLEAR</span>
                <span className="text-[10px] text-slate-400">UAC baseline intact</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-cyber-border flex items-center justify-between">
            <span>Correlation based on Windows Sysmon & native process telemetry.</span>
            <span className="text-cyan-400 font-mono">Framework v14.1</span>
          </p>
        </div>
      </div>

      {/* Security Alerts Table */}
      <div className="bg-cyber-dark/80 border border-cyber-border rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          Correlated Security Detections
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Detection Category</th>
                <th className="py-2.5 px-3">Process / Entity</th>
                <th className="py-2.5 px-3">MITRE ATT&CK</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {securityEvents.map((evt) => (
                <tr key={evt.id} className="border-b border-cyber-border/40 hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        evt.severity === "Critical"
                          ? "bg-red-950/70 text-red-400 border border-red-800"
                          : evt.severity === "High"
                          ? "bg-amber-950/70 text-amber-400 border border-amber-800"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{evt.time}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{evt.type}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400">{evt.process}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    <span className="px-1.5 py-0.5 rounded bg-cyber-surface border border-cyber-border text-[10px]">
                      {evt.mitre}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{evt.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
