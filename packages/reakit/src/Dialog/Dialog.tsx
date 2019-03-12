// TODO: Refactor
import * as React from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
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
import {
  isTabbable,
  getFirstTabbableIn,
  getLastTabbableIn
} from "./__utils/tabbable";
import { useDialogState, unstable_DialogStateReturn } from "./DialogState";

export type unstable_DialogOptions = unstable_HiddenOptions &
  Partial<unstable_DialogStateReturn> &
  Pick<unstable_DialogStateReturn, "refId"> & {
    /** TODO: Description */
    label: string;
    /** TODO: Description */
    modal?: boolean;
    /** TODO: Description */
    hideOnEsc?: boolean;
    /** TODO: Description */
    hideOnClickOutside?: boolean;
    /** TODO: Description */
    unstable_preventBodyScroll?: boolean;
    /** TODO: Description */
    unstable_focusOnShow?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    unstable_focusOnHide?: React.RefObject<HTMLElement>;
  };

export type unstable_DialogProps = unstable_HiddenProps;

function getNestedOpenDialogs(portal: Element) {
  return Array.from(
    portal.querySelectorAll("[role=dialog][aria-hidden=false]")
  );
}

function hasNestedOpenDialogs(portal: Element) {
  return getNestedOpenDialogs(portal).length > 1;
}

function hasNestedOpenModals(portal: Element) {
  return (
    portal.querySelectorAll("[role=dialog][aria-modal=true][aria-hidden=false]")
      .length > 1
  );
}

function getPortal(dialog: Element | null) {
  return dialog && (dialog.parentNode as HTMLElement);
}

function isDisclosure(element: Element, refId: string) {
  const attribute = element.getAttribute("aria-controls");
  if (!attribute) return false;
  return attribute.split(" ").indexOf(refId) >= 0;
}

function getDisclosure(container: Element, refId: string) {
  if (isDisclosure(container, refId)) {
    return container;
  }
  return container.querySelector(`[aria-controls~="${refId}"]`);
}

export function useDialog(
  {
    modal = true,
    hideOnEsc = true,
    hideOnClickOutside = true,
    unstable_preventBodyScroll = true,
    ...options
  }: unstable_DialogOptions,
  htmlProps: unstable_DialogProps = {}
) {
  const allOptions = { modal, hideOnEsc, hideOnClickOutside, ...options };
  const ref = React.useRef<HTMLElement | null>(null);
  const disclosure = React.useRef<HTMLElement | null>(null);
  const lastFocus = React.useRef<Element | null>(null);

  // Attach hide to element
  React.useEffect(() => {
    if (!ref.current) return;
    Object.defineProperty(ref.current, "hide", {
      writable: true,
      value: options.hide
    });
  }, [options.hide]);

  // Close nested dialogs
  React.useEffect(() => {
    const dialog = ref.current;
    const portal = getPortal(dialog);

    if (!portal || options.visible) return;

    const nestedOpenDialogs = getNestedOpenDialogs(portal);
    if (nestedOpenDialogs.length) {
      nestedOpenDialogs.forEach(openDialog => {
        // @ts-ignore
        if (typeof openDialog.hide === "function") {
          // @ts-ignore
          openDialog.hide();
        }
      });
    }
  }, [options.visible]);

  // Body scroll
  React.useEffect(() => {
    const dialog = ref.current;

    if (!dialog || !unstable_preventBodyScroll || !options.visible) {
      return undefined;
    }

    disableBodyScroll(dialog);
    return () => enableBodyScroll(dialog);
  }, [unstable_preventBodyScroll, options.visible]);

  // Store the active element before focusing dialog
  React.useEffect(() => {
    if (!options.visible || !document.activeElement) return;
    disclosure.current = getDisclosure(
      document.activeElement,
      options.refId
    ) as HTMLElement;
  }, [options.visible]);

  // Restore focus on the activeElement after closing the dialog
  React.useEffect(() => {
    if (options.visible) return;

    const dialog = ref.current;
    if (!dialog) return;

    // There's already a focused element outside the portal, do nothing
    if (
      document.activeElement &&
      !dialog.contains(document.activeElement) &&
      isTabbable(document.activeElement)
    ) {
      return;
    }

    const focusOnHideElement =
      options.unstable_focusOnHide && options.unstable_focusOnHide.current;

    if (focusOnHideElement) {
      focusOnHideElement.focus();
    } else if (disclosure.current) {
      disclosure.current.focus();
    }
  }, [options.visible, options.unstable_focusOnHide]);

  // Focus the first tabbable/focusable element when the dialog opens
  React.useEffect(() => {
    const dialog = ref.current;
    const portal = getPortal(dialog);

    if (!portal || !dialog || !options.visible) return;
    if (hasNestedOpenDialogs(portal)) return;

    const focusOnShowElement =
      options.unstable_focusOnShow && options.unstable_focusOnShow.current;

    if (focusOnShowElement) {
      focusOnShowElement.focus();
      lastFocus.current = focusOnShowElement;
    } else {
      const tabbable = getFirstTabbableIn(dialog, true);
      if (tabbable) {
        tabbable.focus();
        lastFocus.current = tabbable;
      } else {
        dialog.focus();
        lastFocus.current = dialog;
      }
    }
  }, [options.visible, options.unstable_focusOnShow]);

  // backdrop
  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !modal || hideOnClickOutside || !options.visible) {
      return undefined;
    }
    const backdrop = document.createElement("div");
    backdrop.style.cssText =
      "position: fixed; top: 0; right: 0; bottom: 0; left: 0";
    dialog.insertAdjacentElement("beforebegin", backdrop);
    return () => backdrop.remove();
  }, [modal, hideOnClickOutside, options.visible]);

  // Focus trap hack
  // https://github.com/w3c/aria-practices/issues/545
  React.useEffect(() => {
    const dialog = ref.current;
    const portal = getPortal(dialog);
    if (!portal || !options.visible || !modal) return undefined;

    const before = document.createElement("div");
    before.tabIndex = 0;
    before.style.position = "fixed";
    before.setAttribute("aria-hidden", "true");
    const after = before.cloneNode() as Element;

    portal.insertAdjacentElement("beforebegin", before);
    portal.insertAdjacentElement("afterend", after);

    return () => {
      before.remove();
      after.remove();
    };
  }, [options.visible, modal]);

  // Focus trap
  React.useEffect(() => {
    if (!options.visible || !modal) return undefined;

    const handleFocus = (e: FocusEvent) => {
      const dialog = ref.current;
      const portal = getPortal(dialog);
      const { activeElement } = document;

      if (!portal) return;
      if (!dialog) return;
      if (!activeElement) return;
      if (hasNestedOpenModals(portal)) return;
      if (portal.contains(activeElement)) {
        lastFocus.current = activeElement;
        return;
      }

      e.preventDefault();
      e.stopImmediatePropagation();

      let tabbable = getFirstTabbableIn(dialog, true);

      if (tabbable) {
        if (lastFocus.current === tabbable || lastFocus.current === portal) {
          tabbable = getLastTabbableIn(dialog, true) || tabbable;
        }
        tabbable.focus();
        lastFocus.current = tabbable;
      } else {
        dialog.focus();
        lastFocus.current = dialog;
      }
    };

    document.addEventListener("focus", handleFocus, true);
    return () => document.removeEventListener("focus", handleFocus, true);
  }, [options.visible, modal]);

  // when focus get back to document.body
  React.useEffect(() => {
    if (!options.visible || hideOnClickOutside) return undefined;

    const handleBlur = () => {
      const dialog = ref.current;
      const portal = getPortal(dialog);
      if (!portal || !dialog) return;
      if (hasNestedOpenDialogs(portal)) return;
      if (document.activeElement === document.body) {
        dialog.focus();
      }
    };

    document.addEventListener("blur", handleBlur, true);
    return () => document.removeEventListener("blur", handleBlur, true);
  }, [hideOnClickOutside, options.visible]);

  // hide on click/focus outside
  React.useEffect(() => {
    const dialog = ref.current;
    const portal = getPortal(dialog);

    if (!hideOnClickOutside || !options.visible || !portal) {
      return undefined;
    }

    const handleClick = (e: MouseEvent | FocusEvent) => {
      const target = e.target as Element;
      if (portal.contains(target)) return;
      if (target === disclosure.current) return;

      if (options.hide) {
        options.hide();
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("focus", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("focus", handleClick, true);
    };
  }, [hideOnClickOutside, options.visible, options.hide]);

  htmlProps = mergeProps(
    {
      ref,
      role: "dialog",
      tabIndex: -1,
      "aria-label": options.label,
      "aria-modal": modal,
      onKeyDown: e => {
        const keyMap = {
          Escape: () => {
            if (!options.hide || !hideOnEsc) return;
            e.stopPropagation();
            options.hide();
          }
        };
        if (e.key in keyMap) {
          keyMap[e.key as keyof typeof keyMap]();
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useHidden(allOptions, htmlProps);
  htmlProps = unstable_useHook("useDialog", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogOptions> = [
  ...useHidden.keys,
  ...useDialogState.keys,
  "label",
  "modal",
  "hideOnEsc",
  "hideOnClickOutside",
  "unstable_preventBodyScroll",
  "unstable_focusOnHide",
  "unstable_focusOnShow"
];

useDialog.keys = keys;

export const Dialog = unstable_createComponent(
  "div",
  useDialog,
  (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
