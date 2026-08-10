import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { 
  FileText, 
  Sparkles, 
  Edit3, 
  Check, 
  Send, 
  Download, 
  Copy, 
  Clock, 
  ShieldAlert, 
  Bot, 
  Building2, 
  Calendar, 
  IndianRupee, 
  ArrowLeft,
  RefreshCw,
  FileCode,
  ListFilter
} from 'lucide-react';
import { 
  getDocumentDetails, 
  updateExtractedField, 
  postDocumentChat, 
  exportDocumentUrl,
  syncToGoogleSheets
} from '../services/api';

const DocumentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docData, setDocData] = useState(null);
  const [extractedFields, setExtractedFields] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  // Human Edit State
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // AI Chat Input
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await getDocumentDetails(id);
      setDocData(res.document);
      setExtractedFields(res.extracted_fields || []);
      setAlerts(res.alerts || []);
      setActivities(res.activities || []);
      setChatMessages(res.chat_messages || []);
    } catch (err) {
      console.error("Error fetching document details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStartEdit = (field) => {
    setEditingFieldId(field.id);
    setEditingValue(field.field_value || '');
  };

  const handleSaveEdit = async (fieldId) => {
    try {
      const res = await updateExtractedField(id, fieldId, editingValue);
      setEditingFieldId(null);
      fetchDetails();
    } catch (err) {
      console.error("Field update error:", err);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const query = chatInput;
    setChatInput('');
    setChatLoading(true);

    try {
      await postDocumentChat(id, query);
      const updatedDetails = await getDocumentDetails(id);
      setChatMessages(updatedDetails.chat_messages || []);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyText = () => {
    if (docData?.raw_text) {
      navigator.clipboard.writeText(docData.raw_text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Loading document details...</div>;
  }

  if (!docData) {
    return (
      <div className="p-12 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Document Not Found</h3>
        <button
          onClick={() => navigate('/documents')}
          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          Back to Documents Catalog
        </button>
      </div>
    );
  }

  const tabs = [
    'Overview',
    'Extracted Data',
    'AI Summary',
    'Ask AI',
    'Raw Text',
    'Insights & Alerts',
    'Activity History'
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {docData.filename}
              </h2>
              <StatusBadge status={docData.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              ID #{docData.id} • Processed on {docData.processed_at ? docData.processed_at.substring(0, 10) : 'Today'}
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              let savedUrl = localStorage.getItem('documind_sheet_webhook') || '';
              const url = prompt("Enter your Google Sheets Webhook URL (or leave blank if saved in Settings):", savedUrl);
              if (url !== null) {
                const urlToUse = url.trim() || savedUrl;
                try {
                  if (urlToUse) localStorage.setItem('documind_sheet_webhook', urlToUse);
                  const res = await syncToGoogleSheets(docData.id, urlToUse);
                  alert(res.message || "Synced to Google Sheet!");
                  fetchDetails();
                } catch (err) {
                  alert(err.response?.data?.message || "Failed to sync to Google Sheet. Please check Webhook URL.");
                }
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Sync to Google Sheet
          </button>
          <a
            href={exportDocumentUrl(docData.id, 'pdf')}
            download
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" /> PDF Report
          </a>
          <a
            href={exportDocumentUrl(docData.id, 'csv')}
            download
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            CSV
          </a>
          <a
            href={exportDocumentUrl(docData.id, 'json')}
            download
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            JSON
          </a>
        </div>
      </div>

      {/* DETAILED TAB NAVIGATION */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto gap-2 pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
              activeTab === tab
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab === 'Ask AI' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Key Insights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <IndianRupee className="w-4 h-4 text-emerald-500" /> Total Amount
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {docData.total_amount ? `${docData.currency || '₹'} ${Number(docData.total_amount).toLocaleString('en-IN')}` : 'N/A'}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Payment Due Date
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {docData.due_date || 'N/A'}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Building2 className="w-4 h-4 text-brand-500" /> Vendor / Issuer
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                {docData.vendor_name || 'N/A'}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400">Extraction Confidence</span>
                <ConfidenceBadge confidence={docData.confidence} />
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {docData.confidence >= 90 ? 'High Precision AI Parsing' : 'Manual Review Recommended'}
              </div>
            </div>
          </div>

          {/* AI Executive Summary Card */}
          <div className="glass-card p-6 border-l-4 border-l-brand-500">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Executive Summary</h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              {docData.summary || 'Summary generated automatically based on parsed document structure.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: EXTRACTED DATA & HUMAN-IN-THE-LOOP EDITING */}
      {activeTab === 'Extracted Data' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              AI extracted structured values. Click <span className="font-bold text-brand-500">Edit</span> to correct any field value manually.
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Human-in-the-Loop Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extractedFields.map((field) => (
              <div key={field.id} className="glass-card p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{field.field_name}</span>
                    <ConfidenceBadge confidence={field.confidence} />
                  </div>

                  {editingFieldId === field.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-brand-500 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(field.id)}
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        title="Save Correction"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="text-base font-bold text-slate-900 dark:text-white font-sans">
                        {field.field_value || '—'}
                      </div>
                      <button
                        onClick={() => handleStartEdit(field)}
                        className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>

                {field.is_edited && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-500 font-mono">
                    Edited by user (Original: {field.original_value})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: AI SUMMARY */}
      {activeTab === 'AI Summary' && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Detailed AI Summary</h3>
              <p className="text-xs text-slate-400">Structured analysis generated by DocuMind AI</p>
            </div>
            <button
              onClick={fetchDetails}
              className="px-3.5 py-2 rounded-xl bg-brand-500/10 text-brand-500 text-xs font-bold hover:bg-brand-500/20 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate Summary
            </button>
          </div>

          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-500 mb-2">Primary Overview</h4>
              <p>{docData.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Key Financial Attributes</h4>
                <ul className="space-y-1.5 text-xs">
                  <li><b>Total Value:</b> {docData.currency || '₹'} {docData.total_amount ? Number(docData.total_amount).toLocaleString('en-IN') : 'N/A'}</li>
                  <li><b>Tax Amount:</b> {docData.currency || '₹'} {docData.tax_amount ? Number(docData.tax_amount).toLocaleString('en-IN') : 'N/A'}</li>
                  <li><b>Subtotal:</b> {docData.currency || '₹'} {docData.subtotal ? Number(docData.subtotal).toLocaleString('en-IN') : 'N/A'}</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Actionable Next Steps</h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
                  <li>Verify vendor bank details prior to disbursement</li>
                  <li>Schedule payment before due date ({docData.due_date || 'Standard terms'})</li>
                  <li>Archive copy in tax compliance catalog</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ASK YOUR DOCUMENT (AI CHATBOT) */}
      {activeTab === 'Ask AI' && (
        <div className="glass-card p-6 space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Ask Your Document</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Strict Context Grounding Enabled</span>
          </div>

          {/* Sample One-Click Questions (Prompt Requirement #21) */}
          <div className="flex flex-wrap gap-2">
            {[
              "What is the total amount?",
              "Who is the vendor?",
              "When is payment due?",
              "What is the GST amount?",
              "Summarize this document"
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(q)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500/10 hover:text-brand-500 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[80%] space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white font-medium rounded-br-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed">{msg.message}</p>
                  
                  {/* Source References (Prompt Requirement #22) */}
                  {msg.source_reference && msg.role === 'assistant' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                      Source: {msg.source_reference}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a custom question about this document..."
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              {chatLoading ? 'Thinking...' : 'Ask AI'} <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 5: RAW TEXT */}
      {activeTab === 'Raw Text' && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Extracted Document Text (OCR Output)</h3>
              <p className="text-xs text-slate-400">Raw characters parsed directly from file layer</p>
            </div>
            <button
              onClick={handleCopyText}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> {copySuccess ? 'Copied!' : 'Copy Text'}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[400px]">
            {docData.raw_text || 'No raw text extracted.'}
          </pre>
        </div>
      )}

      {/* TAB CONTENT 6: INSIGHTS & ALERTS */}
      {activeTab === 'Insights & Alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="p-8 text-center glass-card">
              <p className="text-xs text-slate-400">No critical risk alerts flagged for this document.</p>
            </div>
          ) : (
            alerts.map((a) => (
              <div key={a.id} className="glass-card p-5 border-l-4 border-l-rose-500 flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">
                      {a.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{a.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT 7: ACTIVITY HISTORY */}
      {activeTab === 'Activity History' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            Audit Trail & Document History
          </h3>
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{act.action}</div>
                  <div className="text-[11px] text-slate-400">{act.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailsPage;
