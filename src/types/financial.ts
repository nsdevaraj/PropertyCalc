export type CurrencyMode = 'INR' | 'USD';

export interface BaseInputs {
  propertyPrice: number; // P (e.g. 1,00,00,000)
  downPaymentPercent: number; // d (e.g. 20%)
  loanInterestRate: number; // i (e.g. 8%)
  tenureYears: number; // T (e.g. 20)
  monthlyRent: number; // R (e.g. 25,000)
  propertyAppreciation: number; // g (e.g. 7%)
  alternativeReturn: number; // r (e.g. 10%)
}

export interface AdvancedInputs {
  enableAdvancedModel: boolean;
  // Upfront costs
  stampDutyPercent: number; // e.g. 6%
  furnishingCost: number; // e.g. ₹5,00,000
  // Operational costs & growth
  annualRentGrowth: number; // e.g. 5% p.a.
  vacancyRatePercent: number; // e.g. 4% (approx 2 weeks/year)
  annualMaintenancePercent: number; // e.g. 0.75% of property value p.a.
  propertyTaxAnnual: number; // e.g. ₹15,000
  // Tax parameters
  marginalTaxBracket: number; // e.g. 30%
  enableTaxDeductions: boolean; // Sec 24(b) interest deduction
  propertyLTCGTaxRate: number; // e.g. 12.5%
  alternativeLTCGTaxRate: number; // e.g. 12.5%
}

export interface CombinedInputs extends BaseInputs, AdvancedInputs {}

export interface BaseCalculationResult {
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  monthlyEMI: number;
  netMonthlyOutflow: number;
  totalEMIPaid: number;
  totalInterestPaid: number;
  propertyFV: number;
  alternativeLumpSumFV: number;
  alternativeAnnuityFV: number;
  alternativeFV: number;
  netDifference: number; // propertyFV - alternativeFV
  requiredAppreciationPercent: number; // g*
  equityMultipleProperty: number;
  equityMultipleAlternative: number;
}

export interface YearlyScheduleRow {
  year: number;
  beginningLoanBalance: number;
  annualEMI: number;
  principalPaid: number;
  interestPaid: number;
  endingLoanBalance: number;
  grossRent: number;
  netRent: number; // after vacancy & maintenance
  taxSaved: number;
  propertyOutflowNet: number;
  propertyValue: number;
  propertyEquity: number; // propertyValue - endingLoanBalance
  alternativeAnnualInvested: number;
  alternativePortfolioValue: number;
  wealthGap: number; // propertyEquity - alternativePortfolioValue
}

export interface AdvancedCalculationResult extends BaseCalculationResult {
  totalUpfrontPropertyCost: number;
  totalNetOutflowOverTenure: number;
  totalRentalIncomeCollected: number;
  totalTaxSavings: number;
  netSaleProceedsProperty: number; // after LTCG
  netSaleProceedsAlternative: number; // after LTCG
  propertyIRR: number; // equity IRR
  alternativeIRR: number;
  schedule: YearlyScheduleRow[];
}

export interface SensitivityRowA {
  appreciation: number;
  propertyFV: number;
  alternativeFV: number;
  difference: number;
  winner: 'property' | 'alternative';
}

export interface SensitivityRowB {
  rent: number;
  netOutflow: number;
  requiredG: number;
  alternativeFV: number;
}

export interface SensitivityRowC {
  loanRate: number;
  emi: number;
  netOutflow: number;
  requiredG: number;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  inputs: CombinedInputs;
}

export interface SimulationSnapshot {
  id: string;
  name: string;
  createdAt: number;
  inputs: CombinedInputs;
  results: AdvancedCalculationResult;
}
