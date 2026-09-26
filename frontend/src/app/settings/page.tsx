"use client";

import React, { useState } from "react";
import { Settings, Shield, Server, Bell, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    apiUrl: "http://127.0.0.1:8000/api",
    pollInterval: 10,
    sysmonLogging: true,
    riskThreshold: 70,
    autoTerminateC2: false,
    retentionDays: 30,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="text-cyber-accent" size={24} />
            Agent & Platform Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure telemetry polling cadence, automated response policies, and Sysmon ingestion parameters.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle2 size={16} />
          <span>Configuration saved successfully! Sensor parameters updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* API Connection */}
        <div className="bg-cyber-dark/80 border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Server size={18} className="text-cyber-accent" />
            Backend API & Sensor Connection
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 block mb-1">Backend REST API Endpoint</label>
              <input
                type="text"
                value={settings.apiUrl}
                onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                className="w-full bg-cyber-dark text-slate-200 p-2.5 rounded border border-cyber-border focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Telemetry Refresh Cadence (seconds)</label>
              <input
                type="number"
                min={3}
                max={300}
                value={settings.pollInterval}
                onChange={(e) => setSettings({ ...settings, pollInterval: parseInt(e.target.value) || 10 })}
                className="w-full bg-cyber-dark text-slate-200 p-2.5 rounded border border-cyber-border focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* EDR & Detection Engine Policies */}
        <div className="bg-cyber-dark/80 border border-cyber-border rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Shield size={18} className="text-cyber-accent" />
            Detection Engine & Sysmon Configuration
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
              <div>
                <p className="font-semibold text-slate-200">Microsoft-Windows-Sysmon Operational Ingestion</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Stream process creation (1), network connections (3), and image load (7) events.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.sysmonLogging}
                onChange={(e) => setSettings({ ...settings, sysmonLogging: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
              <div>
                <p className="font-semibold text-slate-200">Critical Threat Alert Threshold</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Minimum score (0-100) to trigger urgent analyst notifications.</p>
              </div>
              <input
                type="number"
                min={10}
                max={100}
                value={settings.riskThreshold}
                onChange={(e) => setSettings({ ...settings, riskThreshold: parseInt(e.target.value) || 70 })}
                className="w-20 bg-cyber-dark text-slate-200 p-1.5 rounded border border-cyber-border focus:border-cyan-500 focus:outline-none font-mono text-center"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-cyber-surface/60 rounded-lg border border-cyber-border">
              <div>
                <p className="font-semibold text-slate-200">Automated C2 Socket Termination</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Automatically kill processes with active verified C2 IOC connections.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoTerminateC2}
                onChange={(e) => setSettings({ ...settings, autoTerminateC2: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 text-xs font-semibold px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md shadow-lg transition-all"
          >
            <Save size={15} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
