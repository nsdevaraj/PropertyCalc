import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { YearlyScheduleRow, CurrencyMode } from '../types/financial';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { TrendingUp, Layers, Info } from 'lucide-react';

interface TrajectoryChartProps {
  schedule: YearlyScheduleRow[];
  currency: CurrencyMode;
  tenureYears: number;
  initialDownPayment: number;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  schedule,
  currency,
  tenureYears,
  initialDownPayment,
}) => {
  const [viewMode, setViewMode] = useState<'equity' | 'gross'>('equity');

  // Chart data with Year 0 starting point
  const chartData = [
    {
      year: 0,
      label: 'Yr 0',
      propertyEquity: initialDownPayment,
      propertyValue: schedule[0] ? schedule[0].propertyValue / (1 + 0.07) : initialDownPayment * 5,
      alternativePortfolio: initialDownPayment,
      loanBalance: schedule[0] ? schedule[0].beginningLoanBalance : 0,
    },
    ...schedule.map((row) => ({
      year: row.year,
      label: `Yr ${row.year}`,
      propertyEquity: Math.round(row.propertyEquity),
      propertyValue: Math.round(row.propertyValue),
      alternativePortfolio: Math.round(row.alternativePortfolioValue),
      loanBalance: Math.round(row.endingLoanBalance),
    })),
  ];

  // Find crossover year if any
  let crossoverYear: number | null = null;
  for (let i = 1; i < chartData.length; i++) {
    const prev = chartData[i - 1];
    const curr = chartData[i];
    if (
      (prev.propertyEquity <= prev.alternativePortfolio && curr.propertyEquity > curr.alternativePortfolio) ||
      (prev.propertyEquity >= prev.alternativePortfolio && curr.propertyEquity < curr.alternativePortfolio)
    ) {
      crossoverYear = curr.year;
      break;
    }
  }

  const finalRow = schedule[schedule.length - 1];
  const finalPropEquity = finalRow ? finalRow.propertyEquity : 0;
  const finalAltPortfolio = finalRow ? finalRow.alternativePortfolioValue : 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              Wealth Accumulation Trajectory (0 – {tenureYears} Years)
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Comparing net liquid equity accumulation between the leveraged property and the disciplined alternative portfolio.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            onClick={() => setViewMode('equity')}
            className={`rounded px-2.5 py-1 transition-colors ${
              viewMode === 'equity'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Net Equity (Assets − Debt)
          </button>
          <button
            onClick={() => setViewMode('gross')}
            className={`rounded px-2.5 py-1 transition-colors ${
              viewMode === 'gross'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gross Asset & Debt
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="mt-6 h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              {/* Emerald Gradient for Property */}
              <linearGradient id="propEquityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Blue Gradient for Alternative */}
              <linearGradient id="altPortfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>

              {/* Slate Gradient for Loan */}
              <linearGradient id="loanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              tickLine={false}
              tickFormatter={(val) => `Yr ${val}`}
              fontSize={11}
            />
            <YAxis
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(val) => formatCurrency(val, currency, true, 1)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                const gap = d.propertyEquity - d.alternativePortfolio;
                return (
                  <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-xl backdrop-blur-md">
                    <div className="font-semibold text-white border-b border-slate-800 pb-1.5 mb-2">
                      Year {d.year} Breakdown
                    </div>
                    <div className="space-y-1.5 font-mono">
                      <div className="flex items-center justify-between gap-4 text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Property Net Equity:
                        </span>
                        <span className="font-semibold tabular-nums">
                          {formatCurrency(d.propertyEquity, currency, true)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-blue-400">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-400" />
                          Alternative Portfolio:
                        </span>
                        <span className="font-semibold tabular-nums">
                          {formatCurrency(d.alternativePortfolio, currency, true)}
                        </span>
                      </div>
                      {viewMode === 'gross' && (
                        <>
                          <div className="flex items-center justify-between gap-4 text-slate-300">
                            <span>Property Valuation:</span>
                            <span className="tabular-nums">{formatCurrency(d.propertyValue, currency, true)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-rose-400">
                            <span>Loan Remaining:</span>
                            <span className="tabular-nums">{formatCurrency(d.loanBalance, currency, true)}</span>
                          </div>
                        </>
                      )}
                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-slate-300">
                        <span>Net Gap:</span>
                        <span
                          className={`font-semibold tabular-nums ${
                            gap >= 0 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {gap >= 0 ? '+' : ''}
                          {formatCurrency(gap, currency, true)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {crossoverYear !== null && (
              <ReferenceLine
                x={crossoverYear}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `Crossover Yr ${crossoverYear}`,
                  fill: '#f59e0b',
                  fontSize: 11,
                  position: 'insideTopLeft',
                }}
              />
            )}

            {viewMode === 'equity' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="propertyEquity"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#propEquityGradient)"
                  name="Property Net Equity"
                />
                <Area
                  type="monotone"
                  dataKey="alternativePortfolio"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#altPortfolioGradient)"
                  name="Alternative Portfolio"
                />
              </>
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="propertyValue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#propEquityGradient)"
                  name="Property Valuation"
                />
                <Area
                  type="monotone"
                  dataKey="alternativePortfolio"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#altPortfolioGradient)"
                  name="Alternative Portfolio"
                />
                <Area
                  type="monotone"
                  dataKey="loanBalance"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  fill="url(#loanGradient)"
                  name="Loan Balance"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Key Takeaway */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300 font-medium">Property Net Equity</span>
            <span className="font-mono text-slate-400">({formatCurrency(finalPropEquity, currency, true)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300 font-medium">Alternative Portfolio</span>
            <span className="font-mono text-slate-400">({formatCurrency(finalAltPortfolio, currency, true)})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <span>Alternative assumes investing down payment lump sum + monthly net cash outflow</span>
        </div>
      </div>
    </div>
  );
};
