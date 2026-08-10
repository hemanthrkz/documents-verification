import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  UploadCloud, 
  Brain, 
  FileSearch, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  MessageSquareText, 
  Download, 
  UserCheck, 
  FileText, 
  Layers
} from 'lucide-react';
import { seedDemoDocuments } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleTryDemo = async () => {
    try {
      await seedDemoDocuments();
    } catch (e) {
      console.log("Demo seed notice:", e);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-brand-600/20 to-indigo-600/20 blur-[140px] pointer-events-none rounded-full"></div>

      {/* Header / Nav */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight font-sans text-white">
            DocuMind <span className="text-brand-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </button>
          <button
            onClick={handleTryDemo}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white font-semibold text-sm shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            Try Demo Mode
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold tracking-wide uppercase mb-8">
          <Zap className="w-4 h-4 text-emerald-400" />
          Enterprise SME Document Intelligence Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans leading-[1.15] mb-6">
          Turn business documents into <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400">
            actionable intelligence.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          Upload invoices, receipts, contracts, and purchase orders. Let AI extract structured information, 
          summarize content, detect critical risk flags, and answer complex questions instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-xl shadow-brand-600/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            Upload Business Document <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleTryDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-brand-400" /> Explore Interactive Demo
          </button>
        </div>

        {/* Dashboard Visual Mockup Preview */}
        <div className="relative mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-10 bg-slate-950/80 border-b border-slate-800 px-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="text-xs text-slate-500 font-mono ml-2">app.documind.ai/dashboard</span>
          </div>

          <div className="pt-10 grid grid-cols-1 md:grid-cols-4 gap-4 text-left p-2">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-400">Total Documents</div>
              <div className="text-2xl font-bold text-white mt-1">24</div>
              <div className="text-[11px] text-emerald-400 mt-1">100% Processed</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-400">Total Invoice Value</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">₹1,28,500</div>
              <div className="text-[11px] text-slate-400 mt-1">GST: ₹18,920</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-400">Pending Review</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">3</div>
              <div className="text-[11px] text-amber-400/80 mt-1">Action required</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-xs text-slate-400">Active Alerts</div>
              <div className="text-2xl font-bold text-rose-400 mt-1">3</div>
              <div className="text-[11px] text-rose-400/80 mt-1">High priority</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Workflow</h2>
          <h3 className="text-3xl font-bold text-white">How DocuMind AI Transforms SME Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {[
            { step: '01', title: 'Upload', desc: 'PDF, DOCX, PNG, JPG business files', icon: UploadCloud },
            { step: '02', title: 'Extract', desc: 'OCR visual parsing & text extraction', icon: FileSearch },
            { step: '03', title: 'Understand', desc: 'AI classification & field mapping', icon: Brain },
            { step: '04', title: 'Analyze', desc: 'Risk detection, alerts & summaries', icon: ShieldCheck },
            { step: '05', title: 'Act', desc: 'Ask questions, export CSV/JSON/PDF', icon: Zap }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 transition-all text-center relative group">
                <div className="text-xs font-mono font-bold text-brand-400 mb-3">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">Capabilities</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">Enterprise Features for SMEs</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'AI Field Extraction', desc: 'Automatically extracts vendors, invoice numbers, amounts, GST, payment due dates, and line items.', icon: Brain },
            { title: 'OCR Visual Engine', desc: 'Parses digital PDFs, Word documents, scanned files, and receipt images with high precision.', icon: FileSearch },
            { title: 'Smart Summaries', desc: 'Generates executive summaries, key financial takeaways, and actionable next steps.', icon: FileText },
            { title: 'Ask Your Document', desc: 'Context-aware AI Chatbot answers questions directly from document text with source citations.', icon: MessageSquareText },
            { title: 'Risk & Issue Alerts', desc: 'Detects payment deadlines, missing GSTIN, low confidence scores, and auto-renewal clauses.', icon: ShieldCheck },
            { title: 'Human-in-the-Loop', desc: 'Edit and correct extracted field values anytime. System updates confidence scores to 100%.', icon: UserCheck },
            { title: 'Analytics & Insights', desc: 'Visual charts for vendor spending, document types, monthly volume, and GST breakdowns.', icon: BarChart3 },
            { title: 'Multi-Format Export', desc: 'Export structured document intelligence to CSV, JSON, or generated PDF summary reports.', icon: Download },
            { title: 'Demo AI Mode', desc: 'Runs 100% offline with intelligent rule-based parsing even without external API keys.', icon: Sparkles }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-brand-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-lg text-white mb-2">{f.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SUPPORTED DOCUMENTS */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-3">Supported Document Types</h3>
          <p className="text-slate-400 text-sm">DocuMind AI automatically classifies and processes all business paperwork</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
          {['Invoice', 'Receipt', 'Purchase Order', 'Quotation', 'Contract', 'General Doc'].map((t, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-2">
              <FileText className="w-6 h-6 text-brand-400" />
              <span className="text-xs font-semibold text-slate-200">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-brand-900 to-indigo-950 border border-brand-500/30 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl font-extrabold text-white mb-4">Start analyzing your business documents today</h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm mb-8">
            Don't just store documents. Understand them. Try the working Demo Mode in 10 seconds.
          </p>
          <button
            onClick={handleTryDemo}
            className="px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-base shadow-xl shadow-brand-500/30 transition-all inline-flex items-center gap-2"
          >
            Launch DocuMind AI <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 DocuMind AI. Enterprise SME Document Intelligence Platform.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
