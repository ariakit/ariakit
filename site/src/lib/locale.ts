export function getCountryCode(headers: Headers) {
  const countryCode =
    headers.get("x-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("cloudfront-viewer-country") ??
    "US";
  return countryCode;
}

export function getCurrency(countryCode: string) {
  countryCode = countryCode.toUpperCase();
  if (countryCode === "GB") return "GBP";
  if (countryCode === "IND") return "INR";
  const euCodes =
    "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE";
  if (euCodes.includes(countryCode)) return "EUR";
  return "USD";
}

export interface FormatCurrencyParams {
  amount: number;
  currency: string;
}

export function formatCurrency({ amount, currency }: FormatCurrencyParams) {
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });
  const parts = numberFormat.formatToParts(Math.ceil(amount));
  const symbol = parts.find((part) => part.type === "currency")?.value;
  const value = parts.reduce((value, part) => {
    if (part.type === "currency") return value;
    value += part.value;
    return value;
  }, "");
  const text = symbol + value;
  return { symbol, value, parts, text, toString: () => text };
}
