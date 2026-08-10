import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, Search, Sparkles, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ searchQuery, setSearchQuery, alertCount = 3 }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/documents?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          placeholder="Search documents, vendor name, invoice #, text..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo AI Mode</span>
          </div>
        )}

        {/* Alerts Bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="View Alerts"
        >
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0) : 'S'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.name || 'SME Business Admin'}
            </div>
            <div className="text-[11px] text-slate-400">Enterprise SME</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
