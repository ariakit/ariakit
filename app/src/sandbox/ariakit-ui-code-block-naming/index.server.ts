import { highlight } from "@ariakit/ui/utils/highlight.server";

const config = `export default {
  locale: "en-US",
  currency: "USD",
};`;

const store = `{
  "name": "Corner Shop",
  "currency": "USD"
}`;

const notes =
  "The shop opens at nine on weekdays and at ten on weekends, and it closes at six every day.";

export function load() {
  return {
    config: highlight(config, "ts"),
    store: highlight(store, "json"),
    notes,
  };
}
