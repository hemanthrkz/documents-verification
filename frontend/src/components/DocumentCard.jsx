import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import ConfidenceBadge from './ConfidenceBadge';
import { FileText, Building2, Calendar, ArrowRight, DollarSign } from 'lucide-react';

const DocumentCard = ({ document }) => {
  const navigate = useNavigate();
  const {
    id,
    filename,
    document_type,
    status,
    confidence,
    vendor_name,
    total_amount,
    currency,
    due_date,
    uploaded_at
  } = document;

  return (
    <div
      onClick={() => navigate(`/documents/${id}`)}
      className="glass-card p-5 cursor-pointer hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs uppercase">
              {document_type ? document_type.substring(0, 3) : 'DOC'}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[180px] group-hover:text-brand-500 transition-colors">
                {filename}
              </h4>
              <p className="text-xs text-slate-400 font-medium">{document_type}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Vendor & Details */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800/80 my-3">
          {vendor_name && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Building2 className="w-3.5 h-3.5" /> Vendor:
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                {vendor_name}
              </span>
            </div>
          )}

          {total_amount !== null && total_amount !== undefined && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <DollarSign className="w-3.5 h-3.5" /> Total Amount:
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currency || '₹'} {Number(total_amount).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {due_date && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" /> Due Date:
              </span>
              <span className="font-medium text-amber-600 dark:text-amber-400">{due_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <ConfidenceBadge confidence={confidence} />
        <span className="text-xs font-semibold text-brand-500 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          View <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;
