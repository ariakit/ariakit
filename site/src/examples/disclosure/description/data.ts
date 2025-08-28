export const columns = {
  model: { label: "Model", numeric: false, currency: false },
  input: { label: "Input", numeric: true, currency: false },
  cacheRead: { label: "Cache Read", numeric: true, currency: false },
  output: { label: "Output", numeric: true, currency: false },
  totalTokens: { label: "Total Tokens", numeric: true, currency: false },
  apiCost: { label: "API Cost", numeric: true, currency: true },
  costToYou: { label: "Cost to You", numeric: true, currency: true },
};

export const data = [
  {
    model: "gpt-5-high",
    input: 1662641,
    cacheRead: 19249024,
    output: 664385,
    totalTokens: 21576050,
    apiCost: 1113,
    costToYou: 0,
  },
  {
    model: "auto",
    input: 32012,
    cacheRead: 332592,
    output: 7308,
    totalTokens: 371912,
    apiCost: 17,
    costToYou: 0,
  },
  {
    model: "gpt-5",
    input: 17646,
    cacheRead: 57728,
    output: 7430,
    totalTokens: 82804,
    apiCost: 1,
    costToYou: 0,
  },
] satisfies Record<keyof typeof columns, unknown>[];

export const total = Object.fromEntries(
  Object.entries(columns).map(([key, col]) => {
    if (!col.numeric) return [key, null];
    const sum = data.reduce((acc, row) => {
      const value = row[key as keyof typeof columns];
      return acc + (typeof value === "number" ? value : 0);
    }, 0);
    return [key, sum];
  }),
);
