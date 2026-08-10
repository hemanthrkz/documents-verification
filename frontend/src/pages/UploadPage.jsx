import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProcessingModal from '../components/ProcessingModal';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, X, File } from 'lucide-react';
import { uploadDocument } from '../services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('Invoice');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newDocId, setNewDocId] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMsg('');
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['pdf', 'png', 'jpg', 'jpeg', 'docx'];
    if (!validExts.includes(ext)) {
      setErrorMsg(`Unsupported file type (.${ext}). Please upload a PDF, PNG, JPG, or DOCX document.`);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File exceeds maximum size limit of 20MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleStartProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_type', documentType);

    try {
      const res = await uploadDocument(formData);
      setNewDocId(res.document.id);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg(err.response?.data?.error || 'Document processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleModalComplete = () => {
    setIsProcessing(false);
    if (newDocId) {
      navigate(`/documents/${newDocId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upload Business Document
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload invoices, receipts, purchase orders, quotations or legal contracts for AI analysis
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Drag and Drop Area */}
      <div className="glass-card p-8">
        <form
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onSubmit={(e) => e.preventDefault()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
            dragActive
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
          }`}
        >
          <input
            id="file-upload-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            onChange={handleChange}
            className="hidden"
          />

          {!selectedFile ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Drag & drop your file here
                </h4>
                <p className="text-xs text-slate-400 mt-1">or browse from your computer</p>
              </div>
              <label
                htmlFor="file-upload-input"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
              >
                Browse Document File
              </label>
              <div className="text-[11px] text-slate-400 font-mono pt-2">
                Supported formats: PDF, PNG, JPG, JPEG, DOCX (Max 20MB)
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs uppercase">
                    {selectedFile.name.split('.').pop()}
                  </div>
                  <div className="text-left">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">
                      {selectedFile.name}
                    </h5>
                    <p className="text-xs text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Document Classification Selector */}
              <div className="text-left">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Expected Document Type (Optional Pre-Classification)
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Invoice">Invoice</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Purchase Order">Purchase Order</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Contract">Contract / Agreement</option>
                  <option value="General">General Business Document</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartProcess}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Process Document
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Processing Step Modal */}
      <ProcessingModal
        isOpen={isProcessing}
        filename={selectedFile?.name}
        onComplete={handleModalComplete}
      />
    </div>
  );
};

export default UploadPage;
