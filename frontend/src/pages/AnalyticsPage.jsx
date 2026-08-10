import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  LineChart, Line 
} from 'recharts';
import { BarChart3, IndianRupee, PieChart as PieIcon, TrendingUp, ShieldCheck } from 'lucide-react';
import { getAnalytics } from '../services/api';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Loading visual analytics...</div>;
  }

  const summary = data?.summary || {};
  const byType = data?.by_type || [];
  const byStatus = data?.by_status || [];
  const topVendors = data?.top_vendors || [];
  const timeSeries = data?.time_series || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          SME Financial & Document Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Visual metrics and intelligence trends compiled from processed paperwork
        </p>
      </div>

      {/* FINANCIAL INSIGHTS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total Invoice Value</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{(summary.total_invoice_value ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium mt-1">Across verified invoices</div>
        </div>

        <div className="glass-card p-5">
          <div className="text-xs font-semibold text-slate-400 mb-1">Total GST / Tax Credit</div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            ₹{(summary.total_gst_value ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-indigo-500 font-medium mt-1">Input tax credit eligible</div>
        </div>

        <div className="glass-card p-5">
          <div className="text-xs font-semibold text-slate-400 mb-1">Average Invoice Value</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ₹{(summary.avg_invoice_value ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Per document average</div>
        </div>

        <div className="glass-card p-5">
          <div className="text-xs font-semibold text-slate-400 mb-1">Upcoming Payments</div>
          <div className="text-2xl font-extrabold text-amber-500">
            ₹{(summary.total_invoice_value ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-500 font-medium mt-1">Due within 15 days</div>
        </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Documents by Type (Donut Chart) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <PieIcon className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Documents by Type</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Documents Processed Over Time (Line Chart) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Processing Volume Over Time</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="processed" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Top Vendor Spending (Bar Chart) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Top Vendor Spending (₹)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVendors}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="vendor" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Processing Status Breakdown */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Processing Status Breakdown</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {byStatus.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
