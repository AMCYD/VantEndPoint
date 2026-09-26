"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Activity, 
  Network, 
  ShieldAlert, 
  FileText,
  Settings,
  ServerCog,
  Users,
  Cpu,
  Flame,
  Key,
  TerminalSquare
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/' },
    { name: 'Processes', icon: <Activity size={18} />, href: '/processes' },
    { name: 'Network', icon: <Network size={18} />, href: '/network' },
    { name: 'Services', icon: <ServerCog size={18} />, href: '/services' },
    { name: 'Persistence', icon: <Key size={18} />, href: '/persistence' },
    { name: 'Sysmon Logs', icon: <TerminalSquare size={18} />, href: '/sysmon' },
    { name: 'Users', icon: <Users size={18} />, href: '/users' },
    { name: 'Security Analysis', icon: <ShieldAlert size={18} />, href: '/security' },
    { name: 'Threat Intel', icon: <Flame size={18} />, href: '/threat-intel' },
    { name: 'Reports', icon: <FileText size={18} />, href: '/reports' },
    { name: 'System Hardware', icon: <Cpu size={18} />, href: '/system' },
    { name: 'Settings', icon: <Settings size={18} />, href: '/settings' },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-cyber-dark border-r border-cyber-border text-slate-300 flex flex-col z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-cyber-border flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-cyber-surface border border-cyber-accent/30 flex items-center justify-center shadow-lg shadow-cyan-950/40">
          <ShieldAlert className="text-cyber-accent" size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 tracking-wider flex items-center gap-1.5">
            VantEndpoint
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">EDR & Threat Forensics</p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto px-3 space-y-1">
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Investigation Modules
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                isActive 
                  ? 'bg-cyber-surface text-cyber-accent border-l-2 border-cyber-accent shadow-sm' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-cyber-surface/50'
              }`}
            >
              <span className={`mr-3 transition-colors ${isActive ? 'text-cyber-accent' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Endpoint Status Footer */}
      <div className="p-3 border-t border-cyber-border bg-cyber-surface/40 text-xs">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400">Agent Status</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            ACTIVE
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Sysmon: ENABLED</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
