import React from 'react';
import { BaseCalculationResult, CurrencyMode } from '../types/financial';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Scale, ShieldCheck, AlertCircle } from 'lucide-react';

interface KPISummaryProps {
  results: BaseCalculationResult;
  currentAppreciation: number;
  currency: CurrencyMode;
  tenureYears: number;
}

export const KPISummary: React.FC<KPISummaryProps> = ({
  results,
  currentAppreciation,
  currency,
  tenureYears,
}) => {
  const gStar = results.requiredAppreciationPercent;
  const isPropertyWinning = results.netDifference >= 0;
  const differenceAbs = Math.abs(results.netDifference);

  // Growth gap: current appreciation vs required
  const growthGap = currentAppreciation - gStar;

  return (
    <div className="space-y-4">
      {/* Primary Verdict Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Scale className="h-4 w-4 text-emerald-400" />
              <span>Investment Outcome at Year {tenureYears}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">
                Assumption: {formatPercent(currentAppreciation)} Property Appreciation vs {formatPercent(gStar > 0 ? (results.alternativeFV > 0 ? 10 : 10) : 0, 0)} Alternative
              </span>
            </div>
            
            <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              {isPropertyWinning ? (
                <span className="text-emerald-400">
                  Property Outperforms Alternative by {formatCurrency(differenceAbs, currency, true)}
                </span>
              ) : (
                <span className="text-amber-400">
                  Alternative Investment Leads by {formatCurrency(differenceAbs, currency, true)}
                </span>
              )}
            </h2>
            
            <p className="text-sm text-slate-400">
              {isPropertyWinning ? (
                <>
                  Your chosen appreciation rate (<span className="font-semibold text-white">{formatPercent(currentAppreciation)}</span>) exceeds the break-even threshold (<span className="font-semibold text-emerald-400">{formatPercent(gStar)}</span>), validating the property leverage payoff.
                </>
              ) : (
                <>
                  Property requires at least <span className="font-semibold text-amber-400 font-mono">{formatPercent(gStar)} p.a.</span> continuous appreciation to break even with the disciplined alternative portfolio. You are currently trailing by <span className="font-semibold text-white font-mono">{formatPercent(Math.abs(growthGap))}</span> p.a.
                </>
              )}
            </p>
          </div>

          {/* Break-even Badge & Ratio */}
          <div className="flex shrink-0 items-center gap-4 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
            <div>
              <div className="text-xs font-medium text-slate-400">Required Break-even (g*)</div>
              <div className="text-2xl font-bold tracking-tight text-emerald-400 font-mono tabular-nums">
                {formatPercent(gStar, 2)}
                <span className="ml-1 text-xs font-normal text-slate-400">p.a.</span>
              </div>
            </div>
            <div className="h-9 w-px bg-slate-800" />
            <div>
              <div className="text-xs font-medium text-slate-400">Alt Portfolio FV</div>
              <div className="text-lg font-semibold text-slate-200 font-mono tabular-nums">
                {formatCurrency(results.alternativeFV, currency, true)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Property FV */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs font-medium text-slate-400">Property Future Value (FV)</div>
          <div className="mt-1.5 text-xl font-bold text-white font-mono tabular-nums md:text-2xl">
            {formatCurrency(results.propertyFV, currency, true)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Equity multiple:</span>
            <span className="font-mono text-emerald-400 font-semibold">{results.equityMultipleProperty.toFixed(2)}x</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{tenureYears} yrs</span>
          </div>
        </div>

        {/* Card 2: Alternative Investment FV */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs font-medium text-slate-400">Alternative Investment FV</div>
          <div className="mt-1.5 text-xl font-bold text-slate-100 font-mono tabular-nums md:text-2xl">
            {formatCurrency(results.alternativeFV, currency, true)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Equity multiple:</span>
            <span className="font-mono text-blue-400 font-semibold">{results.equityMultipleAlternative.toFixed(2)}x</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Lump + Annuity</span>
          </div>
        </div>

        {/* Card 3: Monthly Net Outflow */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs font-medium text-slate-400">Net Monthly Outflow (EMI − Rent)</div>
          <div className="mt-1.5 text-xl font-bold text-amber-300 font-mono tabular-nums md:text-2xl">
            {formatCurrency(results.netMonthlyOutflow, currency, false)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>EMI: {formatCurrency(results.monthlyEMI, currency, false)}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400">Rent offsets {( (results.monthlyEMI > 0 ? (results.monthlyEMI - results.netMonthlyOutflow) / results.monthlyEMI : 0) * 100 ).toFixed(0)}%</span>
          </div>
        </div>

        {/* Card 4: Total Interest Drag */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs font-medium text-slate-400">Total Interest to Bank</div>
          <div className="mt-1.5 text-xl font-bold text-rose-300 font-mono tabular-nums md:text-2xl">
            {formatCurrency(results.totalInterestPaid, currency, true)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Principal: {formatCurrency(results.loanAmount, currency, true)}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Ratio: {(results.loanAmount > 0 ? results.totalInterestPaid / results.loanAmount : 0).toFixed(2)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
