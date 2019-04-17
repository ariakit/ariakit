import * as React from "react";
import { DialogOptions } from "../Dialog";
import { getFirstTabbableIn, getLastTabbableIn } from "./tabbable";

function hasNestedOpenModals(portal: Element) {
  return (
    portal.querySelectorAll("[role=dialog][aria-modal=true][aria-hidden=false]")
      .length > 1
  );
}

const focusTrapClassName = "__reakit-focus-trap";

export function isFocusTrap(element: Element) {
  return element.classList.contains(focusTrapClassName);
}

export function useFocusTrap(
  dialogRef: React.RefObject<HTMLElement>,
  portalRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const shouldTrap = options.visible && options.modal;
  const beforeElement = React.useRef<HTMLElement | null>(null);
  const afterElement = React.useRef<HTMLElement | null>(null);

  // Create before and after elements
  // https://github.com/w3c/aria-practices/issues/545
  React.useEffect(() => {
    const portal = portalRef.current;

    if (!portal || !shouldTrap) return undefined;

    if (!beforeElement.current) {
      beforeElement.current = document.createElement("div");
      beforeElement.current.className = focusTrapClassName;
      beforeElement.current.tabIndex = 0;
      beforeElement.current.style.position = "fixed";
      beforeElement.current.setAttribute("aria-hidden", "true");
    }

    if (!afterElement.current) {
      afterElement.current = beforeElement.current.cloneNode() as HTMLElement;
    }

    portal.insertAdjacentElement("beforebegin", beforeElement.current);
    portal.insertAdjacentElement("afterend", afterElement.current);

    return () => {
      if (beforeElement.current) beforeElement.current.remove();
      if (afterElement.current) afterElement.current.remove();
    };
  }, [portalRef, shouldTrap]);

  // Focus trap
  React.useEffect(() => {
    const before = beforeElement.current;
    const after = afterElement.current;
    if (!shouldTrap || !before || !after) return undefined;

    const handleFocus = (event: FocusEvent) => {
      const portal = portalRef.current;
      const dialog = dialogRef.current;
      if (!portal || !dialog || hasNestedOpenModals(portal)) return;

      event.preventDefault();

      const isAfter = event.target === after;

      const tabbable = isAfter
        ? getFirstTabbableIn(dialog)
        : getLastTabbableIn(dialog);

      if (tabbable) {
        tabbable.focus();
      } else {
        // fallback to dialog
        dialog.focus();
      }
    };

    before.addEventListener("focus", handleFocus);
    after.addEventListener("focus", handleFocus);
    return () => {
      before.removeEventListener("focus", handleFocus);
      after.removeEventListener("focus", handleFocus);
    };
  }, [dialogRef, portalRef, shouldTrap]);

  // Click trap
  React.useEffect(() => {
    if (!shouldTrap) return undefined;

    const handleClick = () => {
      const dialog = dialogRef.current;
      const portal = portalRef.current;

      if (!dialog || !portal || hasNestedOpenModals(portal)) return;

      if (!portal.contains(document.activeElement)) {
        dialog.focus();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [dialogRef, portalRef, shouldTrap]);
}
