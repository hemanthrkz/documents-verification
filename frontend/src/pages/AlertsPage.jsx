import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShieldAlert, CheckCircle2, Eye, Filter, Sparkles } from 'lucide-react';
import { getAlerts, markAlertRead, resolveAlert } from '../services/api';

const AlertsPage = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchAlertData = async () => {
    setLoading(true);
    try {
      const res = await getAlerts(statusFilter);
      setAlerts(res.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertData();
  }, [statusFilter]);

  const handleMarkRead = async (id) => {
    await markAlertRead(id);
    fetchAlertData();
  };

  const handleResolve = async (id) => {
    await resolveAlert(id);
    fetchAlertData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Alert & Triage Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Detect important deadlines, missing information, and contract renewal clauses
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {['all', 'active', 'read', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ALERT LIST */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center glass-card space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">No active alerts</h4>
          <p className="text-xs text-slate-400">All business documents are clean and verified.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const isHigh = a.severity === 'high';
            return (
              <div
                key={a.id}
                className={`glass-card p-5 border-l-4 transition-all ${
                  isHigh ? 'border-l-rose-500' : 'border-l-amber-500'
                } ${a.status === 'resolved' ? 'opacity-50' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isHigh ? 'text-rose-500' : 'text-amber-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {a.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isHigh
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {a.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {a.document_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {a.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {a.document_id && (
                      <button
                        onClick={() => navigate(`/documents/${a.document_id}`)}
                        className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Open Document
                      </button>
                    )}
                    {a.status === 'active' && (
                      <button
                        onClick={() => handleMarkRead(a.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Mark Read
                      </button>
                    )}
                    {a.status !== 'resolved' && (
                      <button
                        onClick={() => handleResolve(a.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
