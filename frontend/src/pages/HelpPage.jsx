import React from 'react';
import { HelpCircle, ChevronDown, Sparkles, FileCheck, ShieldCheck } from 'lucide-react';

const HelpPage = () => {
  const faqs = [
    {
      q: "What is DocuMind AI?",
      a: "DocuMind AI is an AI-powered document intelligence platform designed specifically for Small and Medium Enterprises (SMEs). It automates the parsing, extraction, summarization, risk flagging, and query answering for invoices, receipts, purchase orders, quotations, and contracts."
    },
    {
      q: "What document file formats are supported?",
      a: "DocuMind AI supports PDF (digital & scanned), PNG, JPG, JPEG, and DOCX Microsoft Word files up to 20MB in size."
    },
    {
      q: "Is my data stored securely?",
      a: "Yes. All uploaded files and extracted structured fields are indexed safely in your local SQLite database inside the backend server."
    },
    {
      q: "How does OCR text extraction work?",
      a: "DocuMind AI uses PyMuPDF (fitz) for native digital PDF parsing, python-docx for Word files, and pytesseract visual OCR for scanned images."
    },
    {
      q: "How does AI answer questions in 'Ask Your Document'?",
      a: "The AI chat assistant uses strict context grounding. It reads only the extracted text from your document, answers your query directly, and provides exact source citations (e.g., 'Page 1, Total Section'). It is instructed never to invent missing data."
    },
    {
      q: "What happens if AI extraction confidence is low?",
      a: "If confidence falls below the configurable threshold (default 80%), the document status is automatically set to 'Needs Review' and flagged in the Alert Center."
    },
    {
      q: "Can I edit extracted information manually?",
      a: "Yes! Click the 'Edit' button on any field card under the Extracted Data tab. When you save a correction, the system updates the confidence score to 100% and logs your edit in the audit history."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Help & Documentation
          </h2>
          <p className="text-xs text-slate-400">Frequently Asked Questions and SME Operations Guide</p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <details key={idx} className="glass-card p-5 group cursor-pointer">
            <summary className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>{faq.q}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed font-normal">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
