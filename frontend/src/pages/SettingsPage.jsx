import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, User, Key, Sliders, Moon, Sun, Check, Database, RefreshCw, Copy } from 'lucide-react';
import { getGoogleScriptCode, saveWebhookUrl, syncAllToGoogleSheets } from '../services/api';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [provider, setProvider] = useState('demo');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [threshold, setThreshold] = useState(80);
  const [sheetWebhook, setSheetWebhook] = useState(localStorage.getItem('documind_sheet_webhook') || 'https://script.google.com/macros/s/AKfycby6IhctMGXxAFpqByQ1WbIJ9cPlf_40bPzgZcMQMpqGzilB16jCm4mrCqRtOOYFy-v7/exec');
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    getGoogleScriptCode().then((res) => {
      if (res.webhook_url && !sheetWebhook) {
        setSheetWebhook(res.webhook_url);
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      if (sheetWebhook) {
        localStorage.setItem('documind_sheet_webhook', sheetWebhook);
        await saveWebhookUrl(sheetWebhook);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save config error:", err);
    }
  };

  const handleSyncDatabase = async () => {
    if (!sheetWebhook.trim()) {
      setSyncStatus({ success: false, message: 'Please enter your Google Sheet Web App URL first.' });
      return;
    }
    setSyncing(true);
    setSyncStatus(null);
    try {
      localStorage.setItem('documind_sheet_webhook', sheetWebhook);
      const res = await syncAllToGoogleSheets(sheetWebhook);
      setSyncStatus({ success: true, message: res.message || 'Database successfully synced to Google Sheet!' });
    } catch (err) {
      setSyncStatus({ 
        success: false, 
        message: err.response?.data?.message || 'Failed to sync database to Google Sheet. Check URL or deploy Apps Script.' 
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System Settings & AI Configuration
          </h2>
          <p className="text-xs text-slate-400">Configure AI models, extraction threshold, and database connections</p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> Configuration saved successfully.
        </div>
      )}

      {/* Profile Settings */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <User className="w-4 h-4 text-brand-500" /> Organization Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">User Name</label>
            <input
              type="text"
              value={user?.name || 'SME Business Admin'}
              disabled
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Email</label>
            <input
              type="email"
              value={user?.email || 'admin@sme-enterprise.com'}
              disabled
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* AI Provider Config */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Key className="w-4 h-4 text-indigo-500" /> AI Provider & Engine
        </h3>
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">AI Service Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
            >
              <option value="demo">Demo AI Mode (Intelligent Built-in Fallback — No API Key Required)</option>
              <option value="gemini">Google Gemini API</option>
              <option value="openai">OpenAI GPT-4o API</option>
            </select>
          </div>

          {provider !== 'demo' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AI_API_KEY_HERE"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Model Name</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-semibold">Human Review Confidence Threshold ({threshold}%)</label>
              <span className="text-brand-500 font-bold">{threshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md"
          >
            Save Preferences
          </button>
        </form>
      </div>

      {/* Google Sheets Database Setup */}
      <div className="glass-card p-6 space-y-4 border-l-4 border-l-emerald-500">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Database className="w-4 h-4 text-emerald-500" />
          Google Sheets Database Integration
        </h3>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3">
          <p className="leading-relaxed">
            Connect DocuMind AI directly to your Google Sheet (such as <b>DocuMind AI Database</b>) so every uploaded document automatically creates a structured database row!
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">How to connect your Google Sheet Database:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>Open your Google Sheet (e.g. <b>DocuMind AI Database</b>).</li>
              <li>Click <b>Extensions &rarr; Apps Script</b>.</li>
              <li>Delete any default code, paste the <b>DocuMind Webhook Code</b> (copied below), and click <b>Save</b>.</li>
              <li>Click <b>Deploy &rarr; New deployment</b> &rarr; Type: <b>Web app</b> &rarr; Access: <i>Anyone</i>.</li>
              <li>Copy the generated <b>Web App URL</b> and paste it in the field below.</li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await getGoogleScriptCode();
                  await navigator.clipboard.writeText(res.code);
                  alert("Google Apps Script Webhook code copied to clipboard! Paste it inside Google Sheets -> Extensions -> Apps Script");
                } catch (e) {
                  alert("Error fetching Google Script code.");
                }
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Google Apps Script Webhook Code
            </button>

            <button
              type="button"
              onClick={handleSyncDatabase}
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing Database...' : 'Sync All Documents to Google Sheet Database'}
            </button>
          </div>

          {syncStatus && (
            <div className={`p-3.5 rounded-xl border text-xs font-semibold ${
              syncStatus.success 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}>
              {syncStatus.message}
            </div>
          )}

          <div className="pt-2">
            <label className="block text-slate-400 font-semibold mb-1">Google Sheet Web App / Webhook URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sheetWebhook}
                onChange={(e) => setSheetWebhook(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs flex-shrink-0"
              >
                Save URL
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Appearance */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Theme & Appearance</h4>
          <p className="text-xs text-slate-400">Toggle between Light and Dark SaaS Mode</p>
        </div>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
