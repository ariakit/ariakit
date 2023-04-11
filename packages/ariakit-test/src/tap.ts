import { click } from "./click.js";

export async function tap(element: Element, options?: MouseEventInit) {
  await click(element, options, true);
}
