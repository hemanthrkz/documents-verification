import React from 'react';

const ConfidenceBadge = ({ confidence, showBar = false }) => {
  const score = Math.min(100, Math.max(0, Number(confidence) || 0));
  
  let badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  let barColor = 'bg-emerald-500';

  if (score < 80) {
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    barColor = 'bg-amber-500';
  }
  if (score < 70) {
    badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    barColor = 'bg-rose-500';
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${badgeColor}`}>
        {score}% Confidence
      </span>
      {showBar && (
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceBadge;
