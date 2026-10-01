import React, { useState } from 'react';
import {
  generateAppreciationSensitivity,
  generateRentSensitivity,
  generateLoanRateSensitivity,
  generate2DSensitivityMatrix,
} from '../utils/sensitivityAnalysis';
import { BaseInputs, CurrencyMode } from '../types/financial';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Table, CheckCircle2, TrendingUp, DollarSign, Percent, Grid } from 'lucide-react';

interface SensitivityTablesProps {
  inputs: BaseInputs;
  currency: CurrencyMode;
  onApplyAppreciation: (g: number) => void;
  onApplyRent: (r: number) => void;
  onApplyRate: (rate: number) => void;
}

export const SensitivityTables: React.FC<SensitivityTablesProps> = ({
  inputs,
  currency,
  onApplyAppreciation,
  onApplyRent,
  onApplyRate,
}) => {
  const [activeTab, setActiveTab] = useState<'appreciation' | 'rent' | 'rate' | 'matrix'>('appreciation');

  const tableA = generateAppreciationSensitivity(inputs, [3, 4, 5, 6, 7, 8, 9, 10, 12]);
  const tableB = generateRentSensitivity(inputs, [15000, 20000, 25000, 30000, 35000, 40000, 50000]);
  const tableC = generateLoanRateSensitivity(inputs, [6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]);
  const matrix2D = generate2DSensitivityMatrix(inputs);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      {/* Header and Tab Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Interactive Sensitivity Simulations</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test how return thresholds shift across appreciation, rental yield, and interest rate environments. Click any row to apply.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            onClick={() => setActiveTab('appreciation')}
            className={`rounded px-2.5 py-1 transition-colors ${
              activeTab === 'appreciation'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            A. Appreciation (g)
          </button>
          <button
            onClick={() => setActiveTab('rent')}
            className={`rounded px-2.5 py-1 transition-colors ${
              activeTab === 'rent'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            B. Monthly Rent (R)
          </button>
          <button
            onClick={() => setActiveTab('rate')}
            className={`rounded px-2.5 py-1 transition-colors ${
              activeTab === 'rate'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            C. Loan Rate (i)
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`rounded px-2.5 py-1 transition-colors ${
              activeTab === 'matrix'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D Heatmap Matrix
          </button>
        </div>
      </div>

      {/* Tab A: Property Appreciation Sensitivity */}
      {activeTab === 'appreciation' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Fixes down payment ({inputs.downPaymentPercent}%), loan interest ({inputs.loanInterestRate}%), tenure ({inputs.tenureYears}y), rent ({formatCurrency(inputs.monthlyRent, currency, false)}), and alternative return ({inputs.alternativeReturn}%).
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 font-medium text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Appreciation (g)</th>
                  <th className="py-2.5 px-3 text-right">FV Property</th>
                  <th className="py-2.5 px-3 text-right">FV Alternative</th>
                  <th className="py-2.5 px-3 text-right">Difference (Prop − Alt)</th>
                  <th className="py-2.5 px-3 text-center">Favorable Asset</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {tableA.map((row) => {
                  const isCurrent = Math.abs(row.appreciation - inputs.propertyAppreciation) < 0.01;
                  const isPositive = row.difference >= 0;
                  return (
                    <tr
                      key={row.appreciation}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isCurrent ? 'bg-emerald-950/20 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{row.appreciation}% p.a.</span>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-400 font-sans font-normal">
                              (active)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">
                        {formatCurrency(row.propertyFV, currency, true)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">
                        {formatCurrency(row.alternativeFV, currency, true)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right tabular-nums font-semibold ${
                          isPositive ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(row.difference, currency, true)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans text-xs">
                        {isPositive ? (
                          <span className="text-emerald-400 font-medium">Property</span>
                        ) : (
                          <span className="text-blue-400 font-medium">Alternative</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => onApplyAppreciation(row.appreciation)}
                          disabled={isCurrent}
                          className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                            isCurrent
                              ? 'text-slate-600 cursor-default'
                              : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                          }`}
                        >
                          {isCurrent ? 'Applied' : 'Apply'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab B: Monthly Rent Sensitivity */}
      {activeTab === 'rent' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Higher rent reduces the monthly net cash outflow (<code className="font-mono text-slate-300">EMI − R</code>), reducing the annuity invested in the alternative portfolio and dropping the required appreciation threshold <code className="font-mono text-emerald-400">g*</code>.
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 font-medium text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Monthly Rent</th>
                  <th className="py-2.5 px-3 text-right">Net Monthly Outflow</th>
                  <th className="py-2.5 px-3 text-right">Required (g*)</th>
                  <th className="py-2.5 px-3 text-right">FV Alternative</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {tableB.map((row) => {
                  const isCurrent = Math.abs(row.rent - inputs.monthlyRent) < 100;
                  return (
                    <tr
                      key={row.rent}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isCurrent ? 'bg-emerald-950/20 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{formatCurrency(row.rent, currency, false)}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-400 font-sans font-normal">
                              (active)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-300 tabular-nums">
                        {formatCurrency(row.netOutflow, currency, false)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold tabular-nums">
                        {formatPercent(row.requiredG, 2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">
                        {formatCurrency(row.alternativeFV, currency, true)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => onApplyRent(row.rent)}
                          disabled={isCurrent}
                          className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                            isCurrent
                              ? 'text-slate-600 cursor-default'
                              : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                          }`}
                        >
                          {isCurrent ? 'Applied' : 'Apply'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab C: Loan Interest Rate Sensitivity */}
      {activeTab === 'rate' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Higher loan interest rates directly inflate EMI and net cash burn, raising the hurdle rate <code className="font-mono text-emerald-400">g*</code> needed for the property to justify its financing cost.
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 font-medium text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Loan Interest Rate</th>
                  <th className="py-2.5 px-3 text-right">Monthly EMI</th>
                  <th className="py-2.5 px-3 text-right">Net Monthly Outflow</th>
                  <th className="py-2.5 px-3 text-right">Required (g*)</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {tableC.map((row) => {
                  const isCurrent = Math.abs(row.loanRate - inputs.loanInterestRate) < 0.05;
                  return (
                    <tr
                      key={row.loanRate}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isCurrent ? 'bg-emerald-950/20 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{row.loanRate.toFixed(1)}% p.a.</span>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-400 font-sans font-normal">
                              (active)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200 tabular-nums">
                        {formatCurrency(row.emi, currency, false)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-300 tabular-nums">
                        {formatCurrency(row.netOutflow, currency, false)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold tabular-nums">
                        {formatPercent(row.requiredG, 2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => onApplyRate(row.loanRate)}
                          disabled={isCurrent}
                          className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                            isCurrent
                              ? 'text-slate-600 cursor-default'
                              : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
                          }`}
                        >
                          {isCurrent ? 'Applied' : 'Apply'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Matrix: 2D Heatmap Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Heatmap comparing Net Difference (<span className="text-emerald-400 font-semibold">Green = Property Wins</span>, <span className="text-blue-400 font-semibold">Blue = Alternative Portfolio Wins</span>) across combinations of Property Appreciation (Y) and Alternative Compound Return (X).
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-center text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 font-medium text-slate-400">
                <tr>
                  <th className="py-2 px-3 text-left">Property Appreciation (g) ↓ \ Alt Return (r) →</th>
                  {matrix2D.xLabels.map((r) => (
                    <th key={r} className="py-2 px-2.5 text-center font-mono text-slate-300">
                      {r}%
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {matrix2D.matrix.map((row, idx) => {
                  const gVal = matrix2D.yLabels[idx];
                  const isCurrentRow = Math.abs(gVal - inputs.propertyAppreciation) < 0.4;
                  return (
                    <tr key={gVal} className={isCurrentRow ? 'bg-slate-800/30' : ''}>
                      <td className="py-2 px-3 text-left font-semibold text-white">
                        {gVal}% p.a.
                      </td>
                      {row.map((cell) => {
                        const isProperty = cell.winner === 'property';
                        const diffAbs = Math.abs(cell.difference);
                        return (
                          <td
                            key={cell.altReturn}
                            className={`py-2 px-2 text-[11px] tabular-nums transition-colors ${
                              isProperty
                                ? 'bg-emerald-950/40 text-emerald-300 font-medium'
                                : 'bg-blue-950/30 text-blue-300'
                            }`}
                            title={`Appreciation ${cell.appreciation}% vs Alt ${cell.altReturn}%: Diff = ${formatCurrency(cell.difference, currency, true)}`}
                          >
                            <span className="block">
                              {isProperty ? '+' : '−'}
                              {formatCurrency(diffAbs, currency, true)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
