import { getDocument } from "@ariakit/core/utils/dom";

export function prependHiddenDismiss(
  container: HTMLElement,
  onClick: () => unknown,
) {
  const document = getDocument(container);
  const button = document.createElement("button");
  button.type = "button";
  button.tabIndex = -1;
  button.textContent = "Dismiss popup";

  // Visually hidden styles
  Object.assign(button.style, {
    border: "0px",
    clip: "rect(0 0 0 0)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: "0px",
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  });

  button.addEventListener("click", onClick);
  container.prepend(button);

  const removeHiddenDismiss = () => {
    button.removeEventListener("click", onClick);
    button.remove();
  };

  return removeHiddenDismiss;
}
