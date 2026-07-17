import Link from 'next/link';
import { 
  LayoutDashboard, 
  Activity, 
  Network, 
  ShieldAlert, 
  FileSearch,
  Settings,
  ServerCog
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
    { name: 'Processes', icon: <Activity size={20} />, href: '/processes' },
    { name: 'Network', icon: <Network size={20} />, href: '/network' },
    { name: 'Services', icon: <ServerCog size={20} />, href: '/services' },
    { name: 'Users', icon: <ServerCog size={20} />, href: '/users' },
    { name: 'Security', icon: <ShieldAlert size={20} />, href: '/security' },
    { name: 'System', icon: <ServerCog size={20} />, href: '/system' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-cyber-dark border-r border-cyber-border text-slate-300 flex flex-col">
      <div className="p-6 border-b border-cyber-border">
        <h1 className="text-xl font-bold text-cyber-accent tracking-wider">VantEndpoint</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Security Monitor</p>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className="flex items-center px-6 py-3 hover:bg-slate-800 hover:text-cyber-accent transition-colors group"
              >
                <span className="text-slate-500 group-hover:text-cyber-accent transition-colors mr-4">
                  {item.icon}
                </span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-cyber-border text-xs text-slate-600 text-center">
        VantEndpoint v0.1.0
      </div>
    </aside>
  );
}
