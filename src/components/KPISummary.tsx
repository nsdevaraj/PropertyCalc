import React, { useState } from 'react';
import { BaseCalculationResult, CurrencyMode } from '../types/financial';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Scale, ShieldCheck, AlertCircle, Percent } from 'lucide-react';

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
  const [displayRealTerms, setDisplayRealTerms] = useState(false);

  const gStar = results.requiredAppreciationPercent;
  const isPropertyWinning = results.netDifference >= 0;
  const differenceAbs = Math.abs(results.netDifference);
  const realDiffAbs = Math.abs(results.realNetDifference);

  // Growth gap: current appreciation vs required
  const growthGap = currentAppreciation - gStar;

  return (
    <div className="space-y-4">
      {/* Primary Verdict Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Scale className="h-4 w-4 text-emerald-400" />
              <span>Investment Outcome at Year {tenureYears}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-mono">
                {formatPercent(currentAppreciation)} Property Appreciation vs {formatPercent(results.alternativeFV > 0 ? 10 : 10, 0)} Alternative
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400 font-mono">
                {results.inflationRate.toFixed(1)}% Inflation
              </span>
            </div>
            
            <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              {isPropertyWinning ? (
                <span className="text-emerald-400">
                  Property Outperforms Alternative by{' '}
                  {displayRealTerms
                    ? `${formatCurrency(realDiffAbs, currency, true)} (Real)`
                    : formatCurrency(differenceAbs, currency, true)}
                </span>
              ) : (
                <span className="text-amber-400">
                  Alternative Investment Leads by{' '}
                  {displayRealTerms
                    ? `${formatCurrency(realDiffAbs, currency, true)} (Real)`
                    : formatCurrency(differenceAbs, currency, true)}
                </span>
              )}
            </h2>
            
            <p className="text-sm text-slate-400">
              {isPropertyWinning ? (
                <>
                  Your chosen appreciation rate (<span className="font-semibold text-white font-mono">{formatPercent(currentAppreciation)}</span>) exceeds the break-even threshold (<span className="font-semibold text-emerald-400 font-mono">{formatPercent(gStar)}</span>), generating a positive real-term premium over inflation.
                </>
              ) : (
                <>
                  Property requires at least <span className="font-semibold text-amber-400 font-mono">{formatPercent(gStar)} p.a.</span> continuous appreciation to break even with the disciplined alternative portfolio. You are currently trailing by <span className="font-semibold text-white font-mono">{formatPercent(Math.abs(growthGap))}</span> p.a.
                </>
              )}
            </p>
          </div>

          {/* Break-even Badge & Nominal vs Real Switcher */}
          <div className="flex shrink-0 flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-slate-800 bg-slate-950/70 p-4">
            <div>
              <div className="text-xs font-medium text-slate-400">Required Break-even (g*)</div>
              <div className="text-2xl font-bold tracking-tight text-emerald-400 font-mono tabular-nums">
                {formatPercent(gStar, 2)}
                <span className="ml-1 text-xs font-normal text-slate-400">p.a.</span>
              </div>
            </div>

            <div className="hidden sm:block h-9 w-px bg-slate-800" />

            <div>
              <div className="text-xs font-medium text-slate-400">Adjust Purchasing Power</div>
              <div className="mt-1 flex items-center rounded border border-slate-800 bg-slate-900 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setDisplayRealTerms(false)}
                  className={`rounded px-2 py-0.5 transition-colors ${
                    !displayRealTerms
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Nominal
                </button>
                <button
                  onClick={() => setDisplayRealTerms(true)}
                  className={`rounded px-2 py-0.5 transition-colors ${
                    displayRealTerms
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Real (Inflation-Adj)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Property FV & Real ROI */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs font-medium text-slate-400">
            {displayRealTerms ? 'Property Real FV (Today’s Money)' : 'Property Future Value (Nominal)'}
          </div>
          <div className="mt-1.5 text-xl font-bold text-white font-mono tabular-nums md:text-2xl">
            {displayRealTerms
              ? formatCurrency(results.realPropertyFV, currency, true)
              : formatCurrency(results.propertyFV, currency, true)}
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-300">Real ROI:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {results.realROIProperty >= 0 ? '+' : ''}
                {formatPercent(results.realROIProperty, 2)} p.a.
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Nominal: {formatCurrency(results.propertyFV, currency, true)} ({results.equityMultipleProperty.toFixed(2)}x)
            </div>
          </div>
        </div>

        {/* Card 2: Alternative Investment FV & Real ROI */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs font-medium text-slate-400">
            {displayRealTerms ? 'Alternative Real FV (Today’s Money)' : 'Alternative Investment FV (Nominal)'}
          </div>
          <div className="mt-1.5 text-xl font-bold text-slate-100 font-mono tabular-nums md:text-2xl">
            {displayRealTerms
              ? formatCurrency(results.realAlternativeFV, currency, true)
              : formatCurrency(results.alternativeFV, currency, true)}
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-300">Real ROI:</span>
              <span className="font-mono text-blue-400 font-semibold">
                {results.realROIAlternative >= 0 ? '+' : ''}
                {formatPercent(results.realROIAlternative, 2)} p.a.
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Nominal: {formatCurrency(results.alternativeFV, currency, true)} ({results.equityMultipleAlternative.toFixed(2)}x)
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Net Outflow */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs font-medium text-slate-400">Net Monthly Outflow (EMI − Rent)</div>
          <div className="mt-1.5 text-xl font-bold text-amber-300 font-mono tabular-nums md:text-2xl">
            {formatCurrency(results.netMonthlyOutflow, currency, false)}
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs text-slate-400">
            <div>
              <span>EMI: {formatCurrency(results.monthlyEMI, currency, false)}</span>
            </div>
            <div className="text-[11px] text-emerald-400">
              Rent offsets {( (results.monthlyEMI > 0 ? (results.monthlyEMI - results.netMonthlyOutflow) / results.monthlyEMI : 0) * 100 ).toFixed(0)}% of EMI
            </div>
          </div>
        </div>

        {/* Card 4: Inflation Deflator & Interest Drag */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs font-medium text-slate-400">
            Cumulative Inflation Factor
          </div>
          <div className="mt-1.5 text-xl font-bold text-amber-400 font-mono tabular-nums md:text-2xl">
            {results.cumulativeInflationFactor.toFixed(2)}×
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs text-slate-400">
            <div className="text-[11px] text-slate-300">
              ₹1 today = {formatCurrency(1 / results.cumulativeInflationFactor, currency, false, 2)} in Yr {tenureYears}
            </div>
            <div className="text-[11px] text-slate-500">
              Bank interest paid: {formatCurrency(results.totalInterestPaid, currency, true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

