import * as React from "react";
import { getFirstTabbableIn, getLastTabbableIn } from "./tabbable";

function hasNestedOpenModals(portal: Element) {
  return (
    portal.querySelectorAll("[role=dialog][aria-modal=true][aria-hidden=false]")
      .length > 1
  );
}

export function useFocusTrap(
  dialogRef: React.RefObject<HTMLElement>,
  portalRef: React.RefObject<HTMLElement>,
  hideOnClickOutside?: boolean,
  shouldTrap?: boolean
) {
  const lastFocus = React.useRef<HTMLElement | null>(null);
  const lastMouseDownTarget = React.useRef<Element | null>(null);

  const registerFocus = React.useCallback((element: HTMLElement) => {
    lastFocus.current = element;
    lastMouseDownTarget.current = null;
  }, []);

  // https://github.com/w3c/aria-practices/issues/545
  React.useEffect(() => {
    const portal = portalRef.current;

    if (!portal || !shouldTrap) return undefined;

    const beforeElement = document.createElement("div");
    beforeElement.tabIndex = 0;
    beforeElement.style.position = "fixed";
    beforeElement.setAttribute("aria-hidden", "true");

    const afterElement = beforeElement.cloneNode() as Element;

    portal.insertAdjacentElement("beforebegin", beforeElement);
    portal.insertAdjacentElement("afterend", afterElement);

    return () => {
      beforeElement.remove();
      afterElement.remove();
    };
  }, [portalRef, shouldTrap]);

  // Focus trap
  React.useEffect(() => {
    if (!shouldTrap) return undefined;

    lastFocus.current = document.activeElement as HTMLElement;

    const handleFocus = (e: FocusEvent) => {
      const dialog = dialogRef.current;
      const portal = portalRef.current;
      const activeElement = document.activeElement as HTMLElement;

      // If there're nested open modals, let them handle focus
      if (!dialog || !portal || !activeElement || hasNestedOpenModals(portal)) {
        return undefined;
      }

      // Focus is inside portal, do nothing
      if (portal.contains(activeElement)) {
        return registerFocus(activeElement);
      }

      e.preventDefault();

      if (activeElement.contains(lastMouseDownTarget.current)) {
        if (hideOnClickOutside) return undefined;
        dialog.focus();
        return registerFocus(dialog);
      }

      const firstTabbable = getFirstTabbableIn(dialog, true);

      if (firstTabbable) {
        // Last focus before this was in the first tabbable element
        // It's a shift+Tab, then focus goes to the last tabbable element
        if (lastFocus.current === firstTabbable) {
          const lastTabbable = getLastTabbableIn(dialog, true) || firstTabbable;
          lastTabbable.focus();
          return registerFocus(lastTabbable);
        }
        firstTabbable.focus();
        return registerFocus(firstTabbable);
      }

      // Fallback to dialog
      dialog.focus();
      return registerFocus(dialog);
    };

    document.addEventListener("focus", handleFocus, true);
    return () => {
      document.removeEventListener("focus", handleFocus, true);
    };
  }, [dialogRef, portalRef, shouldTrap, registerFocus, hideOnClickOutside]);

  // MouseDown trap
  React.useEffect(() => {
    if (!shouldTrap) return undefined;

    const handleMouseDown = (e: MouseEvent) => {
      lastMouseDownTarget.current = e.target as Element;
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [shouldTrap]);

  // Click trap
  React.useEffect(() => {
    if (!shouldTrap) return undefined;

    const handleClick = () => {
      const dialog = dialogRef.current;
      const portal = portalRef.current;

      if (!dialog || !portal || hasNestedOpenModals(portal)) return;

      if (document.activeElement === document.body) {
        dialog.focus();
        registerFocus(dialog);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [dialogRef, portalRef, shouldTrap, registerFocus]);
}
