import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Sparkles, FileText, Brain, ShieldAlert } from 'lucide-react';

const ProcessingModal = ({ isOpen, filename, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'File uploaded successfully', icon: FileText },
    { label: 'Reading document file structure', icon: FileText },
    { label: 'Extracting raw text & running OCR visual engine', icon: FileText },
    { label: 'Understanding document & classifying type', icon: Brain },
    { label: 'Extracting structured information fields', icon: Sparkles },
    { label: 'Generating AI executive summary', icon: Sparkles },
    { label: 'Detecting important risk alerts & deadlines', icon: ShieldAlert },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 800);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500"></div>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Processing Document</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono truncate px-4">
            {filename || 'document.pdf'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>AI Document Intelligence</span>
            <span className="text-brand-500 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-3 font-medium text-sm">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                  isCurrent
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 font-semibold border border-brand-500/20'
                    : isDone
                    ? 'text-slate-700 dark:text-slate-300 opacity-90'
                    : 'text-slate-400 dark:text-slate-600 opacity-40'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-brand-500 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 flex-shrink-0"></div>
                )}
                <span className="text-xs sm:text-sm truncate">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;
