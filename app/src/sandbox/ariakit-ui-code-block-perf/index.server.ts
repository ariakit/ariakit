import { highlight } from "@ariakit/ui/utils/highlight.server";

// About 1,000 tokens, the size of a long source file in docs.
const source = Array.from(
  { length: 33 },
  (
    _,
    index,
  ) => `export function formatPrice${index}(amount: number, currency = "USD") {
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
  return formatter.format(amount * ${index + 1});
}`,
).join("\n\n");

export function load() {
  return { code: highlight(source, "ts") };
}
