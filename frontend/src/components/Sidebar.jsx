import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  Bot, 
  BarChart3, 
  Bell, 
  Settings, 
  HelpCircle, 
  Sparkles,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Upload Document', path: '/upload', icon: UploadCloud, highlight: true },
    { name: 'AI Assistant', path: '/assistant', icon: Bot },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Alert Center', path: '/alerts', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & FAQ', path: '/help', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-screen sticky top-0 transition-colors duration-200 z-40">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold font-sans text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              DocuMind <span className="text-brand-500">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">SME Intelligence</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-semibold'
                    : item.highlight
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'opacity-80'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Enterprise Status Banner */}
      <div className="p-4 m-4 rounded-xl bg-gradient-to-br from-slate-900 to-brand-950 text-white border border-brand-500/30 shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-brand-500/20 rounded-full blur-xl"></div>
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wider text-emerald-300 uppercase">Enterprise SME Engine</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-2">
          Intelligent Document Intelligence & Field Extraction.
        </p>
        <div className="text-[10px] text-slate-400 font-mono bg-slate-950/60 px-2 py-1 rounded">
          Status: Ready for Uploads
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
