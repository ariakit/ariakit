import { click } from "./click.ts";

export function tap(element: Element | null, options?: PointerEventInit) {
  return click(element, options, true);
}
