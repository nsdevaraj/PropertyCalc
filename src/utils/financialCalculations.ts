import {
  BaseInputs,
  AdvancedInputs,
  CombinedInputs,
  BaseCalculationResult,
  AdvancedCalculationResult,
  YearlyScheduleRow,
} from '../types/financial';

/**
 * Compute the standard base case matching the original prompt formulas exactly.
 */
export function calculateBaseModel(inputs: BaseInputs): BaseCalculationResult {
  const {
    propertyPrice: P,
    downPaymentPercent,
    loanInterestRate,
    tenureYears: T,
    monthlyRent: R,
    propertyAppreciation,
    alternativeReturn,
  } = inputs;

  const d = downPaymentPercent / 100;
  const downPayment = P * d;
  const L = P * (1 - d);
  const i = loanInterestRate / 100;
  const g = propertyAppreciation / 100;
  const r = alternativeReturn / 100;

  const rm = i / 12;
  const n = T * 12;

  // Monthly EMI
  let monthlyEMI = 0;
  if (rm > 0) {
    const powFactor = Math.pow(1 + rm, n);
    monthlyEMI = L * ((rm * powFactor) / (powFactor - 1));
  } else {
    monthlyEMI = L / n;
  }

  // Net monthly cash outflow
  const netMonthlyOutflow = monthlyEMI - R;

  // Total interest paid
  const totalEMIPaid = monthlyEMI * n;
  const totalInterestPaid = totalEMIPaid - L;

  // Future value of property
  const propertyFV = P * Math.pow(1 + g, T);

  // Alternative investment FV
  // 1. Lump-sum
  const alternativeLumpSumFV = downPayment * Math.pow(1 + r, T);

  // 2. Annuity (monthly net cash outflow invested at r/12)
  const rmAlt = r / 12;
  let alternativeAnnuityFV = 0;
  if (rmAlt > 0) {
    const powAlt = Math.pow(1 + rmAlt, n);
    alternativeAnnuityFV = netMonthlyOutflow * ((powAlt - 1) / rmAlt);
  } else {
    alternativeAnnuityFV = netMonthlyOutflow * n;
  }

  const alternativeFV = alternativeLumpSumFV + alternativeAnnuityFV;
  const netDifference = propertyFV - alternativeFV;

  // Required continuous appreciation g* to break even with alternative
  // g* = (FV_alt / P)^(1/T) - 1
  let requiredAppreciationPercent = 0;
  if (P > 0 && alternativeFV > 0) {
    const ratio = alternativeFV / P;
    const gStar = Math.pow(ratio, 1 / T) - 1;
    requiredAppreciationPercent = gStar * 100;
  }

  // Equity multiple: Final Value / Total Capital Invested
  const totalCapitalInvested = downPayment + Math.max(0, netMonthlyOutflow * n);
  const equityMultipleProperty = totalCapitalInvested > 0 ? propertyFV / totalCapitalInvested : 0;
  const equityMultipleAlternative = totalCapitalInvested > 0 ? alternativeFV / totalCapitalInvested : 0;

  // Inflation adjustments and Real-term ROI calculations
  const inflationRate = inputs.inflationRate ?? 5.0;
  const inflationDec = inflationRate / 100;
  const cumulativeInflationFactor = Math.pow(1 + inflationDec, T);
  const realPropertyFV = cumulativeInflationFactor > 0 ? propertyFV / cumulativeInflationFactor : propertyFV;
  const realAlternativeFV = cumulativeInflationFactor > 0 ? alternativeFV / cumulativeInflationFactor : alternativeFV;
  const realNetDifference = realPropertyFV - realAlternativeFV;

  // Real-term annualized ROI on equity invested (Fisher equation / exact CAGR adjustment)
  let realROIProperty = 0;
  let realROIAlternative = 0;
  if (totalCapitalInvested > 0 && T > 0) {
    const nominalCAGRProp = Math.pow(Math.max(0.001, propertyFV / totalCapitalInvested), 1 / T) - 1;
    const nominalCAGRAlt = Math.pow(Math.max(0.001, alternativeFV / totalCapitalInvested), 1 / T) - 1;
    realROIProperty = ((1 + nominalCAGRProp) / (1 + inflationDec) - 1) * 100;
    realROIAlternative = ((1 + nominalCAGRAlt) / (1 + inflationDec) - 1) * 100;
  }

  return {
    propertyPrice: P,
    downPayment,
    loanAmount: L,
    monthlyEMI,
    netMonthlyOutflow,
    totalEMIPaid,
    totalInterestPaid,
    propertyFV,
    alternativeLumpSumFV,
    alternativeAnnuityFV,
    alternativeFV,
    netDifference,
    requiredAppreciationPercent,
    equityMultipleProperty,
    equityMultipleAlternative,
    inflationRate,
    cumulativeInflationFactor,
    realPropertyFV,
    realAlternativeFV,
    realNetDifference,
    realROIProperty,
    realROIAlternative,
  };
}

/**
 * Standard Newton-Raphson method for calculating Internal Rate of Return (IRR).
 */
export function calculateIRR(cashFlows: number[], guess = 0.1): number {
  const maxIterations = 100;
  const tolerance = 1e-6;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      if (t > 0) {
        dNpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100;
    }

    if (Math.abs(dNpv) < 1e-12) {
      break;
    }

    const nextRate = rate - npv / dNpv;
    if (isNaN(nextRate) || !isFinite(nextRate) || nextRate <= -0.99) {
      break;
    }
    rate = nextRate;
  }

  return rate * 100;
}

/**
 * Full Real-World Simulation with Amortization schedule, rent escalation,
 * vacancy, maintenance, taxes, and IRR.
 */
export function calculateAdvancedModel(inputs: CombinedInputs): AdvancedCalculationResult {
  const base = calculateBaseModel(inputs);
  const {
    propertyPrice: P,
    loanInterestRate,
    tenureYears: T,
    monthlyRent: R,
    propertyAppreciation,
    alternativeReturn,
    stampDutyPercent,
    furnishingCost,
    annualRentGrowth,
    vacancyRatePercent,
    annualMaintenancePercent,
    propertyTaxAnnual,
    marginalTaxBracket,
    enableTaxDeductions,
    propertyLTCGTaxRate,
    alternativeLTCGTaxRate,
    enableAdvancedModel,
  } = inputs;

  if (!enableAdvancedModel) {
    // If advanced model is disabled, generate schedule based on base assumptions
    const schedule: YearlyScheduleRow[] = [];
    let currentLoan = base.loanAmount;
    const monthlyRate = (loanInterestRate / 100) / 12;
    let altPortfolio = base.downPayment;
    const altAnnualRate = alternativeReturn / 100;

    for (let yr = 1; yr <= T; yr++) {
      const begLoan = currentLoan;
      let yrPrincipal = 0;
      let yrInterest = 0;

      for (let m = 0; m < 12; m++) {
        if (currentLoan <= 0) break;
        const mInterest = currentLoan * monthlyRate;
        const mPrincipal = Math.min(currentLoan, base.monthlyEMI - mInterest);
        yrInterest += mInterest;
        yrPrincipal += mPrincipal;
        currentLoan -= mPrincipal;
      }

      const grossRent = R * 12;
      const netRent = grossRent;
      const annualEMI = yrPrincipal + yrInterest;
      const propertyOutflow = annualEMI - netRent;
      const propVal = P * Math.pow(1 + propertyAppreciation / 100, yr);
      const propEquity = propVal - currentLoan;

      // Alternative portfolio grows + net outflow added
      altPortfolio = altPortfolio * (1 + altAnnualRate) + propertyOutflow;

      const inflationDec = (inputs.inflationRate ?? 5.0) / 100;
      const deflator = Math.pow(1 + inflationDec, yr);

      schedule.push({
        year: yr,
        beginningLoanBalance: begLoan,
        annualEMI,
        principalPaid: yrPrincipal,
        interestPaid: yrInterest,
        endingLoanBalance: Math.max(0, currentLoan),
        grossRent,
        netRent,
        taxSaved: 0,
        propertyOutflowNet: propertyOutflow,
        propertyValue: propVal,
        propertyEquity: propEquity,
        alternativeAnnualInvested: propertyOutflow,
        alternativePortfolioValue: altPortfolio,
        wealthGap: propEquity - altPortfolio,
        inflationDeflator: deflator,
        realPropertyEquity: propEquity / deflator,
        realAlternativePortfolioValue: altPortfolio / deflator,
      });
    }

    return {
      ...base,
      totalUpfrontPropertyCost: base.downPayment,
      totalNetOutflowOverTenure: base.netMonthlyOutflow * T * 12,
      totalRentalIncomeCollected: R * 12 * T,
      totalTaxSavings: 0,
      netSaleProceedsProperty: base.propertyFV,
      netSaleProceedsAlternative: base.alternativeFV,
      propertyIRR: 0,
      alternativeIRR: 0,
      schedule,
    };
  }

  // Advanced calculation with all frictions
  const stampDuty = P * (stampDutyPercent / 100);
  const totalUpfrontPropertyCost = base.downPayment + stampDuty + furnishingCost;

  let currentLoan = base.loanAmount;
  const monthlyRate = (loanInterestRate / 100) / 12;
  const altAnnualRate = alternativeReturn / 100;
  const propApprecRate = propertyAppreciation / 100;
  const rentGrowthRate = annualRentGrowth / 100;
  const vacancyFactor = 1 - (vacancyRatePercent / 100);
  const maintFactor = annualMaintenancePercent / 100;
  const taxBracket = marginalTaxBracket / 100;

  // Alternative starts with the exact total upfront capital
  let altPortfolio = totalUpfrontPropertyCost;
  const schedule: YearlyScheduleRow[] = [];

  const propertyCashFlows: number[] = [-totalUpfrontPropertyCost];
  const alternativeCashFlows: number[] = [-totalUpfrontPropertyCost];

  let totalRentalIncomeCollected = 0;
  let totalTaxSavings = 0;
  let totalNetOutflowOverTenure = 0;

  for (let yr = 1; yr <= T; yr++) {
    const begLoan = currentLoan;
    let yrPrincipal = 0;
    let yrInterest = 0;

    for (let m = 0; m < 12; m++) {
      if (currentLoan <= 0) break;
      const mInterest = currentLoan * monthlyRate;
      const mPrincipal = Math.min(currentLoan, base.monthlyEMI - mInterest);
      yrInterest += mInterest;
      yrPrincipal += mPrincipal;
      currentLoan -= mPrincipal;
    }

    // Gross rent escalating each year
    const grossRent = (R * 12) * Math.pow(1 + rentGrowthRate, yr - 1);
    const effectiveRent = grossRent * vacancyFactor;
    totalRentalIncomeCollected += effectiveRent;

    // Maintenance based on escalating property value + property tax
    const currentPropValue = P * Math.pow(1 + propApprecRate, yr);
    const maintenanceExpense = (currentPropValue * maintFactor) + propertyTaxAnnual;
    const netRent = effectiveRent - maintenanceExpense;

    // Tax benefit estimation (Sec 24(b) interest deduction + standard deduction on rental income)
    let taxSaved = 0;
    if (enableTaxDeductions) {
      // NAV = effectiveRent - propertyTaxAnnual
      const nav = Math.max(0, effectiveRent - propertyTaxAnnual);
      const standardDeduction = nav * 0.30;
      // Taxable income from house property = NAV - Standard Deduction - Interest
      const taxableHouseIncome = nav - standardDeduction - yrInterest;
      if (taxableHouseIncome < 0) {
        // Loss setoff capped at ₹2,00,000 against other income per financial year
        const eligibleLoss = Math.min(Math.abs(taxableHouseIncome), 200000);
        taxSaved = eligibleLoss * taxBracket;
      }
    }
    totalTaxSavings += taxSaved;

    const annualEMI = yrPrincipal + yrInterest;
    // Net cash out of pocket this year for property owner
    const netOutflow = annualEMI - netRent - taxSaved;
    totalNetOutflowOverTenure += netOutflow;

    const propEquity = currentPropValue - currentLoan;

    // Alternative portfolio compounds and receives the exact same net cash outflow
    altPortfolio = (altPortfolio * (1 + altAnnualRate)) + netOutflow;

    propertyCashFlows.push(-netOutflow);
    alternativeCashFlows.push(-netOutflow);

    const inflationDec = (inputs.inflationRate ?? 5.0) / 100;
    const deflator = Math.pow(1 + inflationDec, yr);

    schedule.push({
      year: yr,
      beginningLoanBalance: begLoan,
      annualEMI,
      principalPaid: yrPrincipal,
      interestPaid: yrInterest,
      endingLoanBalance: Math.max(0, currentLoan),
      grossRent,
      netRent,
      taxSaved,
      propertyOutflowNet: netOutflow,
      propertyValue: currentPropValue,
      propertyEquity: propEquity,
      alternativeAnnualInvested: netOutflow,
      alternativePortfolioValue: altPortfolio,
      wealthGap: propEquity - altPortfolio,
      inflationDeflator: deflator,
      realPropertyEquity: propEquity / deflator,
      realAlternativePortfolioValue: altPortfolio / deflator,
    });
  }

  // Exit taxes at year T
  const finalPropertyValue = P * Math.pow(1 + propApprecRate, T);
  const propertyCostBasis = P + stampDuty + furnishingCost;
  const propertyGain = Math.max(0, finalPropertyValue - propertyCostBasis);
  const propertyLTCG = propertyGain * (propertyLTCGTaxRate / 100);
  const netSaleProceedsProperty = finalPropertyValue - propertyLTCG;

  // Alternative portfolio LTCG
  const totalAlternativePrincipal = totalUpfrontPropertyCost + Math.max(0, totalNetOutflowOverTenure);
  const alternativeGain = Math.max(0, altPortfolio - totalAlternativePrincipal);
  const alternativeLTCG = alternativeGain * (alternativeLTCGTaxRate / 100);
  const netSaleProceedsAlternative = altPortfolio - alternativeLTCG;

  // Add exit terminal value to IRR series
  propertyCashFlows[propertyCashFlows.length - 1] += netSaleProceedsProperty;
  alternativeCashFlows[alternativeCashFlows.length - 1] += netSaleProceedsAlternative;

  const propertyIRR = calculateIRR(propertyCashFlows, 0.08);
  const alternativeIRR = calculateIRR(alternativeCashFlows, 0.10);

  // Advanced required appreciation to match netSaleProceedsAlternative
  const ratioAdv = (netSaleProceedsAlternative + propertyLTCG) / P;
  const advRequiredApprec = (Math.pow(Math.max(0.1, ratioAdv), 1 / T) - 1) * 100;

  // Real-term calculation for advanced results
  const inflationRate = inputs.inflationRate ?? 5.0;
  const cumulativeInflationFactor = Math.pow(1 + inflationRate / 100, T);
  const realPropertyFV = finalPropertyValue / cumulativeInflationFactor;
  const realAlternativeFV = altPortfolio / cumulativeInflationFactor;
  const realNetDifference = (netSaleProceedsProperty - netSaleProceedsAlternative) / cumulativeInflationFactor;

  // Real ROI on equity from IRR
  const realROIProperty = ((1 + propertyIRR / 100) / (1 + inflationRate / 100) - 1) * 100;
  const realROIAlternative = ((1 + alternativeIRR / 100) / (1 + inflationRate / 100) - 1) * 100;

  return {
    ...base,
    propertyFV: finalPropertyValue,
    alternativeFV: altPortfolio,
    netDifference: netSaleProceedsProperty - netSaleProceedsAlternative,
    requiredAppreciationPercent: advRequiredApprec,
    totalUpfrontPropertyCost,
    totalNetOutflowOverTenure,
    totalRentalIncomeCollected,
    totalTaxSavings,
    netSaleProceedsProperty,
    netSaleProceedsAlternative,
    propertyIRR,
    alternativeIRR,
    inflationRate,
    cumulativeInflationFactor,
    realPropertyFV,
    realAlternativeFV,
    realNetDifference,
    realROIProperty,
    realROIAlternative,
    schedule,
  };
}
