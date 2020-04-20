export function isExpandedDisclosure(element: HTMLElement) {
  return (
    element.hasAttribute("aria-controls") &&
    element.getAttribute("aria-expanded") === "true"
  );
}
