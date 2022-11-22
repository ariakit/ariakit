import { noop } from "@ariakit/core/utils/misc";
import { walkTreeOutside } from "./walk-tree-outside";

type Elements = Array<Element | null>;

function disableElement(element: Element | HTMLElement) {
  if (!("style" in element)) return noop;
  const previousPointerEvents = element.style.pointerEvents;
  element.style.pointerEvents = "none";
  const enableElement = () => {
    element.style.pointerEvents = previousPointerEvents ?? "";
  };
  return enableElement;
}

export function disablePointerEventsOutside(...elements: Elements) {
  const cleanups: Array<() => void> = [];

  walkTreeOutside(elements, (element) => {
    cleanups.unshift(disableElement(element));
  });

  const restorePointerEvents = () => {
    cleanups.forEach((fn) => fn());
  };

  return restorePointerEvents;
}
