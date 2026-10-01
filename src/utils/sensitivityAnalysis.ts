import {
  BaseInputs,
  SensitivityRowA,
  SensitivityRowB,
  SensitivityRowC,
} from '../types/financial';
import { calculateBaseModel } from './financialCalculations';

/**
 * Table A: Property Appreciation Sensitivity
 * Default rates: [3, 5, 7, 8, 10] or custom
 */
export function generateAppreciationSensitivity(
  inputs: BaseInputs,
  rates: number[] = [3, 4, 5, 6, 7, 8, 9, 10, 12]
): SensitivityRowA[] {
  return rates.map((apprec) => {
    const res = calculateBaseModel({
      ...inputs,
      propertyAppreciation: apprec,
    });
    return {
      appreciation: apprec,
      propertyFV: res.propertyFV,
      alternativeFV: res.alternativeFV,
      difference: res.netDifference,
      winner: res.netDifference >= 0 ? 'property' : 'alternative',
    };
  });
}

/**
 * Table B: Monthly Rent Sensitivity
 * Default rents: [20000, 25000, 30000, 35000, 40000]
 */
export function generateRentSensitivity(
  inputs: BaseInputs,
  rentSteps?: number[]
): SensitivityRowB[] {
  const baseRent = inputs.monthlyRent;
  const rents =
    rentSteps || [
      Math.max(5000, baseRent - 10000),
      Math.max(5000, baseRent - 5000),
      baseRent,
      baseRent + 5000,
      baseRent + 10000,
      baseRent + 15000,
    ];

  return rents.map((r) => {
    const res = calculateBaseModel({
      ...inputs,
      monthlyRent: r,
    });
    return {
      rent: r,
      netOutflow: res.netMonthlyOutflow,
      requiredG: res.requiredAppreciationPercent,
      alternativeFV: res.alternativeFV,
    };
  });
}

/**
 * Table C: Loan Interest Rate Sensitivity
 * Default rates: [7, 8, 9, 10]
 */
export function generateLoanRateSensitivity(
  inputs: BaseInputs,
  rates: number[] = [6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]
): SensitivityRowC[] {
  return rates.map((rate) => {
    const res = calculateBaseModel({
      ...inputs,
      loanInterestRate: rate,
    });
    return {
      loanRate: rate,
      emi: res.monthlyEMI,
      netOutflow: res.netMonthlyOutflow,
      requiredG: res.requiredAppreciationPercent,
    };
  });
}

export interface MatrixCell {
  appreciation: number;
  altReturn: number;
  difference: number;
  winner: 'property' | 'alternative';
  ratio: number; // propertyFV / alternativeFV
}

/**
 * 2D Heatmap Matrix: Property Appreciation (Y axis) vs Alternative Return (X axis)
 */
export function generate2DSensitivityMatrix(
  inputs: BaseInputs,
  appreciationRange: number[] = [4, 5, 6, 7, 8, 9, 10, 11],
  altReturnRange: number[] = [8, 9, 10, 11, 12, 13]
): { xLabels: number[]; yLabels: number[]; matrix: MatrixCell[][] } {
  const matrix: MatrixCell[][] = [];

  for (const g of appreciationRange) {
    const row: MatrixCell[] = [];
    for (const r of altReturnRange) {
      const res = calculateBaseModel({
        ...inputs,
        propertyAppreciation: g,
        alternativeReturn: r,
      });
      const diff = res.propertyFV - res.alternativeFV;
      row.push({
        appreciation: g,
        altReturn: r,
        difference: diff,
        winner: diff >= 0 ? 'property' : 'alternative',
        ratio: res.alternativeFV > 0 ? res.propertyFV / res.alternativeFV : 1,
      });
    }
    matrix.push(row);
  }

  return {
    xLabels: altReturnRange,
    yLabels: appreciationRange,
    matrix,
  };
}

/**
 * Breakeven Rent Solver:
 * Computes what monthly rent is required so that given expected appreciation g,
 * Property FV equals Alternative FV.
 */
export function solveBreakevenRent(inputs: BaseInputs, targetAppreciation?: number): number {
  const g = (targetAppreciation ?? inputs.propertyAppreciation) / 100;
  const T = inputs.tenureYears;
  const P = inputs.propertyPrice;
  const propFV = P * Math.pow(1 + g, T);

  // We want: FV_alt = FV_lump + FV_ann = propFV
  // FV_lump = Down * (1 + r)^T
  const d = inputs.downPaymentPercent / 100;
  const downPayment = P * d;
  const r = inputs.alternativeReturn / 100;
  const fvLump = downPayment * Math.pow(1 + r, T);

  const neededAnnuityFV = propFV - fvLump;
  const rmAlt = r / 12;
  const n = T * 12;
  const annuityFactor = rmAlt > 0 ? (Math.pow(1 + rmAlt, n) - 1) / rmAlt : n;

  const targetNetOutflow = neededAnnuityFV / annuityFactor;

  // Since Net = EMI - R, R = EMI - Net
  const baseRes = calculateBaseModel(inputs);
  const requiredRent = baseRes.monthlyEMI - targetNetOutflow;

  return Math.round(requiredRent);
}
