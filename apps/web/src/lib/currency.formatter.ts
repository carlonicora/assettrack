/**
 * Formats a numeric amount as a currency string according to the specified locale and currency
 * @param amount - The amount to format (string or number)
 * @param currency - The currency code (e.g., 'EUR', 'GBP', 'USD')
 * @param locale - Optional locale for formatting (e.g., 'en-GB', 'de-DE', 'fr-FR')
 * @returns Formatted currency string with appropriate separators and currency symbol
 */
export const formatCurrency = (amount: string | number, currency: string, locale?: string): string => {
  // Convert string amount to number if needed
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Use provided locale or detect from browser/environment when undefined
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });

  return formatter.format(numericAmount);
};
