export function getIPCountry(headers: Headers) {
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

export function formatCurrency(amount: number, countryCode: string) {
  const currency = getCurrency(countryCode);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}
