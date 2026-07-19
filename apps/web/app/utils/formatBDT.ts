/**
 * formatBDT — Format a number as Bangladeshi Taka with Bangla digits.
 *
 * Examples:
 *   formatBDT(50000)  → "৳ ৫০,০০০"
 *   formatBDT(100000) → "৳ ১,০০,০০০"
 *   formatBDT(1234.5) → "৳ ১,২৩৪.৫"
 */
export function formatBDT(amount: number): string {
  try {
    // bn-BD uses the South Asian grouping system (2-2-3)
    const formatted = new Intl.NumberFormat("bn-BD", {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
    return `৳ ${formatted}`;
  } catch {
    // Fallback for environments that don't support bn-BD locale
    return `৳ ${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * formatBDTDecimal — Format with up to 2 decimal places (for rates, small fees).
 */
export function formatBDTDecimal(amount: number): string {
  try {
    const formatted = new Intl.NumberFormat("bn-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `৳ ${formatted}`;
  } catch {
    return `৳ ${amount.toFixed(2)}`;
  }
}
