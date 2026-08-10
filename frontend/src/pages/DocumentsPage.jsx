import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DocumentCard from '../components/DocumentCard';
import { Search, Filter, Plus, RefreshCw, FileText, Database } from 'lucide-react';
import { getDocuments, syncAllToGoogleSheets } from '../services/api';

const DocumentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [docType, setDocType] = useState('All');
  const [status, setStatus] = useState('All');
  const [confidence, setConfidence] = useState('All');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getDocuments({
        search,
        type: docType,
        status,
        confidence
      });
      setDocuments(res.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToSheets = async () => {
    let savedUrl = localStorage.getItem('documind_sheet_webhook') || '';
    const inputUrl = prompt("Enter your Google Sheets Web App URL (or leave blank if set in Settings):", savedUrl);
    
    if (inputUrl !== null) {
      const urlToUse = inputUrl.trim() || savedUrl;
      if (!urlToUse) {
        alert("Please provide a valid Google Sheet Web App URL or configure it in Settings.");
        return;
      }
      setSyncing(true);
      try {
        localStorage.setItem('documind_sheet_webhook', urlToUse);
        const res = await syncAllToGoogleSheets(urlToUse);
        alert(res.message || "Successfully synced documents to Google Sheet Database!");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to sync to Google Sheet. Make sure Webhook URL is deployed.");
      } finally {
        setSyncing(false);
      }
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [search, docType, status, confidence]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and review all uploaded business documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncToSheets}
            disabled={syncing}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            <span>{syncing ? 'Syncing...' : 'Sync to Google Sheet Database'}</span>
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Upload New Document
          </button>
        </div>
      </div>


      {/* FILTER & SEARCH CONTROL BAR (Prompt Requirement #24) */}
      <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor, invoice #, amount..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">Type: All</option>
            <option value="Invoice">Invoice</option>
            <option value="Receipt">Receipt</option>
            <option value="Purchase Order">Purchase Order</option>
            <option value="Quotation">Quotation</option>
            <option value="Contract">Contract</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">Status: All</option>
            <option value="Processed">Processed</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Confidence Filter */}
        <div>
          <select
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">Confidence: All</option>
            <option value="High">High (&ge;90%)</option>
            <option value="Medium">Medium (75-89%)</option>
            <option value="Low">Low (&lt;75%)</option>
          </select>
        </div>
      </div>

      {/* CATALOG GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading document catalog...</div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center glass-card space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">No matching documents found</h4>
          <p className="text-xs text-slate-400">Try adjusting your search query or filter settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
