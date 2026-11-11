import { highlight } from "@ariakit/ui/utils/highlight.server";

const config = `export default {
  locale: "en-US",
  currency: "USD",
};`;

const store = `{
  "name": "Corner Shop",
  "currency": "USD"
}`;

export function load() {
  return {
    config: highlight(config, "ts"),
    store: highlight(store, "json"),
  };
}
