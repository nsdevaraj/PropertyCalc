import React, { useState } from 'react';
import { BaseInputs, CurrencyMode } from '../types/financial';
import { solveBreakevenRent } from '../utils/sensitivityAnalysis';
import { calculateBaseModel } from '../utils/financialCalculations';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Target, Zap, ArrowRight, Check } from 'lucide-react';

interface BreakevenSandboxProps {
  inputs: BaseInputs;
  currency: CurrencyMode;
  onApplyInputs: (updated: Partial<BaseInputs>) => void;
}

export const BreakevenSandbox: React.FC<BreakevenSandboxProps> = ({
  inputs,
  currency,
  onApplyInputs,
}) => {
  const [targetGrowth, setTargetGrowth] = useState<number>(inputs.propertyAppreciation);
  const baseResult = calculateBaseModel(inputs);

  const neededRent = solveBreakevenRent(inputs, targetGrowth);
  const currentRent = inputs.monthlyRent;
  const rentDelta = neededRent - currentRent;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Target className="h-4 w-4 text-emerald-400" />
        <div>
          <h3 className="text-base font-semibold text-white">Reverse Breakeven Solver (Goal Seek)</h3>
          <p className="text-xs text-slate-400">
            Determine what monthly rental yield or capital appreciation is required to match your alternative portfolio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Solver 1: Given appreciation X%, what rent is required? */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">
              Target Property Appreciation
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {targetGrowth.toFixed(1)}% p.a.
            </span>
          </div>

          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={targetGrowth}
            onChange={(e) => setTargetGrowth(parseFloat(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
          />

          <div className="rounded-md border border-slate-800/80 bg-slate-900/80 p-3 space-y-1.5">
            <div className="text-[11px] text-slate-400">Required Monthly Rent to Break Even:</div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {formatCurrency(neededRent, currency, false)}
              <span className="ml-1.5 text-xs font-normal text-slate-400">
                ({((neededRent * 12 / inputs.propertyPrice) * 100).toFixed(2)}% gross yield)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">Compared to current rent:</span>
              <span
                className={`font-mono font-semibold ${
                  rentDelta <= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {rentDelta <= 0 ? '✓ Already achievable' : `+${formatCurrency(rentDelta, currency, false)} more required`}
              </span>
            </div>
          </div>

          {neededRent > 0 && (
            <button
              onClick={() => onApplyInputs({ monthlyRent: neededRent, propertyAppreciation: targetGrowth })}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-900/40"
            >
              <span>Apply Breakeven Rent ({formatCurrency(neededRent, currency, false)}) to Model</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Solver 2: Hurdle Rate Analysis */}
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <span className="text-xs font-semibold text-white">
            Current Hurdle Rate Summary
          </span>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Alternative Portfolio Hurdle:</span>
              <span className="font-mono font-semibold text-blue-400">
                {inputs.alternativeReturn}% p.a.
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Required Property Appreciation (g*):</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatPercent(baseResult.requiredAppreciationPercent)}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Monthly Net Outflow Burden:</span>
              <span className="font-mono text-amber-300">
                {formatCurrency(baseResult.netMonthlyOutflow, currency, false)} / mo
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Alternative Compounded FV:</span>
              <span className="font-mono font-semibold text-white">
                {formatCurrency(baseResult.alternativeFV, currency, true)}
              </span>
            </div>
          </div>

          <div className="rounded border border-slate-800 bg-slate-900/40 p-2.5 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Financial Insight:</strong> Because real estate leverage amplifies capital gains, a 7.84% property price appreciation matches a 10% pure equity portfolio, provided rental cash flows remain continuous and vacancy is minimized.
          </div>
        </div>
      </div>
    </div>
  );
};
