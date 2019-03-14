import * as React from "react";
import warning from "tiny-warning";
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
import { useDisclosureRef } from "./__utils/useDisclosureRef";
import { usePreventBodyScroll } from "./__utils/usePreventBodyScroll";
import { useFocusOnShow } from "./__utils/useFocusOnShow";
import { usePortalRef } from "./__utils/usePortalRef";
import { useEventListenerOutside } from "./__utils/useEventListenerOutside";
import { useAttachAndInvoke } from "./__utils/useAttachAndInvoke";
import { useFocusTrap } from "./__utils/useFocusTrap";
import { useFocusOnHide } from "./__utils/useFocusOnHide";

export type unstable_DialogOptions = unstable_HiddenOptions &
  Partial<unstable_DialogStateReturn> &
  Pick<unstable_DialogStateReturn, "refId"> & {
    /** TODO: Description */
    modal?: boolean;
    /** TODO: Description */
    hideOnEsc?: boolean;
    /** TODO: Description */
    hideOnClickOutside?: boolean;
    /** TODO: Description */
    preventBodyScroll?: boolean;
    /** TODO: Description */
    focusOnShow?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    focusOnHide?: React.RefObject<HTMLElement>;
  };

export type unstable_DialogProps = unstable_HiddenProps;

function getDisclosureContainer() {
  return document.activeElement || document.body;
}

export function useDialog(
  {
    modal = true,
    hideOnEsc = true,
    hideOnClickOutside = true,
    preventBodyScroll = true,
    ...options
  }: unstable_DialogOptions,
  htmlProps: unstable_DialogProps = {}
) {
  const allOptions = { modal, hideOnEsc, hideOnClickOutside, ...options };
  const dialog = React.useRef<HTMLElement | null>(null);
  const portal = usePortalRef(dialog);
  const disclosure = useDisclosureRef(
    options.refId,
    getDisclosureContainer,
    options.visible
  );

  preventBodyScroll = !modal ? false : preventBodyScroll;
  usePreventBodyScroll(dialog, options.visible && preventBodyScroll);

  useFocusTrap(dialog, portal, hideOnClickOutside, options.visible && modal);

  useFocusOnShow(dialog, portal, options.focusOnShow, options.visible);

  useFocusOnHide(dialog, disclosure, options.focusOnHide, !options.visible);

  // Close all nested dialogs when parent dialog closes
  useAttachAndInvoke(dialog, portal, options.hide, !options.visible);

  const hide = React.useCallback(
    e => {
      // Ignore disclosure since a click on it will already close the dialog
      if (e.target !== disclosure.current && options.hide) {
        options.hide();
      }
    },
    [disclosure, options.hide]
  );

  // Hide on click outside
  useEventListenerOutside(
    // Portal, not dialog, so clicks on nested dialogs/portals don't close
    // the parent dialog
    portal,
    "click",
    hide,
    options.visible && hideOnClickOutside
  );

  // Hide on focus outside (for non-modal dialogs with hideOnClickOutside=true)
  useEventListenerOutside(
    portal,
    "focus",
    hide,
    options.visible && !modal && hideOnClickOutside
  );

  htmlProps = mergeProps(
    {
      ref: dialog,
      role: "dialog",
      tabIndex: -1,
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
  "modal",
  "hideOnEsc",
  "hideOnClickOutside",
  "preventBodyScroll",
  "focusOnHide",
  "focusOnShow"
];

useDialog.keys = keys;

export const Dialog = unstable_createComponent(
  "div",
  useDialog,
  (type, props, children) => {
    warning(
      props["aria-label"] || props["aria-labelledby"],
      `[reakit/Dialog]
You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props`
    );

    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
