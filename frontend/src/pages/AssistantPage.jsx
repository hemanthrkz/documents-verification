import React, { useState } from 'react';
import { Bot, Send, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssistantPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am DocuMind AI. You can query across all your SME business documents. How can I assist you today?',
      source: 'DocuMind Intelligence Core'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "What is our total pending invoice amount?",
    "Which contracts have auto-renewal clauses?",
    "Show me invoices due in August 2026",
    "Summarize vendor spending for ABC Suppliers"
  ];

  const handleSend = (queryText) => {
    const query = queryText || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let aiResponse = "";
      let sourceRef = "";

      const q = query.toLowerCase();
      if (q.includes("pending") || q.includes("total invoice")) {
        aiResponse = "Across your uploaded document catalog, total pending invoice value is ₹1,28,500 across 3 active invoices, with ₹18,920 total GST.";
        sourceRef = "Aggregated Invoice Intelligence | 3 Files";
      } else if (q.includes("renewal") || q.includes("contract")) {
        aiResponse = "Contract CNT-2026-99 with Global Software Solutions Ltd contains an automatic 1-year renewal clause requiring 60-day written cancellation notice before 31-Jul-2027.";
        sourceRef = "Master_Vendor_Service_Contract.docx (Page 1)";
      } else if (q.includes("august") || q.includes("due")) {
        aiResponse = "Invoice INV-1025 for ₹48,500 from ABC Suppliers Pvt Ltd is due on 25-Aug-2026. Purchase Order PO-9041 delivery is scheduled for 18-Aug-2026.";
        sourceRef = "ABC_Suppliers_Invoice_INV1025.pdf";
      } else if (q.includes("abc suppliers") || q.includes("vendor")) {
        aiResponse = "ABC Suppliers Pvt Ltd is your top hardware vendor with total billing of ₹48,500 for Arduino boards and temperature sensors.";
        sourceRef = "Vendor Database & Invoices";
      } else {
        aiResponse = `Based on your SME business document catalog, "${query}" pertains to verified transactions from ABC Suppliers and QuickMart Retail. All amounts are cataloged in your SQLite database.`;
        sourceRef = "Cross-Document Context Search";
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: aiResponse, source: sourceRef }]);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cross-Document AI Assistant
          </h2>
          <p className="text-xs text-slate-400">
            Query insights across your entire document repository simultaneously
          </p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="p-3 rounded-xl glass-card text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all flex items-center justify-between group"
          >
            <span>{q}</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-500 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      {/* Main Chat Stream */}
      <div className="glass-card p-6 flex flex-col justify-between min-h-[450px]">
        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-4 rounded-2xl max-w-[80%] space-y-2 ${
                  m.role === 'user'
                    ? 'bg-brand-600 text-white font-medium rounded-br-none shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="leading-relaxed text-sm">{m.text}</p>
                {m.source && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono">
                    Source: {m.source}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question across all your business documents..."
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md flex items-center gap-2"
          >
            {loading ? 'Analyzing...' : 'Ask AI'} <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage;
