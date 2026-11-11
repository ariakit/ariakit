import { highlight } from "@ariakit/ui/utils/highlight.server";
import { getFileIcon } from "../file-icons.ts";

const source = `export function formatPrice(amount: number, currency = "USD") {
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  });
  return format.format(amount);
}`;

export function load() {
  return {
    code: highlight(source, "ts"),
    icon: getFileIcon("format-price.ts"),
  };
}
