/** The class tokens of an element, in attribute order and with repeats. */
export function getClassTokens(element: Element) {
  return element.getAttribute("class")?.split(/\s+/).filter(Boolean) ?? [];
}

/** The root and the body of the disclosure that a button opens. */
export function getDisclosureParts(button: HTMLElement) {
  const root = button.parentElement;
  const contentId = button.getAttribute("aria-controls") ?? "";
  const body = document.getElementById(contentId)?.firstElementChild;
  if (!root) throw new Error("A disclosure button has a root.");
  if (!body) throw new Error("A disclosure button controls a body.");
  return { root, body };
}
