import React from 'react';
import { CurrencyMode } from '../types/financial';
import { RotateCcw, Download, BookOpen } from 'lucide-react';

interface TopBarProps {
  currency: CurrencyMode;
  onCurrencyToggle: (currency: CurrencyMode) => void;
  onResetToBase: () => void;
  onOpenDocs: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
  onExportCSV: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currency,
  onCurrencyToggle,
  onResetToBase,
  onOpenDocs,
  activeSection,
  onSelectSection,
  onExportCSV,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur-md md:px-8">
      {/* Zone 1: Brand title, one line wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#sandbox"
          onClick={(e) => {
            e.preventDefault();
            onSelectSection('sandbox');
          }}
          className="text-base font-bold tracking-tight text-white transition-opacity hover:opacity-90 md:text-lg"
        >
          Property vs Alternatives
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectSection('overview')}
          className={`transition-colors hover:text-white ${
            activeSection === 'overview' ? 'text-emerald-400' : ''
          }`}
        >
          Executive Summary
        </button>
        <button
          onClick={() => onSelectSection('crossover')}
          className={`transition-colors hover:text-white ${
            activeSection === 'crossover' ? 'text-emerald-400' : ''
          }`}
        >
          Crossover Analysis
        </button>
        <button
          onClick={() => onSelectSection('trajectory')}
          className={`transition-colors hover:text-white ${
            activeSection === 'trajectory' ? 'text-emerald-400' : ''
          }`}
        >
          Wealth Trajectory
        </button>
        <button
          onClick={() => onSelectSection('sensitivity')}
          className={`transition-colors hover:text-white ${
            activeSection === 'sensitivity' ? 'text-emerald-400' : ''
          }`}
        >
          Sensitivity Tables
        </button>
        <button
          onClick={() => onSelectSection('ledger')}
          className={`transition-colors hover:text-white ${
            activeSection === 'ledger' ? 'text-emerald-400' : ''
          }`}
        >
          Cash Flow Ledger
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions & controls */}
      <div className="flex items-center gap-2">
        {/* Currency Switcher */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900/90 p-0.5 text-xs font-medium">
          <button
            onClick={() => onCurrencyToggle('INR')}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              currency === 'INR'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ₹ INR (Cr/L)
          </button>
          <button
            onClick={() => onCurrencyToggle('USD')}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              currency === 'USD'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            $ USD
          </button>
        </div>

        {/* Documentation / Logic */}
        <button
          onClick={onOpenDocs}
          title="Methodology & Caveats"
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Formulas & Caveats</span>
        </button>

        {/* Reset */}
        <button
          onClick={onResetToBase}
          title="Reset to ₹1 Cr base case"
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Export */}
        <button
          onClick={onExportCSV}
          title="Export CSV Amortization & Ledger"
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>
    </header>
  );
};
