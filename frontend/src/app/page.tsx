export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-100">Endpoint Dashboard</h2>
        <p className="text-slate-400">System posture and real-time activity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder metric cards */}
        <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 flex flex-col">
          <span className="text-sm font-medium text-slate-400">Risk Score</span>
          <span className="text-3xl font-bold text-emerald-400 mt-2">Low</span>
        </div>
        <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 flex flex-col">
          <span className="text-sm font-medium text-slate-400">Running Processes</span>
          <span className="text-3xl font-bold text-slate-100 mt-2">142</span>
        </div>
        <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 flex flex-col">
          <span className="text-sm font-medium text-slate-400">Active Connections</span>
          <span className="text-3xl font-bold text-slate-100 mt-2">28</span>
        </div>
        <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 flex flex-col">
          <span className="text-sm font-medium text-slate-400">Suspicious Events</span>
          <span className="text-3xl font-bold text-amber-500 mt-2">0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder for Charts / Modules */}
        <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 min-h-64">
          <h3 className="text-lg font-medium mb-4">Resource Utilization</h3>
          <div className="flex items-center justify-center h-48 text-slate-600 border border-dashed border-slate-700 rounded">
            Chart Placeholder
          </div>
        </div>
        
        <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 min-h-64">
          <h3 className="text-lg font-medium mb-4">Recent Alerts</h3>
          <div className="flex items-center justify-center h-48 text-slate-600 border border-dashed border-slate-700 rounded">
            No recent alerts
          </div>
        </div>
      </div>
    </div>
  );
}
