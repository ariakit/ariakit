import "./polyfills.js";
import { click } from "./click.js";

export async function tap(element: Element | null, options?: MouseEventInit) {
  await click(element, options, true);
}
