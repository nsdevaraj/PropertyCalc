import React, { useState } from 'react';
import { YearlyScheduleRow, CurrencyMode } from '../types/financial';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { FileSpreadsheet, Download, ChevronRight, Eye } from 'lucide-react';

interface CashFlowScheduleProps {
  schedule: YearlyScheduleRow[];
  currency: CurrencyMode;
  onExportCSV: () => void;
  isAdvanced: boolean;
}

export const CashFlowSchedule: React.FC<CashFlowScheduleProps> = ({
  schedule,
  currency,
  onExportCSV,
  isAdvanced,
}) => {
  const [detailMode, setDetailMode] = useState<'condensed' | 'full'>('condensed');

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Year-by-Year Cash Flow & Amortization Schedule</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit the exact debt reduction, rental net yield, tax shields, and portfolio compounding every single year.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Condensed vs Full toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
            <button
              onClick={() => setDetailMode('condensed')}
              className={`rounded px-2.5 py-1 transition-colors ${
                detailMode === 'condensed'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Core Columns
            </button>
            <button
              onClick={() => setDetailMode('full')}
              className={`rounded px-2.5 py-1 transition-colors ${
                detailMode === 'full'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Columns
            </button>
          </div>

          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950 font-medium text-slate-400 whitespace-nowrap">
            <tr>
              <th className="py-2.5 px-3">Year</th>
              <th className="py-2.5 px-3 text-right">Loan Balance</th>
              <th className="py-2.5 px-3 text-right">Principal</th>
              <th className="py-2.5 px-3 text-right">Interest</th>
              {detailMode === 'full' && (
                <>
                  <th className="py-2.5 px-3 text-right">Gross Rent</th>
                  <th className="py-2.5 px-3 text-right">Net Rent</th>
                  {isAdvanced && <th className="py-2.5 px-3 text-right">Tax Saved</th>}
                </>
              )}
              <th className="py-2.5 px-3 text-right">Net Outflow</th>
              <th className="py-2.5 px-3 text-right">Property Valuation</th>
              <th className="py-2.5 px-3 text-right text-emerald-400">Property Net Equity</th>
              <th className="py-2.5 px-3 text-right text-blue-400">Alt Portfolio Value</th>
              <th className="py-2.5 px-3 text-right">Gap (Prop − Alt)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {schedule.map((row) => {
              const isLead = row.wealthGap >= 0;
              return (
                <tr key={row.year} className="transition-colors hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-sans font-semibold text-white">
                    Yr {row.year}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                    {formatCurrency(row.endingLoanBalance, currency, true)}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400/90 tabular-nums">
                    {formatCurrency(row.principalPaid, currency, false)}
                  </td>
                  <td className="py-2 px-3 text-right text-rose-400/90 tabular-nums">
                    {formatCurrency(row.interestPaid, currency, false)}
                  </td>
                  {detailMode === 'full' && (
                    <>
                      <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                        {formatCurrency(row.grossRent, currency, false)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300 tabular-nums">
                        {formatCurrency(row.netRent, currency, false)}
                      </td>
                      {isAdvanced && (
                        <td className="py-2 px-3 text-right text-emerald-400 tabular-nums">
                          {row.taxSaved > 0 ? formatCurrency(row.taxSaved, currency, false) : '—'}
                        </td>
                      )}
                    </>
                  )}
                  <td className="py-2 px-3 text-right text-amber-300 tabular-nums">
                    {formatCurrency(row.propertyOutflowNet, currency, false)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-200 tabular-nums">
                    {formatCurrency(row.propertyValue, currency, true)}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400 font-semibold tabular-nums">
                    {formatCurrency(row.propertyEquity, currency, true)}
                  </td>
                  <td className="py-2 px-3 text-right text-blue-400 font-semibold tabular-nums">
                    {formatCurrency(row.alternativePortfolioValue, currency, true)}
                  </td>
                  <td
                    className={`py-2 px-3 text-right font-semibold tabular-nums ${
                      isLead ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isLead ? '+' : ''}
                    {formatCurrency(row.wealthGap, currency, true)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
