// TODO: Refactor
import * as React from "react";
import * as BodyScrollLock from "body-scroll-lock";
import {
  isTabbable,
  selectFirstTabbableIn,
  selectLastTabbableIn
} from "../__utils/tabbable";
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
    unstable_disableBodyScroll?: boolean;
    /** TODO: Description */
    unstable_focusOnShow?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    unstable_focusOnHide?: React.RefObject<HTMLElement>;
  };

export type unstable_DialogProps = unstable_HiddenProps;

function hasNestedOpenDialogs(portal: Element) {
  return portal.querySelectorAll("[role=dialog][aria-hidden=false]").length > 1;
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
  return container.querySelector(`[aria-controls~="${refId}"]`) || container;
}

export function useDialog(
  {
    modal = true,
    hideOnEsc = true,
    hideOnClickOutside = true,
    unstable_disableBodyScroll = true,
    ...options
  }: unstable_DialogOptions,
  htmlProps: unstable_DialogProps = {}
) {
  const allOptions = { modal, hideOnEsc, hideOnClickOutside, ...options };
  const ref = React.useRef<HTMLElement | null>(null);
  const disclosure = React.useRef<HTMLElement | null>(null);
  const lastFocus = React.useRef<Element | null>(null);

  // body scroll
  React.useEffect(() => {
    const dialog = ref.current;
    const portal = getPortal(dialog);

    if (!portal || !unstable_disableBodyScroll || !options.visible) {
      return undefined;
    }

    BodyScrollLock.disableBodyScroll(dialog);

    return () => BodyScrollLock.enableBodyScroll(dialog);
  }, [unstable_disableBodyScroll, options.visible]);

  // Store the active element before focusing dialog
  React.useEffect(() => {
    if (!options.visible || !document.activeElement) return;
    disclosure.current = getDisclosure(
      document.activeElement,
      options.refId
    ) as HTMLElement;
  }, [options.visible]);

  // hideOnEsc
  React.useEffect(() => {
    const dialog = ref.current;
    if (!hideOnEsc || !dialog || !options.visible) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !options.hide) return;
      if (dialog.contains(e.target as Node)) {
        options.hide();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [options.hide, hideOnEsc, options.visible]);

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

    if (!dialog || !options.visible) return;

    const focusOnShowElement =
      options.unstable_focusOnShow && options.unstable_focusOnShow.current;

    if (focusOnShowElement) {
      focusOnShowElement.focus();
      lastFocus.current = focusOnShowElement;
    } else {
      const tabbable = selectFirstTabbableIn(dialog, true);
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
      if (hasNestedOpenDialogs(portal)) return;
      if (portal.contains(activeElement)) {
        lastFocus.current = activeElement;
        return;
      }

      e.preventDefault();
      e.stopImmediatePropagation();

      let tabbable = selectFirstTabbableIn(dialog, true);

      if (tabbable) {
        if (lastFocus.current === tabbable || lastFocus.current === portal) {
          tabbable = selectLastTabbableIn(dialog, true) || tabbable;
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

  // click on document.body
  React.useEffect(() => {
    if (!options.visible || hideOnClickOutside) return undefined;

    const handleClick = () => {
      const dialog = ref.current;
      if (!dialog) return;
      if (document.activeElement === document.body) {
        dialog.focus();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
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

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("focus", handleClick, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("focus", handleClick, true);
    };
  }, [hideOnClickOutside, options.visible, options.hide]);

  htmlProps = mergeProps(
    {
      ref,
      role: "dialog",
      tabIndex: -1,
      "aria-label": options.label,
      "aria-modal": modal
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
  "unstable_focusOnHide",
  "unstable_focusOnShow",
  "hideOnEsc",
  "hideOnClickOutside"
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
