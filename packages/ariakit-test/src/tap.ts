import { click } from "./click.ts";

export function tap(element: Element | null, options?: MouseEventInit) {
  return click(element, options, true);
}
