import { CurrencyMode } from '../types/financial';

/**
 * Format a number using Indian numbering system (Lakhs and Crores)
 * e.g., 10000000 -> "₹1,00,00,000"
 */
export function formatINR(val: number, showSymbol = true): string {
  if (isNaN(val) || !isFinite(val)) return '—';
  const isNegative = val < 0;
  const absVal = Math.round(Math.abs(val));
  const s = absVal.toString();
  
  let formatted = '';
  if (s.length <= 3) {
    formatted = s;
  } else {
    const lastThree = s.substring(s.length - 3);
    const otherNumbers = s.substring(0, s.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = `${withCommas},${lastThree}`;
  }

  const prefix = isNegative ? '-₹' : showSymbol ? '₹' : '';
  return `${prefix}${formatted}`;
}

/**
 * Format compact representations in Indian system:
 * e.g., 10000000 -> "₹1.00 Cr", 8059668 -> "₹80.60 L", 41915 -> "₹41,915"
 */
export function formatINRCompact(val: number, decimals = 2): string {
  if (isNaN(val) || !isFinite(val)) return '—';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const sign = isNegative ? '-' : '';

  if (absVal >= 10000000) {
    const cr = absVal / 10000000;
    return `${sign}₹${cr.toFixed(decimals)} Cr`;
  } else if (absVal >= 100000) {
    const lakh = absVal / 100000;
    return `${sign}₹${lakh.toFixed(decimals)} L`;
  } else {
    return formatINR(val, true);
  }
}

/**
 * Format compact representations in USD system:
 * e.g., 1000000 -> "$1.00M", 50000 -> "$50.0K"
 */
export function formatUSDCompact(val: number, decimals = 2): string {
  if (isNaN(val) || !isFinite(val)) return '—';
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const sign = isNegative ? '-' : '';

  if (absVal >= 1000000000) {
    return `${sign}$${(absVal / 1000000000).toFixed(decimals)}B`;
  } else if (absVal >= 1000000) {
    return `${sign}$${(absVal / 1000000).toFixed(decimals)}M`;
  } else if (absVal >= 1000) {
    return `${sign}$${(absVal / 1000).toFixed(decimals)}K`;
  } else {
    return `${sign}$${Math.round(absVal).toLocaleString('en-US')}`;
  }
}

/**
 * Main currency formatter respecting CurrencyMode
 */
export function formatCurrency(
  val: number,
  mode: CurrencyMode = 'INR',
  compact = false,
  decimals = 2
): string {
  if (mode === 'USD') {
    if (compact) return formatUSDCompact(val, decimals);
    const sign = val < 0 ? '-$' : '$';
    return `${sign}${Math.round(Math.abs(val)).toLocaleString('en-US')}`;
  }

  return compact ? formatINRCompact(val, decimals) : formatINR(val, true);
}

/**
 * Format percentages cleanly (e.g. 7.84%)
 */
export function formatPercent(val: number, decimals = 2): string {
  if (isNaN(val) || !isFinite(val)) return '—';
  return `${val.toFixed(decimals)}%`;
}

/**
 * Helper to display Crores value for quick reading
 */
export function toCrores(val: number, decimals = 2): string {
  return `${(val / 10000000).toFixed(decimals)} cr`;
}

/**
 * Parse input string or number safely
 */
export function sanitizeNumber(val: string | number, min = 0, max = Infinity): number {
  if (typeof val === 'number') {
    if (isNaN(val)) return min;
    return Math.min(Math.max(val, min), max);
  }
  const cleanStr = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleanStr);
  if (isNaN(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
}
