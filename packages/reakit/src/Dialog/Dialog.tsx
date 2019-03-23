import * as React from "react";
import { warning } from "../__utils/warning";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { Portal } from "../Portal/Portal";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../Hidden/Hidden";
import { useDisclosureRef } from "./__utils/useDisclosureRef";
import { usePreventBodyScroll } from "./__utils/usePreventBodyScroll";
import { useFocusOnShow } from "./__utils/useFocusOnShow";
import { usePortalRef } from "./__utils/usePortalRef";
import { useEventListenerOutside } from "./__utils/useEventListenerOutside";
import { useAttachAndInvoke } from "./__utils/useAttachAndInvoke";
import { useFocusTrap } from "./__utils/useFocusTrap";
import { useFocusOnHide } from "./__utils/useFocusOnHide";
import { useDialogState, unstable_DialogStateReturn } from "./DialogState";

export type unstable_DialogOptions = unstable_HiddenOptions &
  Partial<unstable_DialogStateReturn> &
  Pick<unstable_DialogStateReturn, "hiddenId"> & {
    /** TODO: Description */
    modal?: boolean;
    /** TODO: Description */
    hideOnEsc?: boolean;
    /** TODO: Description */
    hideOnClickOutside?: boolean;
    /** TODO: Description */
    preventBodyScroll?: boolean;
    /** TODO: Description */
    initialFocusRef?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    finalFocusRef?: React.RefObject<HTMLElement>;
    /** TODO: Description */
    autoFocusOnShow?: boolean;
    /** TODO: Description */
    autoFocusOnHide?: boolean;
  };

export type unstable_DialogProps = unstable_HiddenProps;

export function useDialog(
  {
    modal = true,
    hideOnEsc = true,
    hideOnClickOutside = true,
    preventBodyScroll = true,
    autoFocusOnShow = true,
    autoFocusOnHide = true,
    ...options
  }: unstable_DialogOptions,
  htmlProps: unstable_DialogProps = {}
) {
  const allOptions = {
    modal,
    hideOnEsc,
    hideOnClickOutside,
    preventBodyScroll,
    autoFocusOnShow,
    autoFocusOnHide,
    ...options
  };
  const dialog = React.useRef<HTMLElement>(null);
  const portal = usePortalRef(dialog, options.visible);
  const disclosure = useDisclosureRef(options.hiddenId, options.visible);

  preventBodyScroll = !modal ? false : preventBodyScroll;
  usePreventBodyScroll(dialog, options.visible && preventBodyScroll);

  useFocusTrap(dialog, portal, options.visible && modal);

  useFocusOnShow(
    dialog,
    portal,
    options.initialFocusRef,
    options.visible && autoFocusOnShow
  );

  useFocusOnHide(
    dialog,
    options.finalFocusRef || disclosure,
    !options.visible && autoFocusOnHide
  );

  // Close all nested dialogs when parent dialog closes
  useAttachAndInvoke(dialog, portal, "hide", options.hide, !options.visible);

  const hide = (e: Event) => {
    // Ignore disclosure since a click on it will already close the dialog
    if (e.target !== disclosure.current && options.hide) {
      options.hide();
    }
  };

  // Hide on click outside
  useEventListenerOutside(
    // Portal, not dialog, so clicks on nested dialogs/portals don't close
    // the parent dialog
    portal,
    "click",
    hide,
    options.visible && hideOnClickOutside
  );

  // Hide on focus outside
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
      "data-dialog": true,
      onKeyDown: event => {
        const keyMap = {
          Escape: () => {
            if (!options.hide || !hideOnEsc) return;
            event.stopPropagation();
            options.hide();
          }
        };
        if (event.key in keyMap) {
          keyMap[event.key as keyof typeof keyMap]();
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useHidden(allOptions, htmlProps);
  htmlProps = useHook("useDialog", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogOptions> = [
  ...useHidden.keys,
  ...useDialogState.keys,
  "modal",
  "hideOnEsc",
  "hideOnClickOutside",
  "preventBodyScroll",
  "initialFocusRef",
  "finalFocusRef",
  "autoFocusOnShow",
  "autoFocusOnHide"
];

useDialog.keys = keys;

export const Dialog = unstable_createComponent(
  "div",
  useDialog,
  (type, props, children) => {
    warning(
      props["aria-label"] || props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props`,
      "Dialog"
    );

    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
