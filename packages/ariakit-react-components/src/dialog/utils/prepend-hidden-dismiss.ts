import { getDocument } from "@ariakit/utils";
import { getVisuallyHiddenStyle } from "../../visually-hidden/visually-hidden.tsx";

export function prependHiddenDismiss(
  container: HTMLElement,
  onClick: () => unknown,
) {
  const document = getDocument(container);
  const button = document.createElement("button");
  button.type = "button";
  button.tabIndex = -1;
  button.textContent = "Dismiss popup";

  Object.assign(button.style, getVisuallyHiddenStyle());

  button.addEventListener("click", onClick);
  container.prepend(button);

  const removeHiddenDismiss = () => {
    button.removeEventListener("click", onClick);
    button.remove();
  };

  return removeHiddenDismiss;
}
