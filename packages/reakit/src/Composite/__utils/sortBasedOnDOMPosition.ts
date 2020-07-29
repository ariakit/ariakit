import * as React from "react";
import { isElementPreceding } from "./isElementPreceding";

type Item = {
  ref: React.RefObject<HTMLElement | null>;
};

export function sortBasedOnDOMPosition<T extends Item>(items: T[]): T[] {
  const copy = items.slice();
  let isOrderDifferent = false;
  copy.sort((a, b) => {
    const elementA = a.ref.current;
    const elementB = b.ref.current;
    if (!elementA || !elementB) return 0;
    if (isElementPreceding(elementA, elementB)) {
      isOrderDifferent = true;
      return -1;
    }
    return 1;
  });
  if (isOrderDifferent) {
    return copy;
  }
  return items;
}
