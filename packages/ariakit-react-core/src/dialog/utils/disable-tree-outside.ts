import { chain, noop } from "@ariakit/core/utils/misc";
import { walkTreeOutside } from "./walk-tree-outside.js";

type Elements = Array<Element | null>;

function assignStyle(
  element: HTMLElement | null | undefined,
  style: Partial<CSSStyleDeclaration>
) {
  if (!element) return () => {};
  const previousStyle = element.style.cssText;
  Object.assign(element.style, style);
  return () => {
    element.style.cssText = previousStyle;
  };
}

function disableElement(element: Element | HTMLElement) {
  if (!("style" in element)) return noop;
  const previousInert = element.inert;
  element.inert = true;
  return chain(
    assignStyle(element, {
      pointerEvents: "none",
      userSelect: "none",
      cursor: "default",
    }),
    () => (element.inert = previousInert)
  );
}

export function disableTreeOutside(...elements: Elements) {
  const cleanups: Array<() => void> = [];

  walkTreeOutside(elements, (element) => {
    cleanups.unshift(disableElement(element));
  });

  const restorePointerEvents = () => {
    cleanups.forEach((fn) => fn());
  };

  return restorePointerEvents;
}
