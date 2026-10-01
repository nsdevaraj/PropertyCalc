import React, { useState } from 'react';
import {
  CombinedInputs,
  AdvancedCalculationResult,
  SimulationSnapshot,
  CurrencyMode,
} from '../types/financial';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  BookmarkPlus,
  Trash2,
  RotateCcw,
  Scale,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SnapshotComparisonProps {
  currentInputs: CombinedInputs;
  currentResults: AdvancedCalculationResult;
  baseInputs: CombinedInputs;
  baseResults: AdvancedCalculationResult;
  snapshots: SimulationSnapshot[];
  currency: CurrencyMode;
  onSaveSnapshot: (name: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onRestoreSnapshot: (inputs: CombinedInputs) => void;
}

export const SnapshotComparison: React.FC<SnapshotComparisonProps> = ({
  currentInputs,
  currentResults,
  baseInputs,
  baseResults,
  snapshots,
  currency,
  onSaveSnapshot,
  onDeleteSnapshot,
  onRestoreSnapshot,
}) => {
  const [snapshotName, setSnapshotName] = useState('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(
    snapshots[0]?.id || ''
  );
  const [isExpanded, setIsExpanded] = useState(true);

  // If selectedSnapshotId is not in snapshots list, pick first available
  const activeSnapshot =
    snapshots.find((s) => s.id === selectedSnapshotId) || snapshots[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = snapshotName.trim() || `Snapshot ${snapshots.length + 1}`;
    onSaveSnapshot(name);
    setSnapshotName('');
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3.5">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            Snapshot Comparison: Live vs Base Scenario
          </h3>
          <span className="text-[11px] text-slate-400">
            ({snapshots.length} saved)
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded p-1 text-slate-400 hover:text-white transition-colors"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Save New Snapshot Input Form */}
          <form
            onSubmit={handleSave}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs"
          >
            <input
              type="text"
              placeholder={`Snapshot name (e.g. Bull Market 10%, ₹50k Rent)...`}
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500 whitespace-nowrap"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              <span>Capture Snapshot</span>
            </button>
          </form>

          {/* Active Saved Snapshot Selector & Action bar if snapshots exist */}
          {snapshots.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Compare with:</span>
                <select
                  value={activeSnapshot?.id || ''}
                  onChange={(e) => setSelectedSnapshotId(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white text-xs font-medium"
                >
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </option>
                  ))}
                </select>
              </div>

              {activeSnapshot && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRestoreSnapshot(activeSnapshot.inputs)}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                    title="Load this snapshot into active sliders"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Restore into Live</span>
                  </button>
                  <span className="text-slate-700">·</span>
                  <button
                    onClick={() => onDeleteSnapshot(activeSnapshot.id)}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                    title="Delete snapshot"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Side-by-Side Comparison Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 bg-slate-950 font-sans font-medium text-slate-400">
                <tr>
                  <th className="py-2 px-3">Metric / Parameter</th>
                  <th className="py-2 px-3 text-right">
                    <div>Base Benchmark</div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      (Original ₹1 Cr)
                    </span>
                  </th>
                  <th className="py-2 px-3 text-right text-emerald-400">
                    <div>Live Simulation</div>
                    <span className="text-[10px] text-emerald-500/70 font-mono">
                      (Current Sliders)
                    </span>
                  </th>
                  {activeSnapshot && (
                    <th className="py-2 px-3 text-right text-amber-300">
                      <div>{activeSnapshot.name}</div>
                      <span className="text-[10px] text-amber-500/70 font-mono">
                        (Saved Snapshot)
                      </span>
                    </th>
                  )}
                  <th className="py-2 px-3 text-right font-sans">
                    Live vs Base Δ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {/* 1. Property Price */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Property Price (P)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatCurrency(baseInputs.propertyPrice, currency, true)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-white tabular-nums">
                    {formatCurrency(currentInputs.propertyPrice, currency, true)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatCurrency(activeSnapshot.inputs.propertyPrice, currency, true)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentInputs.propertyPrice - baseInputs.propertyPrice === 0
                      ? '—'
                      : `${currentInputs.propertyPrice > baseInputs.propertyPrice ? '+' : ''}${formatCurrency(
                          currentInputs.propertyPrice - baseInputs.propertyPrice,
                          currency,
                          true
                        )}`}
                  </td>
                </tr>

                {/* 2. Monthly Rent */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Monthly Rent (R)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatCurrency(baseInputs.monthlyRent, currency, false)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-white tabular-nums">
                    {formatCurrency(currentInputs.monthlyRent, currency, false)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatCurrency(activeSnapshot.inputs.monthlyRent, currency, false)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentInputs.monthlyRent - baseInputs.monthlyRent === 0
                      ? '—'
                      : `${currentInputs.monthlyRent > baseInputs.monthlyRent ? '+' : ''}${formatCurrency(
                          currentInputs.monthlyRent - baseInputs.monthlyRent,
                          currency,
                          false
                        )}`}
                  </td>
                </tr>

                {/* 3. Loan Rate */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Loan Interest Rate (i)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {baseInputs.loanInterestRate.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-white tabular-nums">
                    {currentInputs.loanInterestRate.toFixed(1)}%
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {activeSnapshot.inputs.loanInterestRate.toFixed(1)}%
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentInputs.loanInterestRate - baseInputs.loanInterestRate === 0
                      ? '—'
                      : `${currentInputs.loanInterestRate > baseInputs.loanInterestRate ? '+' : ''}${(
                          currentInputs.loanInterestRate - baseInputs.loanInterestRate
                        ).toFixed(1)}%`}
                  </td>
                </tr>

                {/* 4. Property Appreciation */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Property Appreciation (g)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {baseInputs.propertyAppreciation.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-emerald-400 tabular-nums">
                    {currentInputs.propertyAppreciation.toFixed(1)}%
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {activeSnapshot.inputs.propertyAppreciation.toFixed(1)}%
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentInputs.propertyAppreciation - baseInputs.propertyAppreciation === 0
                      ? '—'
                      : `${currentInputs.propertyAppreciation > baseInputs.propertyAppreciation ? '+' : ''}${(
                          currentInputs.propertyAppreciation - baseInputs.propertyAppreciation
                        ).toFixed(1)}%`}
                  </td>
                </tr>

                {/* 5. Alternative Return */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Alternative Return (r)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {baseInputs.alternativeReturn.toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-blue-400 tabular-nums">
                    {currentInputs.alternativeReturn.toFixed(1)}%
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {activeSnapshot.inputs.alternativeReturn.toFixed(1)}%
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentInputs.alternativeReturn - baseInputs.alternativeReturn === 0
                      ? '—'
                      : `${currentInputs.alternativeReturn > baseInputs.alternativeReturn ? '+' : ''}${(
                          currentInputs.alternativeReturn - baseInputs.alternativeReturn
                        ).toFixed(1)}%`}
                  </td>
                </tr>

                {/* 5b. Inflation Rate */}
                <tr className="hover:bg-slate-800/20 bg-amber-950/10">
                  <td className="py-1.5 px-3 font-sans font-medium text-amber-300">
                    Inflation Rate (π)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {(baseInputs.inflationRate ?? 5.0).toFixed(1)}%
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-amber-400 tabular-nums">
                    {(currentInputs.inflationRate ?? 5.0).toFixed(1)}%
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {(activeSnapshot.inputs.inflationRate ?? 5.0).toFixed(1)}%
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {(currentInputs.inflationRate ?? 5.0) - (baseInputs.inflationRate ?? 5.0) === 0
                      ? '—'
                      : `${(currentInputs.inflationRate ?? 5.0) > (baseInputs.inflationRate ?? 5.0) ? '+' : ''}${(
                          (currentInputs.inflationRate ?? 5.0) - (baseInputs.inflationRate ?? 5.0)
                        ).toFixed(1)}%`}
                  </td>
                </tr>

                {/* 6. Monthly EMI */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Monthly Loan EMI
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatCurrency(baseResults.monthlyEMI, currency, false)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-white tabular-nums">
                    {formatCurrency(currentResults.monthlyEMI, currency, false)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatCurrency(activeSnapshot.results.monthlyEMI, currency, false)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentResults.monthlyEMI - baseResults.monthlyEMI === 0
                      ? '—'
                      : `${currentResults.monthlyEMI > baseResults.monthlyEMI ? '+' : ''}${formatCurrency(
                          currentResults.monthlyEMI - baseResults.monthlyEMI,
                          currency,
                          false
                        )}`}
                  </td>
                </tr>

                {/* 7. Net Monthly Outflow */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Net Monthly Outflow
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatCurrency(baseResults.netMonthlyOutflow, currency, false)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-amber-300 tabular-nums">
                    {formatCurrency(currentResults.netMonthlyOutflow, currency, false)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatCurrency(activeSnapshot.results.netMonthlyOutflow, currency, false)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentResults.netMonthlyOutflow - baseResults.netMonthlyOutflow === 0
                      ? '—'
                      : `${currentResults.netMonthlyOutflow > baseResults.netMonthlyOutflow ? '+' : ''}${formatCurrency(
                          currentResults.netMonthlyOutflow - baseResults.netMonthlyOutflow,
                          currency,
                          false
                        )}`}
                  </td>
                </tr>

                {/* 8. Required Breakeven (g*) */}
                <tr className="bg-emerald-950/20 hover:bg-emerald-950/30 font-semibold">
                  <td className="py-1.5 px-3 font-sans text-emerald-400">
                    Required Breakeven (g*)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatPercent(baseResults.requiredAppreciationPercent, 2)}
                  </td>
                  <td className="py-1.5 px-3 text-right text-emerald-400 tabular-nums">
                    {formatPercent(currentResults.requiredAppreciationPercent, 2)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-300 tabular-nums">
                      {formatPercent(activeSnapshot.results.requiredAppreciationPercent, 2)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-emerald-400">
                    {(
                      currentResults.requiredAppreciationPercent -
                      baseResults.requiredAppreciationPercent
                    ).toFixed(2)}%
                  </td>
                </tr>

                {/* 9. Final Alternative Portfolio FV */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Alternative Portfolio FV
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatCurrency(baseResults.alternativeFV, currency, true)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-blue-400 tabular-nums">
                    {formatCurrency(currentResults.alternativeFV, currency, true)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatCurrency(activeSnapshot.results.alternativeFV, currency, true)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentResults.alternativeFV - baseResults.alternativeFV === 0
                      ? '—'
                      : `${currentResults.alternativeFV > baseResults.alternativeFV ? '+' : ''}${formatCurrency(
                          currentResults.alternativeFV - baseResults.alternativeFV,
                          currency,
                          true
                        )}`}
                  </td>
                </tr>

                {/* 10. Final Property FV */}
                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Property Future Value (Nominal)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatCurrency(baseResults.propertyFV, currency, true)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-white tabular-nums">
                    {formatCurrency(currentResults.propertyFV, currency, true)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatCurrency(activeSnapshot.results.propertyFV, currency, true)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {currentResults.propertyFV - baseResults.propertyFV === 0
                      ? '—'
                      : `${currentResults.propertyFV > baseResults.propertyFV ? '+' : ''}${formatCurrency(
                          currentResults.propertyFV - baseResults.propertyFV,
                          currency,
                          true
                        )}`}
                  </td>
                </tr>

                {/* 10b. Real-Term Returns (Inflation-Adjusted Purchasing Power) */}
                <tr className="hover:bg-slate-800/20 bg-emerald-950/10">
                  <td className="py-1.5 px-3 font-sans font-medium text-emerald-400">
                    Real Property FV (Today's Money)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatCurrency(baseResults.realPropertyFV, currency, true)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-emerald-400 tabular-nums">
                    {formatCurrency(currentResults.realPropertyFV, currency, true)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatCurrency(activeSnapshot.results.realPropertyFV, currency, true)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {formatCurrency(currentResults.realPropertyFV - baseResults.realPropertyFV, currency, true)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/20 bg-blue-950/10">
                  <td className="py-1.5 px-3 font-sans font-medium text-blue-400">
                    Real Alternative FV (Today's Money)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatCurrency(baseResults.realAlternativeFV, currency, true)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-blue-400 tabular-nums">
                    {formatCurrency(currentResults.realAlternativeFV, currency, true)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatCurrency(activeSnapshot.results.realAlternativeFV, currency, true)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-slate-400">
                    {formatCurrency(currentResults.realAlternativeFV - baseResults.realAlternativeFV, currency, true)}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/20">
                  <td className="py-1.5 px-3 font-sans font-medium text-slate-300">
                    Real Annualized ROI (Prop vs Alt)
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 tabular-nums">
                    {formatPercent(baseResults.realROIProperty, 1)} / {formatPercent(baseResults.realROIAlternative, 1)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-semibold text-white tabular-nums">
                    {formatPercent(currentResults.realROIProperty, 1)} / {formatPercent(currentResults.realROIAlternative, 1)}
                  </td>
                  {activeSnapshot && (
                    <td className="py-1.5 px-3 text-right text-amber-200 tabular-nums">
                      {formatPercent(activeSnapshot.results.realROIProperty, 1)} / {formatPercent(activeSnapshot.results.realROIAlternative, 1)}
                    </td>
                  )}
                  <td className="py-1.5 px-3 text-right tabular-nums text-emerald-400">
                    {(currentResults.realROIProperty - currentResults.realROIAlternative).toFixed(1)}% spread
                  </td>
                </tr>

                {/* 11. Net Spread / Winner */}
                <tr className="bg-slate-950/70 font-semibold">
                  <td className="py-2 px-3 font-sans text-slate-200">
                    Net Spread (Prop − Alt)
                  </td>
                  <td
                    className={`py-2 px-3 text-right tabular-nums ${
                      baseResults.netDifference >= 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {baseResults.netDifference >= 0 ? '+' : ''}
                    {formatCurrency(baseResults.netDifference, currency, true)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right tabular-nums ${
                      currentResults.netDifference >= 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {currentResults.netDifference >= 0 ? '+' : ''}
                    {formatCurrency(currentResults.netDifference, currency, true)}
                  </td>
                  {activeSnapshot && (
                    <td
                      className={`py-2 px-3 text-right tabular-nums ${
                        activeSnapshot.results.netDifference >= 0
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {activeSnapshot.results.netDifference >= 0 ? '+' : ''}
                      {formatCurrency(activeSnapshot.results.netDifference, currency, true)}
                    </td>
                  )}
                  <td className="py-2 px-3 text-right font-sans text-xs">
                    {currentResults.netDifference >= 0 ? (
                      <span className="text-emerald-400">Property Wins</span>
                    ) : (
                      <span className="text-blue-400">Alternative Wins</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
