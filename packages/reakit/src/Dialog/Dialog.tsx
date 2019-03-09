// TODO: Refactor
import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useHook } from "../system/useHook";
import { Portal } from "../Portal/Portal";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../Hidden/Hidden";
import { useDialogState, unstable_DialogStateReturn } from "./DialogState";

export type unstable_DialogOptions = unstable_HiddenOptions &
  Partial<unstable_DialogStateReturn> & {
    /** TODO: Description */
    modal?: boolean;
    /** TODO: Description */
    unstable_focusOnShow?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    unstable_focusOnHide?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    unstable_hideOnEsc?: boolean;
    /** TODO: Description */
    unstable_hideOnClickOutside?: boolean;
  };

export type unstable_DialogProps = unstable_HiddenProps;

const focusableSelector =
  'input, select, textarea, a[href], button, [tabindex], audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

const tabbableSelector = focusableSelector
  .split(", ")
  .map(selector => `${selector}:not([tabindex="-1"]):not([disabled])`)
  .join(", ");

export function useDialog(
  {
    unstable_hideOnEsc = true,
    unstable_hideOnClickOutside = true,
    ...options
  }: unstable_DialogOptions = {},
  htmlProps: unstable_DialogProps = {}
) {
  const ref = React.useRef<HTMLElement | null>(null);
  const lastActiveElement = React.useRef<HTMLElement | null>(null);
  const getPortal = React.useCallback(
    () => ref.current && (ref.current.parentNode as HTMLElement),
    []
  );

  // Add stuff to portal and document.body
  React.useLayoutEffect(() => {
    const portal = getPortal();

    if (!portal) return;

    // Make it focusable so it works like a document.body in the dialog scope
    portal.tabIndex = -1;

    if (options.modal) {
      const className = "modal-open";
      if (options.visible) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    }
  }, [getPortal, options.visible, options.modal]);

  // Store the active element before focusing dialog
  React.useLayoutEffect(() => {
    if (options.visible) {
      lastActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [options.visible]);

  // hideOnEsc
  React.useEffect(() => {
    const portal = getPortal();

    if (!unstable_hideOnEsc || !portal || !options.visible) {
      return undefined;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !options.hide || !ref.current) return;
      if (ref.current.contains(e.target as Node) || e.target === portal) {
        options.hide();
      }
    };

    portal.addEventListener("keydown", handleKeyDown);

    return () => portal.removeEventListener("keydown", handleKeyDown);
  }, [getPortal, options.hide, unstable_hideOnEsc, options.visible]);

  // hide on click outside
  React.useEffect(() => {
    const portal = getPortal();

    if (!unstable_hideOnClickOutside || !options.visible || !portal) {
      return undefined;
    }

    const handleInteractionOutside = (e: MouseEvent | FocusEvent) => {
      const target = e.target as HTMLElement;
      const targetConstrols = target.getAttribute("aria-controls");

      const shouldHide =
        // parentNode is the portal wrapper
        // we're using it (instead of just popoverRef.current)
        // to include nested portals
        !portal.contains(target) &&
        // make sure we aren't dealing with the toggler
        (!targetConstrols || targetConstrols !== options.baseId) &&
        options.hide;

      if (shouldHide) {
        window.requestAnimationFrame(() => {
          options.hide!();
        });
      }
    };
    document.addEventListener("click", handleInteractionOutside);
    document.addEventListener("focus", handleInteractionOutside, true);
    return () => {
      document.removeEventListener("click", handleInteractionOutside);
      document.removeEventListener("focus", handleInteractionOutside, true);
    };
  }, [
    getPortal,
    unstable_hideOnClickOutside,
    options.baseId,
    options.visible,
    options.hide
  ]);

  // handle click inside
  React.useEffect(() => {
    const portal = getPortal();

    if (!portal || !options.visible) return undefined;

    const handle = (e: MouseEvent | TouchEvent) => {
      if (!portal.contains(e.target as Node)) return;
      if (document.activeElement === document.body) {
        portal.focus();
      }
    };
    portal.addEventListener("touchstart", handle);
    portal.addEventListener("mousedown", handle);
    return () => {
      portal.removeEventListener("touchstart", handle);
      portal.removeEventListener("mousedown", handle);
    };
  }, [getPortal, options.visible]);

  // Restore focus on the activeElement after closing the dialog
  React.useEffect(() => {
    const portal = getPortal();

    if (!portal || options.visible) return;

    // There's already a focused element outside the portal, do nothing
    if (
      !portal.contains(document.activeElement) &&
      document.activeElement !== document.body
    ) {
      return;
    }

    const focusOnHideElement =
      options.unstable_focusOnHide && options.unstable_focusOnHide.current;

    if (focusOnHideElement) {
      focusOnHideElement.focus();
    } else if (lastActiveElement.current) {
      lastActiveElement.current.focus();
    }
  }, [getPortal, options.visible, options.unstable_focusOnHide]);

  // Focus the first tabbable/focusable element when the dialog opens
  React.useEffect(() => {
    const portal = getPortal();

    if (!portal || !options.visible) return;

    const focusOnShowElement =
      options.unstable_focusOnShow && options.unstable_focusOnShow.current;

    if (focusOnShowElement) {
      focusOnShowElement.focus();
    } else {
      const tabbable = portal.querySelector<HTMLElement>(tabbableSelector);
      if (tabbable) {
        tabbable.focus();
      } else {
        // If there's no tabblable element, fallback to the focusable ones
        const focusable = portal.querySelector<HTMLElement>(focusableSelector);
        if (focusable) {
          focusable.focus();
        } else {
          // If there's no focusable element, fallback to the portal itself
          portal.focus({ preventScroll: true });
        }
      }
    }
  }, [getPortal, options.visible, options.unstable_focusOnShow]);

  // Focus trap
  React.useEffect(() => {
    const portal = getPortal();

    if (!portal || !options.visible) return undefined;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      // If there's nested open dialogs, let them handle it
      const nestedOpenDialogs = portal.querySelectorAll(
        "[role=dialog][aria-hidden=false]"
      );
      if (nestedOpenDialogs.length > 1) return;

      const focusables = Array.from(
        portal.querySelectorAll<HTMLElement>(focusableSelector)
      );
      focusables.unshift(portal);
      const tabbables = Array.from(
        portal.querySelectorAll<HTMLElement>(tabbableSelector)
      );

      const focused = focusables.find(f => f === document.activeElement);

      if (!focused) return;

      const tabbableIndex = tabbables.indexOf(focused);

      if (options.modal) {
        e.preventDefault();
        const previousTabbableIndex =
          tabbableIndex > 0 ? tabbableIndex - 1 : tabbables.length - 1;
        const nextTabbableIndex =
          tabbableIndex + 1 < tabbables.length ? tabbableIndex + 1 : 0;
        const previousTabbable = tabbables[previousTabbableIndex];
        const nextTabbable = tabbables[nextTabbableIndex];

        if (e.shiftKey && previousTabbable) {
          previousTabbable.focus();
        } else if (!e.shiftKey && nextTabbable) {
          nextTabbable.focus();
        }

        return;
      }

      if (!lastActiveElement.current) return;

      if (e.shiftKey && tabbableIndex <= 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        lastActiveElement.current.focus();
      } else if (!e.shiftKey && tabbableIndex === tabbables.length - 1) {
        const documentTabbables = Array.from(
          document.querySelectorAll<HTMLElement>(tabbableSelector)
        );
        const lastActiveElementIndex = documentTabbables.indexOf(
          lastActiveElement.current
        );
        const nextDocumentTabbable =
          documentTabbables[lastActiveElementIndex + 1];
        if (nextDocumentTabbable) {
          e.preventDefault();
          e.stopImmediatePropagation();
          nextDocumentTabbable.focus();
        }
      }
    };

    portal.addEventListener("keydown", handleTab);
    return () => portal.removeEventListener("keydown", handleTab);
  }, [getPortal, options.visible, options.modal]);

  htmlProps = mergeProps(
    {
      ref,
      role: "dialog"
    } as typeof htmlProps,
    // necessary for escaping nested dialogs
    // unstable_hideOnEsc ? { "data-hide-on-esc": true } : {},
    // unstable_hideOnClickOutside ? { "data-hide-on-click-outside": true } : {},
    options.modal ? { "aria-modal": true } : {},
    htmlProps
  );
  const allOptions = { unstable_hideOnEsc, ...options };
  htmlProps = useHidden(allOptions, htmlProps);
  htmlProps = unstable_useHook("useDialog", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogOptions> = [
  ...useHidden.keys,
  ...useDialogState.keys,
  "modal",
  "unstable_focusOnHide",
  "unstable_focusOnShow",
  "unstable_hideOnEsc",
  "unstable_hideOnClickOutside"
];

useDialog.keys = keys;

export const Dialog = unstable_createComponent(
  "div",
  useDialog,
  // @ts-ignore: TODO typeof createElement
  (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
