import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Bell, 
  IndianRupee, 
  UploadCloud, 
  RefreshCw, 
  Sparkles, 
  ArrowRight,
  Plus,
  Eye,
  Trash2
} from 'lucide-react';
import { getAnalytics, getDocuments, seedDemoDocuments, deleteDocument, clearAllDocuments } from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anaData, docsData] = await Promise.all([
        getAnalytics(),
        getDocuments()
      ]);
      setAnalytics(anaData.summary);
      setDocuments(docsData.documents || []);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all documents and start with a clean page?")) {
      try {
        await clearAllDocuments();
        await fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSeedDemo = async () => {
    try {
      await seedDemoDocuments();
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this document?")) {
      await deleteDocument(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-900/90 to-indigo-900/90 p-6 rounded-2xl border border-brand-500/20 shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-brand-500/30 border border-brand-400/40 text-brand-200">
              Platform Overview
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">SME Document Intelligence Dashboard</h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time status of invoices, receipts, purchase orders, and legal contracts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearAll}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold text-xs border border-rose-500/30 transition-all flex items-center gap-2"
            title="Clear all stored documents"
          >
            <Trash2 className="w-4 h-4 text-rose-400" /> Clear All Data
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* DASHBOARD METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Docs */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Documents</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.total_documents ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">100%</span> cataloged in SQLite
          </div>
        </div>

        {/* Card 2: Processed */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Processed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.processed_documents ?? 0}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium mt-1">High confidence extraction</div>
        </div>

        {/* Card 3: Pending Review */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.pending_review ?? 0}
          </div>
          <div className="text-[11px] text-amber-500 font-medium mt-1">Human-in-the-loop review</div>
        </div>

        {/* Card 4: Important Alerts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Important Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {analytics?.active_alerts ?? 0}
          </div>
          <div className="text-[11px] text-rose-500 font-medium mt-1">Action required</div>
        </div>

        {/* Card 5: Total Invoice Value */}
        <div className="glass-card p-5 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-850">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Invoice Value</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{(analytics?.total_invoice_value ?? 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            GST: ₹{(analytics?.total_gst_value ?? 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* RECENT DOCUMENTS TABLE */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Documents</h3>
            <p className="text-xs text-slate-400">Processed paperwork across all SME departments</p>
          </div>
          <button
            onClick={() => navigate('/documents')}
            className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1"
          >
            View All Documents <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading documents...</div>
        ) : documents.length === 0 ? (
          /* EMPTY STATE (Prompt Requirement #34) */
          <div className="p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">📄 No documents yet</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your first business document and let DocuMind AI analyze it automatically.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-5">Document</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Vendor</th>
                  <th className="py-3 px-5">Date / Due</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Confidence</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {documents.slice(0, 6).map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{doc.filename}</span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-600 dark:text-slate-300">
                      {doc.document_type}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-medium">
                      {doc.vendor_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {doc.due_date ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Due: {doc.due_date}</span>
                      ) : (
                        doc.document_date || 'N/A'
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                      {doc.total_amount ? `${doc.currency || '₹'} ${Number(doc.total_amount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3.5 px-5">
                      <ConfidenceBadge confidence={doc.confidence} />
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/documents/${doc.id}`); }}
                        className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
