import { click } from "./click";

export async function tap(element: Element, options?: MouseEventInit) {
  await click(element, options, true);
}
