import * as React from "react";
import { isElementPreceding } from "./isElementPreceding";

type Item = {
  ref: React.RefObject<HTMLElement | null>;
};

export function sortBasedOnDOMPosition<T extends Item>(items: T[]): T[] {
  const copy = items.map((item, index) => [index, item] as [number, T]).slice();

  let isOrderDifferent = false;

  copy.sort((a, b) => {
    const indexA = a[0];
    const elementA = a[1].ref.current;

    const indexB = b[0];
    const elementB = b[1].ref.current;

    if (!elementA || !elementB) return 0;

    // a before b
    if (isElementPreceding(elementA, elementB)) {
      if (indexA > indexB) {
        isOrderDifferent = true;
      }
      return -1;
    }

    // a after b

    if (indexA < indexB) {
      isOrderDifferent = true;
    }

    return 1;
  });

  if (isOrderDifferent) {
    return copy.map(([_, item]) => item);
  }

  return items;
}
