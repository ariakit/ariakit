import { contains, getActiveElement } from "@ariakit/utils";

export function hasNativeFocusWithin(element: HTMLElement) {
  const activeElement = getActiveElement(element);
  return !!activeElement && contains(element, activeElement);
}
