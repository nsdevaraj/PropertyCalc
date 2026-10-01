import React from 'react';
import { X, BookOpen, Calculator, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Financial Data Model & Methodology Reference
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: Core Formulas */}
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-400" />
              1. Mathematical Formulas (As Specified in Model)
            </h3>
            
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                <div className="font-semibold text-emerald-400">Monthly Loan EMI</div>
                <div className="font-mono bg-slate-950 p-2 rounded text-slate-200">
                  EMI = L · [ r_m(1+r_m)^n ] / [ (1+r_m)^n − 1 ]
                </div>
                <div className="text-slate-400 text-[11px]">
                  where r_m = i / 12 and n = T × 12 months.
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                <div className="font-semibold text-emerald-400">Net Monthly Outflow</div>
                <div className="font-mono bg-slate-950 p-2 rounded text-slate-200">
                  Net Outflow = EMI − R
                </div>
                <div className="text-slate-400 text-[11px]">
                  The cash dragged out of pocket each month after rental income R.
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                <div className="font-semibold text-emerald-400">Property Future Value</div>
                <div className="font-mono bg-slate-950 p-2 rounded text-slate-200">
                  FV_prop = P × (1 + g)^T
                </div>
                <div className="text-slate-400 text-[11px]">
                  Continuous compounding of initial purchase price at appreciation g.
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-1.5">
                <div className="font-semibold text-emerald-400">Alternative Compounded Portfolio</div>
                <div className="font-mono bg-slate-950 p-2 rounded text-slate-200">
                  FV_alt = Down(1+r)^T + Net · [ (1+r_m)^n − 1 ] / r_m
                </div>
                <div className="text-slate-400 text-[11px]">
                  Down payment lump sum compounded + monthly net outflow annuity.
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3.5">
              <div className="text-xs font-semibold text-emerald-300">
                Required Breakeven Appreciation Rate (g*):
              </div>
              <div className="mt-1 font-mono text-xs text-white">
                g* = [ (FV_alt / P)^(1 / T) ] − 1
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                In the base ₹1 Cr case with 10% alternative return, g* = 7.84% p.a.
              </div>
            </div>
          </div>

          {/* Section 2: Intuition & The Leverage Paradox */}
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              2. Intuition: Why Does 7.84% Property Match a 10% Portfolio?
            </h3>
            <div className="mt-2 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Leverage Amplification:</strong> You put down ₹20 Lakhs to control a ₹1 Crore asset (5x initial leverage). Any capital appreciation (say, 7%) applies to the entire ₹1 Crore property, not just your equity.
              </p>
              <p>
                <strong className="text-white">The Cost of Debt:</strong> However, borrowing ₹80 Lakhs at 8% for 20 years requires paying ₹1.61 Crore in total EMI, of which <span className="text-rose-400 font-semibold font-mono">₹80.6 Lakhs is pure interest paid to the bank</span>.
              </p>
              <p>
                <strong className="text-white">The Opportunity Cost of Monthly Cash Outflow:</strong> With rent at ₹25,000 and EMI at ₹66,915, you must inject ₹41,915 out of pocket every single month. An alternative investor systematically investing ₹41,915/month at 10% accumulates <span className="text-blue-400 font-semibold font-mono">₹3.18 Crore</span> from that annuity alone!
              </p>
            </div>
          </div>

          {/* Section 3: Caveats & Real World Frictions */}
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              3. Practical Real-World Caveats
            </h3>
            <ul className="mt-2 space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Transaction Friction:</strong> Stamp duty, registration, and brokerage reduce initial equity by 6%–8% upfront upon purchase, plus capital gains taxes on exit.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Tenant Vacancy & Maintenance:</strong> Rental income is not 100% continuous. Vacancies of 1 month every 2 years, ongoing repairs, and property taxes erode net yield.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Illiquidity vs Instant Liquidity:</strong> A mutual fund or ETF portfolio can be redeemed in T+1 days without distress discounts. Selling a property takes months to years.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Primary Residence vs Pure Investment:</strong> For self-use, security, pride of ownership, and stability dominate, making purely mathematical comparison secondary.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            Close & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
