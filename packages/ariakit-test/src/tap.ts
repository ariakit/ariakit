import "./polyfills.js";
import { click } from "./click.js";

export function tap(element: Element | null, options?: MouseEventInit) {
  return click(element, options, true);
}
