"use client";
import { ShieldAlert, AlertTriangle, Bug, Activity } from 'lucide-react';

export default function SecurityPage() {
  const securityEvents = [
    { id: 1, type: 'Suspicious Process', process: 'powershell.exe', details: 'Encoded command detected', severity: 'High', time: '10:45 AM' },
    { id: 2, type: 'Network Anomaly', process: 'svchost.exe', details: 'Connection to known malicious IP', severity: 'Critical', time: '09:12 AM' },
    { id: 3, type: 'Privilege Escalation', process: 'unknown.exe', details: 'Attempted to access LSASS', severity: 'Critical', time: '08:30 AM' },
    { id: 4, type: 'Unsigned Executable', process: 'setup_v2.exe', details: 'Running from Temp directory', severity: 'Medium', time: 'Yesterday' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center">
          <ShieldAlert className="mr-3 text-cyber-accent" /> Security Dashboard
        </h2>
        <p className="text-slate-400">Endpoint threat analysis and risk scoring.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 flex flex-col items-center justify-center">
          <h3 className="text-slate-400 mb-2">Overall Risk Score</h3>
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-amber-500 text-amber-500 text-4xl font-bold">
            78
          </div>
          <p className="mt-4 text-amber-500 font-medium">Elevated Risk</p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 flex items-start space-x-4">
            <AlertTriangle className="text-amber-500 mt-1" size={24} />
            <div>
              <h4 className="text-slate-200 font-medium text-lg">Active Threats</h4>
              <p className="text-3xl font-bold text-amber-500 mt-1">2</p>
              <p className="text-slate-500 text-sm mt-1">Require immediate attention</p>
            </div>
          </div>
          <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 flex items-start space-x-4">
            <Bug className="text-red-500 mt-1" size={24} />
            <div>
              <h4 className="text-slate-200 font-medium text-lg">Malware Detections</h4>
              <p className="text-3xl font-bold text-red-500 mt-1">0</p>
              <p className="text-slate-500 text-sm mt-1">No known signatures matched</p>
            </div>
          </div>
          <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 flex items-start space-x-4 col-span-2">
             <Activity className="text-cyber-accent mt-1" size={24} />
             <div>
               <h4 className="text-slate-200 font-medium text-lg">MITRE ATT&CK Coverage</h4>
               <p className="text-slate-400 text-sm mt-2">
                 Execution: <span className="text-amber-500">Detected (T1059)</span><br/>
                 Credential Access: <span className="text-red-500">Detected (T1003)</span><br/>
                 Defense Evasion: <span className="text-slate-500">Clear</span>
               </p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-200 mb-4">Recent Security Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Process</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {securityEvents.map(event => (
                <tr key={event.id} className="border-b border-cyber-border/50 hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      event.severity === 'High' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{event.time}</td>
                  <td className="py-3 px-4 text-slate-200">{event.type}</td>
                  <td className="py-3 px-4 text-cyber-accent font-mono text-sm">{event.process}</td>
                  <td className="py-3 px-4 text-slate-400">{event.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
