import { setAttribute } from "./orchestrate.ts";

export function hideElementFromAccessibilityTree(element: Element) {
  return setAttribute(element, "aria-hidden", "true");
}
