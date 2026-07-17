"use client";
import { useEffect, useState } from 'react';
import { InvestigationService } from '@/services/api';

export default function SystemPage() {
  const [sysInfo, setSysInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    InvestigationService.getSystemInfo()
      .then(data => {
        setSysInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching system info:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-100">System Information</h2>
        <p className="text-slate-400">Hardware and operating system details.</p>
      </header>

      {loading ? (
        <div className="text-slate-400">Loading system information...</div>
      ) : sysInfo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-300 mb-4">CPU Configuration</h3>
            <p className="text-slate-400">Logical Cores: <span className="text-slate-100 font-mono">{sysInfo.cpu_count}</span></p>
            <p className="text-slate-400">Current Usage: <span className="text-cyber-accent font-mono">{sysInfo.cpu_percent}%</span></p>
          </div>

          <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-300 mb-4">Memory Configuration</h3>
            <p className="text-slate-400">Total Memory: <span className="text-slate-100 font-mono">{(sysInfo.virtual_memory?.total / (1024 ** 3)).toFixed(2)} GB</span></p>
            <p className="text-slate-400">Memory Used: <span className="text-cyber-accent font-mono">{sysInfo.virtual_memory?.percent}%</span></p>
          </div>
          
          <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-300 mb-4">Disk Usage (Root)</h3>
            <p className="text-slate-400">Total Disk: <span className="text-slate-100 font-mono">{(sysInfo.disk_usage?.total / (1024 ** 3)).toFixed(2)} GB</span></p>
            <p className="text-slate-400">Disk Used: <span className="text-cyber-accent font-mono">{sysInfo.disk_usage?.percent}%</span></p>
          </div>
        </div>
      ) : (
        <div className="text-red-400">Failed to load system information.</div>
      )}
    </div>
  );
}
