"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Activity, Network, ShieldAlert, ServerCog, Settings, Database,
  Users, RefreshCw, Search, Cpu, HardDrive, MemoryStick, Clock,
  CheckCircle, XCircle, AlertTriangle, Zap, Globe, Key, FileText,
  BarChart3, ChevronRight, Wifi, TerminalSquare, Monitor, Hash,
  TrendingUp, TrendingDown, Minus, Copy, ExternalLink, Shield,
} from "lucide-react";
import { InvestigationService } from "@/services/api";

/* ─── tiny helpers ─── */
const gb = (b: number) => b ? (b / 1024 ** 3).toFixed(1) : "—";

function PulsingDot({ color }: { color: "green" | "red" | "amber" | "blue" }) {
  const map = {
    green: "bg-emerald-400 shadow-emerald-500/60",
    red:   "bg-red-400 shadow-red-500/60",
    amber: "bg-amber-400 shadow-amber-500/60",
    blue:  "bg-blue-400 shadow-blue-500/60",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_2px] ${map[color]}`} />
  );
}

/* ─── Stat card (like rConfig) ─── */
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  accent?: boolean; /* amber gradient highlight */
  trend?: "up" | "down" | "flat";
  link?: string;
}

function StatCard({ title, value, subtitle, icon, iconBg, accent, trend, link }: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-red-400" : trend === "down" ? "text-emerald-400" : "text-slate-500";

  const inner = (
    <div className={`relative rounded-xl border p-4 flex flex-col gap-2 overflow-hidden transition-all hover:scale-[1.01] cursor-pointer ${
      accent
        ? "border-amber-600/60 bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 text-white shadow-lg shadow-amber-900/40"
        : "border-cyber-border bg-cyber-panel hover:border-cyber-border/80"
    }`}>
      {/* top row */}
      <div className="flex items-start justify-between">
        <p className={`text-[11px] font-medium uppercase tracking-wider ${accent ? "text-amber-100" : "text-slate-400"}`}>
          {title}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? "bg-white/20" : iconBg}`}>
          {icon}
        </div>
      </div>
      {/* value */}
      <p className={`text-2xl font-bold font-mono leading-none ${accent ? "text-white" : "text-slate-100"}`}>
        {value}
      </p>
      {/* subtitle */}
      {subtitle && (
        <div className="flex items-center gap-1.5">
          <TrendIcon size={11} className={trendColor} />
          <p className={`text-[11px] ${accent ? "text-amber-100" : "text-slate-500"}`}>{subtitle}</p>
        </div>
      )}
    </div>
  );

  return link ? <Link href={link}>{inner}</Link> : <div>{inner}</div>;
}

/* ─── Quick Action pill ─── */
function QAction({ href, dot, label, sublabel }: { href: string; dot: string; label: string; sublabel: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 p-3 rounded-lg border border-cyber-border bg-cyber-surface/30 hover:bg-cyber-surface hover:border-cyber-accent/40 transition-all group">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-slate-100 group-hover:text-cyber-accent transition-colors">{label}</p>
        <p className="text-[10px] text-slate-500 truncate">{sublabel}</p>
      </div>
    </Link>
  );
}

/* ─── InfoRow (System Info style) ─── */
function InfoRow({ icon, label, value, mono = true }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-cyber-border/50 last:border-0 group">
      <div className="flex items-center gap-2.5 text-slate-400">
        <span className="w-5 flex-shrink-0 flex items-center justify-center">{icon}</span>
        <span className="text-[12px]">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`text-[12px] text-slate-100 ${mono ? "font-mono" : ""} truncate max-w-[180px]`}>{value}</span>
        <button
          onClick={() => navigator.clipboard?.writeText(value).catch(() => {})}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyber-accent"
        >
          <Copy size={10} />
        </button>
      </div>
    </div>
  );
}

/* ─── Health row ─── */
function HealthRow({ icon, label, value, dot, sublabel }: { icon: React.ReactNode; label: string; value: string; dot: "green" | "red" | "amber" | "blue"; sublabel?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-cyber-border/50 last:border-0">
      <div className="flex items-center gap-2.5 text-slate-400">
        <span className="w-5 flex-shrink-0 flex items-center justify-center">{icon}</span>
        <div>
          <span className="text-[12px]">{label}</span>
          {sublabel && <p className="text-[10px] text-slate-600">{sublabel}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-mono text-slate-200">{value}</span>
        <PulsingDot color={dot} />
      </div>
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────── */
export default function DashboardPage() {
  const [sys, setSys]   = useState<any>(null);
  const [procs, setProcs] = useState<any[]>([]);
  const [nets, setNets]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline]   = useState<boolean | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, n] = await Promise.all([
        InvestigationService.getSystemInfo(),
        InvestigationService.getProcesses(),
        InvestigationService.getNetworkConnections(),
      ]);
      setSys(s);
      setProcs(Array.isArray(p) ? p : []);
      setNets(Array.isArray(n) ? n : []);
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  /* derived */
  const cpu      = sys?.cpu_percent ?? 0;
  const ram      = sys?.virtual_memory?.percent ?? 0;
  const disk     = sys?.disk_usage?.percent ?? 0;
  const ramTotal = gb(sys?.virtual_memory?.total ?? 0);
  const ramUsed  = gb(sys?.virtual_memory?.used  ?? 0);
  const diskTotal= gb(sys?.disk_usage?.total     ?? 0);
  const cores    = sys?.cpu_count    ?? "—";
  const hostname = sys?.hostname     ?? "VANT-ENDPOINT";
  const osName   = sys?.os_name      ?? "Windows";
  const bootTime = sys?.boot_time    ?? "—";
  const sysmon   = sys?.sysmon_installed ?? false;
  const procCnt  = procs.length;
  const netCnt   = nets.length;

  /* top 5 processes by cpu or first 5 */
  const topProcs = [...procs].sort((a, b) => (b.cpu_percent ?? 0) - (a.cpu_percent ?? 0)).slice(0, 5);
  /* first 5 established connections */
  const topNets  = nets.filter(c => c.status === "ESTABLISHED").slice(0, 5);

  return (
    <div className="space-y-4 pb-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-slate-100">Dashboard</h1>
          <div className="flex items-center gap-1.5">
            <PulsingDot color={online ? "green" : online === false ? "red" : "amber"} />
            <span className="text-[11px] text-slate-500">
              {online === null ? "Connecting…" : online ? `Backend live · ${lastRefresh.toLocaleTimeString()}` : "Backend offline"}
            </span>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-cyber-border bg-cyber-surface text-slate-400 hover:text-cyber-accent hover:border-cyber-accent/50 transition-all disabled:opacity-40"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-cyber-panel border border-cyber-border rounded-xl p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
          <Zap size={10} className="text-cyber-accent" /> Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <QAction href="/processes"    dot="bg-green-400"  label="View Processes"   sublabel="Inspect running procs"   />
          <QAction href="/network"      dot="bg-blue-400"   label="Network Activity" sublabel="Live connections"         />
          <QAction href="/security"     dot="bg-red-400"    label="Security Threats" sublabel="Detections & alerts"      />
          <QAction href="/threat-intel" dot="bg-amber-400"  label="Threat Intel"     sublabel="IOC matching"             />
          <QAction href="/persistence"  dot="bg-purple-400" label="Persistence"      sublabel="Registry & startup items" />
          <QAction href="/settings"     dot="bg-slate-400"  label="Settings"         sublabel="Configure system"         />
        </div>
      </div>

      {/* ── 6 Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="CPU Usage"
          value={loading ? "…" : `${cpu.toFixed(1)}%`}
          subtitle={`${cores} logical cores`}
          icon={<Cpu size={15} className="text-cyan-300" />}
          iconBg="bg-cyan-900/50"
          link="/system"
          trend={cpu > 80 ? "up" : "flat"}
        />
        <StatCard
          title="Memory"
          value={loading ? "…" : `${ram.toFixed(1)}%`}
          subtitle={`${ramUsed} / ${ramTotal} GB`}
          icon={<MemoryStick size={15} className="text-purple-300" />}
          iconBg="bg-purple-900/50"
          link="/system"
          trend={ram > 80 ? "up" : "flat"}
        />
        <StatCard
          title="Disk Usage"
          value={loading ? "…" : `${disk.toFixed(1)}%`}
          subtitle={`${diskTotal} GB total`}
          icon={<HardDrive size={15} className="text-emerald-300" />}
          iconBg="bg-emerald-900/50"
          link="/system"
          trend={disk > 85 ? "up" : "flat"}
        />
        <StatCard
          title="Processes"
          value={loading ? "…" : procCnt}
          subtitle="Running on endpoint"
          icon={<Activity size={15} className="text-blue-300" />}
          iconBg="bg-blue-900/50"
          link="/processes"
          trend="flat"
        />
        {/* Accent / highlighted card — matches the orange "Last Config Time" */}
        <StatCard
          title="Last Scan Time"
          value={lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          subtitle={`${lastRefresh.toLocaleDateString("en-GB")}`}
          icon={<Clock size={15} className="text-white" />}
          iconBg="bg-white/20"
          accent
          trend="flat"
        />
        <StatCard
          title="Active Threats"
          value="0"
          subtitle="No detections found"
          icon={<ShieldAlert size={15} className="text-emerald-300" />}
          iconBg="bg-emerald-900/50"
          link="/security"
          trend="down"
        />
      </div>

      {/* ── Middle: System Info + Health Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* System Info */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[13px] font-semibold text-slate-100 flex items-center gap-2">
              <Monitor size={14} className="text-cyber-accent" /> System Info
            </h2>
            <Link href="/system" className="text-[11px] text-cyber-accent hover:underline flex items-center gap-1">
              Details <ExternalLink size={10} />
            </Link>
          </div>
          <div className="mt-3">
            <InfoRow icon={<Monitor     size={12} className="text-blue-400"   />} label="OS"         value={osName}     />
            <InfoRow icon={<ServerCog   size={12} className="text-purple-400" />} label="Hostname"   value={hostname}   />
            <InfoRow icon={<Globe       size={12} className="text-cyan-400"   />} label="Local IP"   value={"127.0.0.1"}/>
            <InfoRow icon={<Cpu         size={12} className="text-amber-400"  />} label="CPU Cores"  value={String(cores)} />
            <InfoRow icon={<MemoryStick size={12} className="text-emerald-400"/>} label="Total RAM"  value={`${ramTotal} GB`} />
            <InfoRow icon={<Clock       size={12} className="text-slate-400"  />} label="Boot Time"  value={bootTime}   />
          </div>
          <button className="mt-3 w-full text-[11px] text-slate-400 border border-cyber-border rounded-lg py-1.5 hover:border-cyber-accent/40 hover:text-cyber-accent transition-all">
            Details
          </button>
        </div>

        {/* Health Status */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[13px] font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" /> Health Status
            </h2>
            <button onClick={load} className="text-[11px] text-cyber-accent hover:underline flex items-center gap-1">
              <RefreshCw size={10} /> Refresh
            </button>
          </div>
          <div className="mt-3">
            <HealthRow
              icon={<Cpu size={12} className="text-cyan-400" />}
              label="CPU Load"
              value={`${cpu.toFixed(2)} ${cpu.toFixed(2)} ${cpu.toFixed(2)}`}
              dot={cpu < 80 ? "green" : "red"}
            />
            <HealthRow
              icon={<Activity size={12} className="text-purple-400" />}
              label="Horizon Queue"
              value="Running"
              dot="green"
            />
            <HealthRow
              icon={<Wifi size={12} className="text-blue-400" />}
              label="Backend API"
              value={online ? "127.0.0.1:8000 reachable" : "unreachable"}
              dot={online ? "green" : "red"}
            />
            <HealthRow
              icon={<Database size={12} className="text-emerald-400" />}
              label="Database"
              value={online ? "Ok" : "Error"}
              dot={online ? "green" : "red"}
            />
            <HealthRow
              icon={<TerminalSquare size={12} className="text-amber-400" />}
              label="Sysmon Agent"
              value={sysmon ? "Active" : "Not detected"}
              dot={sysmon ? "green" : "amber"}
            />
          </div>
          {bootTime !== "—" && (
            <p className="mt-3 text-[10px] text-slate-500">
              System uptime since: {bootTime}
            </p>
          )}
          <button className="mt-3 w-full text-[11px] text-slate-400 border border-cyber-border rounded-lg py-1.5 hover:border-cyber-accent/40 hover:text-cyber-accent transition-all">
            Details
          </button>
        </div>
      </div>

      {/* ── Bottom: Latest Processes + Latest Connections + Quick Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Latest Processes — mirrors "Latest Devices" */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-slate-100 flex items-center gap-2">
              <Activity size={13} className="text-cyan-400" /> Latest Processes
            </h2>
            <Link href="/processes" className="text-[11px] text-cyber-accent hover:underline">View All</Link>
          </div>

          <div className="space-y-1">
            {loading ? (
              <p className="text-xs text-slate-500 py-4 text-center">Loading…</p>
            ) : topProcs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No process data</p>
            ) : topProcs.map((p: any, i: number) => (
              <div key={p.pid ?? i} className="flex items-center justify-between py-2 border-b border-cyber-border/40 last:border-0 hover:bg-cyber-surface/30 rounded px-1 transition-colors">
                <div className="min-w-0">
                  <p className="text-[12px] text-slate-200 font-mono truncate max-w-[160px]">{p.name ?? "unknown"}</p>
                  <p className="text-[10px] text-slate-500">{p.pid ? `PID ${p.pid}` : "—"} &nbsp;·&nbsp; {p.username ?? ""}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  (p.cpu_percent ?? 0) > 30 ? "bg-red-900/40 text-red-400" : "bg-emerald-900/40 text-emerald-400"
                }`}>
                  {(p.cpu_percent ?? 0) > 30 ? "High CPU" : "Running"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Connections — mirrors "Latest Configs" */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-slate-100 flex items-center gap-2">
              <Network size={13} className="text-blue-400" /> Latest Connections
            </h2>
            <Link href="/network" className="text-[11px] text-cyber-accent hover:underline">View All</Link>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-4 text-center">Loading…</p>
          ) : (
            <>
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-cyber-border/60">
                  <span>Remote Address</span>
                  <div className="flex gap-8">
                    <span>Status</span>
                    <span>PID</span>
                  </div>
                </div>
                {topNets.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No established connections</p>
                ) : topNets.map((c: any, i: number) => {
                  const rip   = c.raddr?.ip ?? c.raddr ?? "—";
                  const rport = c.raddr?.port ?? "";
                  return (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-cyber-border/30 last:border-0 hover:bg-cyber-surface/30 rounded px-1 transition-colors">
                      <p className="text-[11px] text-slate-200 font-mono">{rip}{rport ? `:${rport}` : ""}</p>
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <PulsingDot color="green" /> ESTAB
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono w-12 text-right">{c.pid ?? "—"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link href="/network" className="w-full flex items-center justify-center py-2 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                View All Connections
              </Link>
            </>
          )}
        </div>

        {/* Quick Stats — mirrors "Quick Stats" */}
        <div className="bg-cyber-panel border border-cyber-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-slate-100 flex items-center gap-2">
              <BarChart3 size={13} className="text-purple-400" /> Quick Stats
            </h2>
          </div>

          <div className="space-y-0">
            {[
              { label: "Backend Uptime",    value: online ? "100.0%"  : "Offline",   ok: online ?? false },
              { label: "Config Success",    value: "100.0%",                          ok: true },
              { label: "Running Processes", value: loading ? "…" : String(procCnt), ok: true },
              { label: "Active Sockets",   value: loading ? "…" : String(netCnt),   ok: true },
              { label: "Active Threats",   value: "0",                               ok: true },
              { label: "Total RAM",        value: ramTotal !== "—" ? `${ramTotal} GB` : "—", ok: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-cyber-border/50 last:border-0">
                <span className="text-[12px] text-slate-400">{row.label}</span>
                <span className={`text-[12px] font-semibold font-mono ${row.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* nav shortcuts */}
          <div className="mt-4 pt-3 border-t border-cyber-border/50 space-y-1">
            {[
              { href: "/services",     label: "Services",      icon: <ServerCog size={11}      /> },
              { href: "/users",        label: "Users",         icon: <Users size={11}           /> },
              { href: "/sysmon",       label: "Sysmon Logs",   icon: <TerminalSquare size={11}  /> },
              { href: "/reports",      label: "Reports",       icon: <FileText size={11}        /> },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded text-slate-400 hover:text-cyber-accent hover:bg-cyber-surface/50 transition-all group"
              >
                <span className="flex items-center gap-2 group-hover:text-cyber-accent">
                  {item.icon}{item.label}
                </span>
                <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
