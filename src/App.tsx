import React, { useState, useMemo } from 'react';
import { CombinedInputs, CurrencyMode } from './types/financial';
import { PRESET_SCENARIOS } from './data/presets';
import { calculateAdvancedModel } from './utils/financialCalculations';
import { formatCurrency, formatPercent } from './utils/formatters';
import { TopBar } from './components/TopBar';
import { KPISummary } from './components/KPISummary';
import { InputControls } from './components/InputControls';
import { TrajectoryChart } from './components/TrajectoryChart';
import { CrossoverAnalysisChart } from './components/CrossoverAnalysisChart';
import { SensitivityTables } from './components/SensitivityTables';
import { CashFlowSchedule } from './components/CashFlowSchedule';
import { BreakevenSandbox } from './components/BreakevenSandbox';
import { SnapshotComparison } from './components/SnapshotComparison';
import { EducationalModal } from './components/EducationalModal';
import {
  TrendingUp,
  Table,
  FileSpreadsheet,
  Target,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  Zap,
  BookmarkCheck,
} from 'lucide-react';
import { SimulationSnapshot } from './types/financial';

export default function App() {
  const [inputs, setInputs] = useState<CombinedInputs>(PRESET_SCENARIOS[0].inputs);
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [currency, setCurrency] = useState<CurrencyMode>('INR');
  const [activeTab, setActiveTab] = useState<'overview' | 'crossover' | 'trajectory' | 'sensitivity' | 'matrix' | 'ledger' | 'snapshots' | 'sandbox'>('overview');
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  // Compute model results
  const results = useMemo(() => {
    return calculateAdvancedModel(inputs);
  }, [inputs]);

  // Base benchmark scenario results
  const baseScenarioInputs = PRESET_SCENARIOS[0].inputs;
  const baseResults = useMemo(() => {
    return calculateAdvancedModel(baseScenarioInputs);
  }, []);

  // Saved simulation snapshots with localStorage persistence
  const [snapshots, setSnapshots] = useState<SimulationSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('prop_alt_snapshots');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'initial_base_snap',
        name: '₹1 Cr Base Case (7% g)',
        createdAt: Date.now() - 3600000,
        inputs: { ...PRESET_SCENARIOS[0].inputs },
        results: calculateAdvancedModel(PRESET_SCENARIOS[0].inputs),
      },
    ];
  });

  const handleSaveSnapshot = (name: string) => {
    const newSnapshot: SimulationSnapshot = {
      id: `snap_${Date.now()}`,
      name,
      createdAt: Date.now(),
      inputs: { ...inputs },
      results: { ...results },
    };
    const next = [newSnapshot, ...snapshots];
    setSnapshots(next);
    try {
      localStorage.setItem('prop_alt_snapshots', JSON.stringify(next));
    } catch (e) {}
  };

  const handleDeleteSnapshot = (id: string) => {
    const next = snapshots.filter((s) => s.id !== id);
    setSnapshots(next);
    try {
      localStorage.setItem('prop_alt_snapshots', JSON.stringify(next));
    } catch (e) {}
  };

  const handleRestoreSnapshot = (snapInputs: CombinedInputs) => {
    setInputs(snapInputs);
    setActivePresetId('custom');
  };

  // Handlers
  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (found) {
      setInputs(found.inputs);
      setActivePresetId(presetId);
    }
  };

  const handleResetToBase = () => {
    handleSelectPreset(PRESET_SCENARIOS[0].id);
  };

  const handleUpdateInputs = (updated: Partial<CombinedInputs>) => {
    setInputs((prev) => ({
      ...prev,
      ...updated,
    }));
    setActivePresetId('custom');
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Year',
      'Beginning Loan Balance',
      'Annual EMI',
      'Principal Paid',
      'Interest Paid',
      'Ending Loan Balance',
      'Gross Rent',
      'Net Rent',
      'Tax Saved',
      'Property Net Outflow',
      'Property Valuation',
      'Property Net Equity',
      'Alternative Annual Invested',
      'Alternative Portfolio Value',
      'Wealth Gap (Prop - Alt)',
    ];

    const rows = results.schedule.map((r) => [
      r.year,
      Math.round(r.beginningLoanBalance),
      Math.round(r.annualEMI),
      Math.round(r.principalPaid),
      Math.round(r.interestPaid),
      Math.round(r.endingLoanBalance),
      Math.round(r.grossRent),
      Math.round(r.netRent),
      Math.round(r.taxSaved),
      Math.round(r.propertyOutflowNet),
      Math.round(r.propertyValue),
      Math.round(r.propertyEquity),
      Math.round(r.alternativeAnnualInvested),
      Math.round(r.alternativePortfolioValue),
      Math.round(r.wealthGap),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Property_vs_Alternative_Model_${inputs.tenureYears}Y.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (1 row, 3 zones) */}
      <TopBar
        currency={currency}
        onCurrencyToggle={setCurrency}
        onResetToBase={handleResetToBase}
        onOpenDocs={() => setIsDocsOpen(true)}
        activeSection={activeTab}
        onSelectSection={(sec) => setActiveTab(sec as any)}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-6 md:px-8 space-y-6">
        {/* KPI Summary Banner */}
        <KPISummary
          results={results}
          currentAppreciation={inputs.propertyAppreciation}
          currency={currency}
          tenureYears={inputs.tenureYears}
        />

        {/* Workspace Two-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Interactive Inputs & Scenarios (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <InputControls
              inputs={inputs}
              currency={currency}
              onChange={(updated) => {
                setInputs(updated);
                setActivePresetId('custom');
              }}
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
            />

            {/* Snapshot Comparison Feature */}
            <SnapshotComparison
              currentInputs={inputs}
              currentResults={results}
              baseInputs={baseScenarioInputs}
              baseResults={baseResults}
              snapshots={snapshots}
              currency={currency}
              onSaveSnapshot={handleSaveSnapshot}
              onDeleteSnapshot={handleDeleteSnapshot}
              onRestoreSnapshot={handleRestoreSnapshot}
            />

            {/* Quick Breakeven Tool below sliders */}
            <BreakevenSandbox
              inputs={inputs}
              currency={currency}
              onApplyInputs={handleUpdateInputs}
            />
          </div>

          {/* Right Column: Dynamic Analysis Views & Visualizations (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tab navigation inside workspace */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-2 text-xs font-medium overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Executive Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('crossover')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'crossover'
                    ? 'bg-slate-800 text-amber-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Crossover Analysis</span>
              </button>

              <button
                onClick={() => setActiveTab('trajectory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'trajectory'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>Wealth Trajectory</span>
              </button>

              <button
                onClick={() => setActiveTab('sensitivity')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'sensitivity'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Table className="h-3.5 w-3.5 text-blue-400" />
                <span>Sensitivity Tables</span>
              </button>

              <button
                onClick={() => setActiveTab('ledger')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'ledger'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-amber-400" />
                <span>Amortization Schedule</span>
              </button>

              <button
                onClick={() => setActiveTab('snapshots')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === 'snapshots'
                    ? 'bg-slate-800 text-emerald-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Snapshots ({snapshots.length})</span>
              </button>
            </div>

            {/* Active View Display */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Visual Centerpiece: Crossover Analysis Chart */}
                <CrossoverAnalysisChart
                  schedule={results.schedule}
                  currency={currency}
                  tenureYears={inputs.tenureYears}
                  initialDownPayment={results.downPayment}
                  propertyAppreciation={inputs.propertyAppreciation}
                  alternativeReturn={inputs.alternativeReturn}
                  onUpdateAppreciation={(g) => handleUpdateInputs({ propertyAppreciation: g })}
                  onUpdateAltReturn={(r) => handleUpdateInputs({ alternativeReturn: r })}
                />

                {/* Additional Insight Matrix Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                    <span className="text-slate-400 text-[11px] block">Total Rent Offset</span>
                    <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                      {formatCurrency(results.totalRentalIncomeCollected, currency, true)}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Collected over {inputs.tenureYears} years
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                    <span className="text-slate-400 text-[11px] block">Net Capital Outflow</span>
                    <span className="text-base font-bold font-mono text-amber-400 mt-1 block">
                      {formatCurrency(results.totalNetOutflowOverTenure, currency, true)}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Out of pocket after rent offsets
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
                    <span className="text-slate-400 text-[11px] block">Exit Capital Gains Tax</span>
                    <span className="text-base font-bold font-mono text-slate-200 mt-1 block">
                      {formatCurrency(results.propertyFV - results.netSaleProceedsProperty, currency, true)}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Estimated at 12.5% LTCG
                    </span>
                  </div>
                </div>

                {/* Embedded Quick Sensitivity Preview */}
                <SensitivityTables
                  inputs={inputs}
                  currency={currency}
                  onApplyAppreciation={(g) => handleUpdateInputs({ propertyAppreciation: g })}
                  onApplyRent={(r) => handleUpdateInputs({ monthlyRent: r })}
                  onApplyRate={(rate) => handleUpdateInputs({ loanInterestRate: rate })}
                />
              </div>
            )}

            {activeTab === 'crossover' && (
              <div className="space-y-6">
                <CrossoverAnalysisChart
                  schedule={results.schedule}
                  currency={currency}
                  tenureYears={inputs.tenureYears}
                  initialDownPayment={results.downPayment}
                  propertyAppreciation={inputs.propertyAppreciation}
                  alternativeReturn={inputs.alternativeReturn}
                  onUpdateAppreciation={(g) => handleUpdateInputs({ propertyAppreciation: g })}
                  onUpdateAltReturn={(r) => handleUpdateInputs({ alternativeReturn: r })}
                />

                <TrajectoryChart
                  schedule={results.schedule}
                  currency={currency}
                  tenureYears={inputs.tenureYears}
                  initialDownPayment={results.downPayment}
                />
              </div>
            )}

            {activeTab === 'trajectory' && (
              <TrajectoryChart
                schedule={results.schedule}
                currency={currency}
                tenureYears={inputs.tenureYears}
                initialDownPayment={results.downPayment}
              />
            )}

            {(activeTab === 'sensitivity' || activeTab === 'matrix') && (
              <SensitivityTables
                inputs={inputs}
                currency={currency}
                onApplyAppreciation={(g) => handleUpdateInputs({ propertyAppreciation: g })}
                onApplyRent={(r) => handleUpdateInputs({ monthlyRent: r })}
                onApplyRate={(rate) => handleUpdateInputs({ loanInterestRate: rate })}
              />
            )}

            {activeTab === 'ledger' && (
              <CashFlowSchedule
                schedule={results.schedule}
                currency={currency}
                onExportCSV={handleExportCSV}
                isAdvanced={inputs.enableAdvancedModel}
              />
            )}

            {activeTab === 'snapshots' && (
              <div className="space-y-6">
                <SnapshotComparison
                  currentInputs={inputs}
                  currentResults={results}
                  baseInputs={baseScenarioInputs}
                  baseResults={baseResults}
                  snapshots={snapshots}
                  currency={currency}
                  onSaveSnapshot={handleSaveSnapshot}
                  onDeleteSnapshot={handleDeleteSnapshot}
                  onRestoreSnapshot={handleRestoreSnapshot}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-4 md:px-8 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Leveraged Rental Property vs Alternative Investment Model</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Formal ₹1 Cr Benchmark Simulation</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDocsOpen(true)}
            className="hover:text-slate-200 underline decoration-slate-600 underline-offset-2"
          >
            Mathematical Formulas & Invariants
          </button>
          <span>All returns nominal before investor-specific inflation adjustments</span>
        </div>
      </footer>

      {/* Methodology & Formulas Modal */}
      <EducationalModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
