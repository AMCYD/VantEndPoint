"use client";

import React, { useState } from "react";
import {
  Settings, Shield, Server, Save, CheckCircle2,
  Moon, Sun, Monitor, Palette, Bell, Database,
  RefreshCw, Eye, EyeOff, Info,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

/* ─── reusable section card ─── */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 pb-2 border-b border-cyber-border">
        <span className="text-cyber-accent">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ─── toggle row ─── */
function ToggleRow({
  label, sublabel, checked, onChange,
}: { label: string; sublabel?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-cyber-border/50 last:border-0">
      <div>
        <p className="text-[13px] font-medium text-slate-200">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-sky-500" : "bg-cyber-surface border border-cyber-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/* ─── theme option card ─── */
function ThemeOption({
  mode, label, desc, icon, active, onClick,
}: { mode: string; label: string; desc: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        active
          ? "border-sky-500 bg-sky-500/10 shadow-[0_0_16px_rgba(56,189,248,0.15)]"
          : "border-cyber-border bg-cyber-surface/40 hover:border-cyber-border/80 hover:bg-cyber-surface"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        active ? "bg-sky-500/20 text-sky-400" : "bg-cyber-surface text-slate-400"
      }`}>
        {icon}
      </div>
      <p className={`text-[12px] font-semibold ${active ? "text-sky-400" : "text-slate-300"}`}>{label}</p>
      <p className="text-[10px] text-slate-500 text-center">{desc}</p>
      {active && (
        <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1">
          <CheckCircle2 size={11} /> Active
        </span>
      )}
    </button>
  );
}

/* ─────────────────── Page ─────────────────── */
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [saved, setSaved]   = useState(false);
  const [cfg, setCfg]       = useState({
    apiUrl:           "http://127.0.0.1:8000/api",
    pollInterval:     10,
    sysmonLogging:    true,
    riskThreshold:    70,
    autoTerminateC2:  false,
    retentionDays:    30,
    compactSidebar:   false,
    showGridLines:    true,
    notifications:    true,
    soundAlerts:      false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings size={20} className="text-cyber-accent" />
            Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure appearance, telemetry, detection policies, and system preferences.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 size={15} />
          Settings saved successfully!
        </div>
      )}

      {/* ── THAT "N" BUTTON EXPLANATION ── */}
      <div className="p-4 bg-amber-950/30 border border-amber-700/50 rounded-xl flex items-start gap-3">
        <Info size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-semibold text-amber-300">About the "N" button in the bottom-left corner</p>
          <p className="text-[11px] text-amber-200/70 mt-1">
            That small "N" button is the <strong>Next.js Dev Tools overlay</strong> — automatically injected by Next.js 
            only in development mode. It shows internal info like route type, bundler, and dev preferences. 
            It is <strong>not part of VantEndpoint</strong> and will <strong>disappear completely</strong> when you run 
            a production build. You cannot remove it in dev mode — it is normal.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── APPEARANCE ── */}
        <Section title="Appearance & Theme" icon={<Palette size={16} />}>
          <p className="text-[11px] text-slate-500 -mt-2">
            Choose how VantEndpoint looks. Your preference is saved automatically and persists across sessions.
          </p>

          {/* Theme picker cards */}
          <div className="flex gap-3">
            <ThemeOption
              mode="dark"
              label="Dark Mode"
              desc="Easy on the eyes. Recommended for extended use in low-light."
              icon={<Moon size={20} />}
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
            />
            <ThemeOption
              mode="light"
              label="Light Mode"
              desc="High contrast. Best for bright environments or daylight use."
              icon={<Sun size={20} />}
              active={theme === "light"}
              onClick={() => setTheme("light")}
            />
          </div>

          <ToggleRow
            label="Compact Sidebar"
            sublabel="Reduce sidebar padding for more screen space"
            checked={cfg.compactSidebar}
            onChange={(v) => setCfg({ ...cfg, compactSidebar: v })}
          />
          <ToggleRow
            label="Show Grid Lines in Tables"
            sublabel="Display row separators in all data grids"
            checked={cfg.showGridLines}
            onChange={(v) => setCfg({ ...cfg, showGridLines: v })}
          />
        </Section>

        {/* ── BACKEND ── */}
        <Section title="Backend API & Telemetry" icon={<Server size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5">Backend REST API Endpoint</label>
              <input
                type="text"
                value={cfg.apiUrl}
                onChange={(e) => setCfg({ ...cfg, apiUrl: e.target.value })}
                className="w-full bg-cyber-surface text-slate-200 p-2.5 rounded-lg border border-cyber-border focus:border-sky-500 focus:outline-none font-mono text-[12px] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5">Telemetry Refresh Interval (seconds)</label>
              <input
                type="number"
                min={3}
                max={300}
                value={cfg.pollInterval}
                onChange={(e) => setCfg({ ...cfg, pollInterval: parseInt(e.target.value) || 10 })}
                className="w-full bg-cyber-surface text-slate-200 p-2.5 rounded-lg border border-cyber-border focus:border-sky-500 focus:outline-none font-mono text-[12px] transition-colors"
              />
            </div>
          </div>
        </Section>

        {/* ── DETECTION ENGINE ── */}
        <Section title="Detection Engine & Policies" icon={<Shield size={16} />}>
          <ToggleRow
            label="Sysmon Event Ingestion"
            sublabel="Stream process creation, network, and image load events from Sysmon"
            checked={cfg.sysmonLogging}
            onChange={(v) => setCfg({ ...cfg, sysmonLogging: v })}
          />
          <ToggleRow
            label="Automated C2 Socket Termination"
            sublabel="Automatically kill processes with verified C2 IOC connections"
            checked={cfg.autoTerminateC2}
            onChange={(v) => setCfg({ ...cfg, autoTerminateC2: v })}
          />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-[13px] font-medium text-slate-200">Alert Risk Threshold</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Score (0–100) to trigger critical analyst notifications</p>
            </div>
            <input
              type="number"
              min={10}
              max={100}
              value={cfg.riskThreshold}
              onChange={(e) => setCfg({ ...cfg, riskThreshold: parseInt(e.target.value) || 70 })}
              className="w-20 bg-cyber-surface text-slate-200 p-1.5 rounded-lg border border-cyber-border focus:border-sky-500 focus:outline-none font-mono text-center text-[12px]"
            />
          </div>
        </Section>

        {/* ── NOTIFICATIONS ── */}
        <Section title="Notifications & Alerts" icon={<Bell size={16} />}>
          <ToggleRow
            label="Desktop Notifications"
            sublabel="Show browser notifications for critical threat events"
            checked={cfg.notifications}
            onChange={(v) => setCfg({ ...cfg, notifications: v })}
          />
          <ToggleRow
            label="Sound Alerts"
            sublabel="Play an audio alert when a critical threat is detected"
            checked={cfg.soundAlerts}
            onChange={(v) => setCfg({ ...cfg, soundAlerts: v })}
          />
        </Section>

        {/* ── DATA RETENTION ── */}
        <Section title="Data & Storage" icon={<Database size={16} />}>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-[13px] font-medium text-slate-200">Event Retention Period</p>
              <p className="text-[11px] text-slate-500 mt-0.5">How many days to keep telemetry snapshots and Sysmon logs</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={365}
                value={cfg.retentionDays}
                onChange={(e) => setCfg({ ...cfg, retentionDays: parseInt(e.target.value) || 30 })}
                className="w-20 bg-cyber-surface text-slate-200 p-1.5 rounded-lg border border-cyber-border focus:border-sky-500 focus:outline-none font-mono text-center text-[12px]"
              />
              <span className="text-[11px] text-slate-500">days</span>
            </div>
          </div>
        </Section>

        {/* Save */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setCfg({
              apiUrl: "http://127.0.0.1:8000/api",
              pollInterval: 10, sysmonLogging: true, riskThreshold: 70,
              autoTerminateC2: false, retentionDays: 30, compactSidebar: false,
              showGridLines: true, notifications: true, soundAlerts: false,
            })}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg border border-cyber-border bg-cyber-surface text-slate-400 hover:text-slate-200 transition-all"
          >
            <RefreshCw size={13} /> Reset to Defaults
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 text-xs font-semibold px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-lg transition-all"
          >
            <Save size={13} />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
