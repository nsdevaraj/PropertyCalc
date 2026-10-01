import React, { useState } from 'react';
import { CombinedInputs, CurrencyMode } from '../types/financial';
import { PRESET_SCENARIOS } from '../data/presets';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { Sliders, ChevronDown, ChevronUp, Sparkles, Building, Landmark, Percent, Clock } from 'lucide-react';

interface InputControlsProps {
  inputs: CombinedInputs;
  currency: CurrencyMode;
  onChange: (inputs: CombinedInputs) => void;
  onSelectPreset: (presetId: string) => void;
  activePresetId?: string;
}

export const InputControls: React.FC<InputControlsProps> = ({
  inputs,
  currency,
  onChange,
  onSelectPreset,
  activePresetId,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(inputs.enableAdvancedModel);

  const updateField = <K extends keyof CombinedInputs>(field: K, val: CombinedInputs[K]) => {
    onChange({
      ...inputs,
      [field]: val,
    });
  };

  const calculatedLoan = inputs.propertyPrice * (1 - inputs.downPaymentPercent / 100);
  const calculatedDownPayment = inputs.propertyPrice * (inputs.downPaymentPercent / 100);

  return (
    <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      {/* Header and Scenario selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Interactive Parameters</h3>
          </div>
          <span className="text-xs text-slate-400">Real-time simulation</span>
        </div>

        {/* Preset Selector */}
        <div>
          <label className="text-xs font-medium text-slate-400">Load Benchmark Scenario</label>
          <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {PRESET_SCENARIOS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold text-white">{preset.name}</span>
                    {preset.badge && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Primary 7 Variables */}
      <div className="space-y-4">
        {/* 1. Property Price (P) */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-300">Property Price (P)</label>
            <span className="font-mono font-semibold text-white tabular-nums">
              {formatCurrency(inputs.propertyPrice, currency, false)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="range"
              min={2500000}
              max={50000000}
              step={500000}
              value={inputs.propertyPrice}
              onChange={(e) => updateField('propertyPrice', parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>₹25 L</span>
            <span>₹1.0 Cr (Base)</span>
            <span>₹2.5 Cr</span>
            <span>₹5.0 Cr</span>
          </div>
        </div>

        {/* 2. Down Payment % (d) */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-300">Down Payment % (d)</label>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="font-semibold text-white">{inputs.downPaymentPercent}%</span>
              <span className="text-slate-400 text-[11px]">
                ({formatCurrency(calculatedDownPayment, currency, true)})
              </span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="range"
              min={10}
              max={50}
              step={1}
              value={inputs.downPaymentPercent}
              onChange={(e) => updateField('downPaymentPercent', parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Loan Amount: <strong className="text-slate-300 font-mono">{formatCurrency(calculatedLoan, currency, true)}</strong></span>
            <span>Equity: <strong className="text-slate-300 font-mono">{inputs.downPaymentPercent}%</strong></span>
          </div>
        </div>

        {/* 3. Loan Interest Rate (i) & Tenure (T) in 2-col */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-300">Loan Interest Rate (i)</label>
              <span className="font-mono font-semibold text-white tabular-nums">
                {inputs.loanInterestRate.toFixed(1)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={6.0}
              max={12.0}
              step={0.1}
              value={inputs.loanInterestRate}
              onChange={(e) => updateField('loanInterestRate', parseFloat(e.target.value))}
              className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>6%</span>
              <span>8% (Base)</span>
              <span>12%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-300">Loan Tenure (T)</label>
              <span className="font-mono font-semibold text-white tabular-nums">
                {inputs.tenureYears} Years
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={inputs.tenureYears}
              onChange={(e) => updateField('tenureYears', parseInt(e.target.value, 10))}
              className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>5y</span>
              <span>20y (Base)</span>
              <span>30y</span>
            </div>
          </div>
        </div>

        {/* 4. Monthly Starting Rent (R) */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-300">Monthly Rent (R)</label>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="font-semibold text-white">{formatCurrency(inputs.monthlyRent, currency, false)}</span>
              <span className="text-[11px] text-slate-400">
                ({((inputs.monthlyRent * 12 / inputs.propertyPrice) * 100).toFixed(2)}% gross yield)
              </span>
            </div>
          </div>
          <input
            type="range"
            min={10000}
            max={150000}
            step={1000}
            value={inputs.monthlyRent}
            onChange={(e) => updateField('monthlyRent', parseFloat(e.target.value))}
            className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-500 font-mono">
            <span>₹10,000</span>
            <span>₹25,000 (Base)</span>
            <span>₹60,000</span>
            <span>₹1.5 L</span>
          </div>
        </div>

        {/* 5. Expected Property Appreciation (g) vs Alternative Return (r) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-300">Property Appreciation (g)</label>
              <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                {inputs.propertyAppreciation.toFixed(1)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={2.0}
              max={14.0}
              step={0.5}
              value={inputs.propertyAppreciation}
              onChange={(e) => updateField('propertyAppreciation', parseFloat(e.target.value))}
              className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>3%</span>
              <span>7% (Base)</span>
              <span>10%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-300">Alternative Return (r)</label>
              <span className="font-mono font-semibold text-blue-400 tabular-nums">
                {inputs.alternativeReturn.toFixed(1)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={5.0}
              max={16.0}
              step={0.5}
              value={inputs.alternativeReturn}
              onChange={(e) => updateField('alternativeReturn', parseFloat(e.target.value))}
              className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-blue-500"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>7% (Debt)</span>
              <span>10% (Base)</span>
              <span>14% (Equity)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced / Real-World Model Toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            const next = !showAdvanced;
            setShowAdvanced(next);
            updateField('enableAdvancedModel', next);
          }}
          className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span>Real-World Friction Model (Taxes, Vacancy, Maintenance, Stamp Duty)</span>
          </div>
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3.5 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
            <div className="text-[11px] text-slate-400 leading-relaxed">
              Real estate incurs transaction friction, ongoing maintenance, and tenant vacancies. Meanwhile, the stock market or debt funds enjoy liquidity and different tax brackets.
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Stamp Duty */}
              <div>
                <label className="text-[11px] font-medium text-slate-300">
                  Stamp Duty & Registration: {inputs.stampDutyPercent}%
                </label>
                <input
                  type="range"
                  min={3}
                  max={9}
                  step={0.5}
                  value={inputs.stampDutyPercent}
                  onChange={(e) => updateField('stampDutyPercent', parseFloat(e.target.value))}
                  className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500 font-mono">
                  Upfront cost: {formatCurrency(inputs.propertyPrice * (inputs.stampDutyPercent / 100), currency, true)}
                </span>
              </div>

              {/* Furnishing Cost */}
              <div>
                <label className="text-[11px] font-medium text-slate-300">
                  Interiors / Furnishing: {formatCurrency(inputs.furnishingCost, currency, true)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={2000000}
                  step={50000}
                  value={inputs.furnishingCost}
                  onChange={(e) => updateField('furnishingCost', parseFloat(e.target.value))}
                  className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                />
              </div>

              {/* Annual Rent Escalation */}
              <div>
                <label className="text-[11px] font-medium text-slate-300">
                  Annual Rent Escalation: {inputs.annualRentGrowth}% p.a.
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={inputs.annualRentGrowth}
                  onChange={(e) => updateField('annualRentGrowth', parseFloat(e.target.value))}
                  className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                />
              </div>

              {/* Vacancy Rate */}
              <div>
                <label className="text-[11px] font-medium text-slate-300">
                  Vacancy Rate: {inputs.vacancyRatePercent}% (approx {((inputs.vacancyRatePercent / 100) * 12).toFixed(1)} mo/yr)
                </label>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={1}
                  value={inputs.vacancyRatePercent}
                  onChange={(e) => updateField('vacancyRatePercent', parseFloat(e.target.value))}
                  className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                />
              </div>

              {/* Annual Maintenance */}
              <div>
                <label className="text-[11px] font-medium text-slate-300">
                  Annual Maintenance: {inputs.annualMaintenancePercent}% of property value
                </label>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={inputs.annualMaintenancePercent}
                  onChange={(e) => updateField('annualMaintenancePercent', parseFloat(e.target.value))}
                  className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                />
              </div>

              {/* Tax Bracket & Sec 24 Deduction */}
              <div>
                <label className="text-[11px] font-medium text-slate-300">
                  Investor Tax Bracket: {inputs.marginalTaxBracket}%
                </label>
                <select
                  value={inputs.marginalTaxBracket}
                  onChange={(e) => updateField('marginalTaxBracket', parseFloat(e.target.value))}
                  className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={20}>20% (Mid bracket)</option>
                  <option value={30}>30% (Standard high bracket)</option>
                  <option value={39}>39% (High surcharge)</option>
                </select>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="taxDeduct"
                    checked={inputs.enableTaxDeductions}
                    onChange={(e) => updateField('enableTaxDeductions', e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500"
                  />
                  <label htmlFor="taxDeduct" className="text-[11px] text-slate-400">
                    Apply Sec 24(b) loan interest tax deduction
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
