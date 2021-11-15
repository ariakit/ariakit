import { getDocument } from "ariakit-utils/dom";

export function prependHiddenDismiss(
  container: HTMLElement,
  onClick: () => unknown
) {
  const document = getDocument(container);
  const button = document.createElement("button");
  button.type = "button";
  button.tabIndex = -1;
  button.textContent = "Dismiss popup";

  // Visually hidden styles
  button.style.border = "0px";
  button.style.clip = "rect(0 0 0 0)";
  button.style.height = "1px";
  button.style.margin = "-1px";
  button.style.overflow = "hidden";
  button.style.padding = "0px";
  button.style.position = "absolute";
  button.style.whiteSpace = "nowrap";
  button.style.width = "1px";

  button.addEventListener("click", onClick);
  container.prepend(button);

  const removeHiddenDismiss = () => {
    button.removeEventListener("click", onClick);
    button.remove();
  };

  return removeHiddenDismiss;
}
