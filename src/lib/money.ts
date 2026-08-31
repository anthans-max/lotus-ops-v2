const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formats a money amount for display, keeping the sign in front of the
 * currency symbol (-$50.00, not $-50.00). Line item rates may be negative
 * for discount lines, which flow through to a negative subtotal and total.
 *
 * Accepts the `string` values Drizzle returns for `numeric()` columns.
 */
export function formatMoney(value: number | string | null | undefined): string {
  // `|| 0` normalizes NaN and -0 so an empty or zeroed-out line never renders "-$0.00".
  return usd.format(Number(value ?? 0) || 0)
}
