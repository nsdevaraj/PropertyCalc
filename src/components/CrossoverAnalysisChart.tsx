import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { YearlyScheduleRow, CurrencyMode, CombinedInputs } from '../types/financial';
import { formatCurrency, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  Zap,
  Clock,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface CrossoverAnalysisChartProps {
  schedule: YearlyScheduleRow[];
  currency: CurrencyMode;
  tenureYears: number;
  initialDownPayment: number;
  propertyAppreciation: number;
  alternativeReturn: number;
  inflationRate?: number;
  onUpdateAppreciation?: (g: number) => void;
  onUpdateAltReturn?: (r: number) => void;
}

export interface CrossoverPoint {
  hasCrossover: boolean;
  exactYear: number; // e.g. 14.2
  displayYear: string; // "Year 14, Month 3"
  crossValue: number; // ₹ at crossover
  priorLeader: 'property' | 'alternative';
  newLeader: 'property' | 'alternative';
  initialLeader: 'property' | 'alternative';
  finalLeader: 'property' | 'alternative';
}

export const CrossoverAnalysisChart: React.FC<CrossoverAnalysisChartProps> = ({
  schedule,
  currency,
  tenureYears,
  initialDownPayment,
  propertyAppreciation,
  alternativeReturn,
  inflationRate = 5.0,
  onUpdateAppreciation,
  onUpdateAltReturn,
}) => {
  const [viewType, setViewType] = useState<'growth' | 'real' | 'delta'>('growth');

  // Build continuous data from Year 0 to Year T
  const fullData = useMemo(() => {
    const list = [
      {
        year: 0,
        label: 'Yr 0',
        propertyEquity: Math.round(initialDownPayment),
        realPropertyEquity: Math.round(initialDownPayment),
        alternativePortfolio: Math.round(initialDownPayment),
        realAlternativePortfolio: Math.round(initialDownPayment),
        netDelta: 0,
        leader: 'tied' as const,
      },
      ...schedule.map((row) => {
        const pEquity = Math.round(row.propertyEquity);
        const aPort = Math.round(row.alternativePortfolioValue);
        const delta = pEquity - aPort;
        return {
          year: row.year,
          label: `Yr ${row.year}`,
          propertyEquity: pEquity,
          realPropertyEquity: Math.round(row.realPropertyEquity),
          alternativePortfolio: aPort,
          realAlternativePortfolio: Math.round(row.realAlternativePortfolioValue),
          netDelta: delta,
          leader: delta >= 0 ? ('property' as const) : ('alternative' as const),
        };
      }),
    ];
    return list;
  }, [schedule, initialDownPayment]);

  // Compute exact crossover point with linear interpolation
  const crossover = useMemo<CrossoverPoint>(() => {
    if (!fullData || fullData.length < 2) {
      return {
        hasCrossover: false,
        exactYear: 0,
        displayYear: 'None',
        crossValue: 0,
        priorLeader: 'alternative',
        newLeader: 'property',
        initialLeader: 'alternative',
        finalLeader: 'property',
      };
    }

    const firstPoint = fullData[0];
    const secondPoint = fullData[1];
    const lastPoint = fullData[fullData.length - 1];

    const initialLeader =
      secondPoint.propertyEquity >= secondPoint.alternativePortfolio ? 'property' : 'alternative';
    const finalLeader =
      lastPoint.propertyEquity >= lastPoint.alternativePortfolio ? 'property' : 'alternative';

    for (let i = 1; i < fullData.length; i++) {
      const prev = fullData[i - 1];
      const curr = fullData[i];

      const prevDelta = prev.propertyEquity - prev.alternativePortfolio;
      const currDelta = curr.propertyEquity - curr.alternativePortfolio;

      // If signs differ (ignoring Year 0 where both equal down payment)
      if (i > 1 && ((prevDelta < 0 && currDelta >= 0) || (prevDelta > 0 && currDelta <= 0))) {
        // Linear interpolation to find the exact fraction of year
        const slopeP = curr.propertyEquity - prev.propertyEquity;
        const slopeA = curr.alternativePortfolio - prev.alternativePortfolio;
        const deltaSlope = slopeP - slopeA;

        let fraction = 0.5;
        if (Math.abs(deltaSlope) > 1e-4) {
          fraction = (prev.alternativePortfolio - prev.propertyEquity) / deltaSlope;
          fraction = Math.max(0.01, Math.min(0.99, fraction));
        }

        const exactYear = prev.year + fraction;
        const totalMonths = Math.round(exactYear * 12);
        const wholeYears = Math.floor(exactYear);
        const remainderMonths = Math.round((exactYear - wholeYears) * 12);

        const crossVal =
          prev.propertyEquity + fraction * (curr.propertyEquity - prev.propertyEquity);

        const priorLeader = prevDelta >= 0 ? 'property' : 'alternative';
        const newLeader = currDelta >= 0 ? 'property' : 'alternative';

        return {
          hasCrossover: true,
          exactYear: parseFloat(exactYear.toFixed(1)),
          displayYear: `Year ${wholeYears}, Month ${remainderMonths}`,
          crossValue: Math.round(crossVal),
          priorLeader,
          newLeader,
          initialLeader,
          finalLeader,
        };
      }
    }

    // Check if initial year 1 had a crossover from 0
    return {
      hasCrossover: false,
      exactYear: 0,
      displayYear: 'No Crossover within Horizon',
      crossValue: 0,
      priorLeader: initialLeader,
      newLeader: finalLeader,
      initialLeader,
      finalLeader,
    };
  }, [fullData]);

  // Milestone points for comparison table (Year 0, 5, 10, 15, 20)
  const milestones = useMemo(() => {
    const yearsToShow = [0, 5, 10, 15, 20].filter((y) => y <= tenureYears);
    if (!yearsToShow.includes(tenureYears)) {
      yearsToShow.push(tenureYears);
    }

    return yearsToShow.map((yr) => {
      const point = fullData.find((d) => d.year === yr) || fullData[fullData.length - 1];
      const gap = point.propertyEquity - point.alternativePortfolio;
      return {
        year: yr,
        propertyEquity: point.propertyEquity,
        alternativePortfolio: point.alternativePortfolio,
        gap,
        leader: gap >= 0 ? ('property' as const) : ('alternative' as const),
      };
    });
  }, [fullData, tenureYears]);

  return (
    <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white">
              Strategy Crossover Analysis: Property Net Equity vs Alternative Portfolio
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Identifies the tipping point where real estate leverage outcompounds or falls behind liquid market compounding.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            onClick={() => setViewType('growth')}
            className={`rounded px-2.5 py-1 transition-colors ${
              viewType === 'growth'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nominal Growth
          </button>
          <button
            onClick={() => setViewType('real')}
            className={`rounded px-2.5 py-1 transition-colors ${
              viewType === 'real'
                ? 'bg-amber-500/20 text-amber-300 font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Real (Inflation-Adj)
          </button>
          <button
            onClick={() => setViewType('delta')}
            className={`rounded px-2.5 py-1 transition-colors ${
              viewType === 'delta'
                ? 'bg-slate-800 text-white font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Net Spread (Prop − Alt)
          </button>
        </div>
      </div>

      {/* Crossover Intelligence Highlight Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>Crossover Detection Engine</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono text-slate-300">
                {tenureYears}-Year Horizon
              </span>
            </div>

            {crossover.hasCrossover ? (
              <div>
                <h4 className="text-lg font-bold text-white md:text-xl flex items-center gap-2">
                  <span className="text-amber-400 font-mono">
                    Crossover Occurs at {crossover.displayYear}
                  </span>
                  <span className="text-xs text-slate-400 font-sans font-normal">
                    (Yr {crossover.exactYear})
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Before <span className="font-semibold text-slate-200 font-mono">Yr {crossover.exactYear}</span>, the{' '}
                  <span className="text-blue-400 font-semibold font-mono">
                    {crossover.priorLeader === 'alternative' ? 'Alternative Portfolio' : 'Property Equity'}
                  </span>{' '}
                  leads due to high early mortgage interest drag. At the crossover value of{' '}
                  <span className="font-semibold text-emerald-400 font-mono tabular-nums">
                    {formatCurrency(crossover.crossValue, currency, true)}
                  </span>
                  , debt paydown and continuous property appreciation trigger the leverage crossover, placing{' '}
                  <span className="text-emerald-400 font-semibold font-mono">
                    {crossover.newLeader === 'property' ? 'Property Net Equity' : 'Alternative Portfolio'}
                  </span>{' '}
                  in the lead through Year {tenureYears}.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-lg font-bold text-white md:text-xl">
                  {crossover.finalLeader === 'property' ? (
                    <span className="text-emerald-400">
                      Property Leads from Day 1 through Year {tenureYears}
                    </span>
                  ) : (
                    <span className="text-blue-400">
                      Alternative Portfolio Leads Continuously (No Crossover)
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {crossover.finalLeader === 'alternative' ? (
                    <>
                      At an appreciation rate of <strong className="text-white font-mono">{formatPercent(propertyAppreciation)}</strong> against <strong className="text-blue-400 font-mono">{formatPercent(alternativeReturn)}</strong> alternative return, the property never catches up within the {tenureYears}-year window. Increase appreciation or reduce loan interest to trigger a crossover.
                    </>
                  ) : (
                    <>
                      Strong property appreciation ensures Property Net Equity remains superior across the entire {tenureYears}-year loan tenure.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex shrink-0 items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs">
            <div>
              <div className="text-slate-400 text-[11px]">Tipping Point Year</div>
              <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-0.5">
                {crossover.hasCrossover ? `Yr ${crossover.exactYear}` : 'None'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-slate-400 text-[11px]">Wealth at Crossover</div>
              <div className="text-base font-semibold font-mono text-white tabular-nums mt-0.5">
                {crossover.hasCrossover
                  ? formatCurrency(crossover.crossValue, currency, true)
                  : 'N/A'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-slate-400 text-[11px]">Final Lead (Yr {tenureYears})</div>
              <div
                className={`text-base font-bold font-mono tabular-nums mt-0.5 ${
                  fullData[fullData.length - 1].netDelta >= 0
                    ? 'text-emerald-400'
                    : 'text-blue-400'
                }`}
              >
                {formatCurrency(
                  Math.abs(fullData[fullData.length - 1].netDelta),
                  currency,
                  true
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewType !== 'delta' ? (
            <ComposedChart data={fullData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="propArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="altArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
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
                  const pVal = viewType === 'real' ? d.realPropertyEquity : d.propertyEquity;
                  const aVal = viewType === 'real' ? d.realAlternativePortfolio : d.alternativePortfolio;
                  const delta = pVal - aVal;
                  const isCurrentCrossoverYear =
                    crossover.hasCrossover && Math.abs(d.year - Math.round(crossover.exactYear)) === 0;

                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 gap-4">
                        <span className="font-semibold text-white">Year {d.year} Milestone</span>
                        {isCurrentCrossoverYear && (
                          <span className="text-[10px] text-amber-400 font-mono font-semibold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                            ★ Crossover Zone
                          </span>
                        )}
                        {viewType === 'real' && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            Real Money
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 font-mono">
                        <div className="flex items-center justify-between gap-5 text-emerald-400">
                          <span className="flex items-center gap-1.5 font-sans">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Property {viewType === 'real' ? 'Real' : 'Net'} Equity:
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatCurrency(pVal, currency, true)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-5 text-blue-400">
                          <span className="flex items-center gap-1.5 font-sans">
                            <span className="h-2 w-2 rounded-full bg-blue-400" />
                            Alternative {viewType === 'real' ? 'Real' : ''} Portfolio:
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatCurrency(aVal, currency, true)}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-5 text-slate-300">
                          <span className="font-sans">Wealth Spread:</span>
                          <span
                            className={`font-semibold tabular-nums ${
                              delta >= 0 ? 'text-emerald-400' : 'text-blue-400'
                            }`}
                          >
                            {delta >= 0 ? '+' : ''}
                            {formatCurrency(delta, currency, true)}{' '}
                            <span className="text-[10px] font-sans font-normal text-slate-400">
                              ({delta >= 0 ? 'Property leads' : 'Alternative leads'})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Crossover Reference Line */}
              {crossover.hasCrossover && (
                <ReferenceLine
                  x={crossover.exactYear}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `Crossover: Yr ${crossover.exactYear}`,
                    fill: '#f59e0b',
                    fontSize: 11,
                    position: 'insideTopRight',
                    fontWeight: 600,
                  }}
                />
              )}

              {/* Area & Lines */}
              <Area
                type="monotone"
                dataKey={viewType === 'real' ? 'realPropertyEquity' : 'propertyEquity'}
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#propArea)"
                name={viewType === 'real' ? 'Property Real Equity' : 'Property Net Equity'}
              />
              <Area
                type="monotone"
                dataKey={viewType === 'real' ? 'realAlternativePortfolio' : 'alternativePortfolio'}
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#altArea)"
                name={viewType === 'real' ? 'Alternative Real Portfolio' : 'Alternative Portfolio'}
              />
            </ComposedChart>
          ) : (
            /* Delta Curve View */
            <ComposedChart data={fullData} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
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
                  return (
                    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-xl backdrop-blur-md font-mono">
                      <div className="font-semibold text-white pb-1 border-b border-slate-800">
                        Year {d.year} Net Spread
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-4">
                        <span className="text-slate-400 font-sans">Spread (Prop − Alt):</span>
                        <span
                          className={`font-semibold tabular-nums ${
                            d.netDelta >= 0 ? 'text-emerald-400' : 'text-blue-400'
                          }`}
                        >
                          {d.netDelta >= 0 ? '+' : ''}
                          {formatCurrency(d.netDelta, currency, true)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
              {crossover.hasCrossover && (
                <ReferenceLine
                  x={crossover.exactYear}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `Zero Cross Yr ${crossover.exactYear}`,
                    fill: '#f59e0b',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="netDelta"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ stroke: '#10b981', strokeWidth: 1.5, r: 3, fill: '#0f172a' }}
                activeDot={{ r: 6, fill: '#10b981' }}
                name="Net Spread"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Milestone Breakdown Table */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            5-Year Milestone Progress Comparison
          </span>
          <span className="text-[11px] text-slate-500">
            Green = Property leads · Blue = Alternative leads
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-950 font-sans font-medium text-slate-400">
              <tr>
                <th className="py-2 px-3">Timeline</th>
                <th className="py-2 px-3 text-right text-emerald-400">Property Net Equity</th>
                <th className="py-2 px-3 text-right text-blue-400">Alternative Portfolio</th>
                <th className="py-2 px-3 text-right">Net Spread (Prop − Alt)</th>
                <th className="py-2 px-3 text-center font-sans">Dominant Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {milestones.map((m) => {
                const isProperty = m.leader === 'property';
                return (
                  <tr key={m.year} className="transition-colors hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-sans font-semibold text-white">
                      Year {m.year} {m.year === 0 ? '(Initial)' : ''}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200 tabular-nums">
                      {formatCurrency(m.propertyEquity, currency, true)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200 tabular-nums">
                      {formatCurrency(m.alternativePortfolio, currency, true)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-semibold tabular-nums ${
                        m.gap >= 0 ? 'text-emerald-400' : 'text-blue-400'
                      }`}
                    >
                      {m.gap >= 0 ? '+' : ''}
                      {formatCurrency(m.gap, currency, true)}
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      {m.year === 0 ? (
                        <span className="text-slate-400 text-[11px]">Equal Down Payment</span>
                      ) : isProperty ? (
                        <span className="text-emerald-400 font-medium">Property (+{formatCurrency(m.gap, currency, true)})</span>
                      ) : (
                        <span className="text-blue-400 font-medium">Alternative (+{formatCurrency(Math.abs(m.gap), currency, true)})</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Scrubber Controls if handlers provided */}
      {(onUpdateAppreciation || onUpdateAltReturn) && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Interactive Crossover Sensitivity Scrubbers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {onUpdateAppreciation && (
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Property Appreciation (g):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {propertyAppreciation.toFixed(1)}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min={3.0}
                  max={12.0}
                  step={0.5}
                  value={propertyAppreciation}
                  onChange={(e) => onUpdateAppreciation(parseFloat(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                />
              </div>
            )}

            {onUpdateAltReturn && (
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Alternative Return (r):</span>
                  <span className="font-mono font-bold text-blue-400">
                    {alternativeReturn.toFixed(1)}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min={6.0}
                  max={15.0}
                  step={0.5}
                  value={alternativeReturn}
                  onChange={(e) => onUpdateAltReturn(parseFloat(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
