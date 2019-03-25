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
import { Keys } from "../__utils/types";
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
  Pick<unstable_DialogStateReturn, "unstable_hiddenId"> & {
    /**
     * Toggles Dialog's `modal` state.
     *  - Non-modal: `preventBodyScroll` doesn't work and focus is free.
     *  - Modal: `preventBodyScroll` is automatically enabled and focus is
     * trapped within the dialog.
     * @default true
     */
    unstable_modal?: boolean;
    /**
     * When enabled, user can hide the dialog by pressing `Escape`.
     * @default true
     */
    unstable_hideOnEsc?: boolean;
    /**
     * When enabled, user can hide the dialog by clicking outside it.
     * @default true
     */
    unstable_hideOnClickOutside?: boolean;
    /**
     * When enabled, user can't scroll on body when the dialog is visible.
     * This option doesn't work if the dialog isn't modal.
     * @default true
     */
    unstable_preventBodyScroll?: boolean;
    /**
     * The element that will be focused when the dialog shows.
     * When not set, the first tabbable element within the dialog will be used.
     * `autoFocusOnShow` disables it.
     */
    unstable_initialFocusRef?: React.RefObject<HTMLElement>;
    /**
     * The element that will be focused when the dialog hides.
     * When not set, the disclosure component will be used.
     * `autoFocusOnHide` disables it.
     */
    unstable_finalFocusRef?: React.RefObject<HTMLElement>;
    /**
     * Whether or not to move focus when the dialog shows.
     * @default true
     */
    unstable_autoFocusOnShow?: boolean;
    /**
     * Whether or not to move focus when the dialog hides.
     * @default true
     */
    unstable_autoFocusOnHide?: boolean;
  };

export type unstable_DialogProps = unstable_HiddenProps;

export function useDialog(
  {
    unstable_modal = true,
    unstable_hideOnEsc = true,
    unstable_hideOnClickOutside = true,
    unstable_preventBodyScroll = true,
    unstable_autoFocusOnShow = true,
    unstable_autoFocusOnHide = true,
    ...options
  }: unstable_DialogOptions,
  htmlProps: unstable_DialogProps = {}
) {
  const allOptions: unstable_DialogOptions = {
    unstable_modal,
    unstable_hideOnEsc,
    unstable_hideOnClickOutside,
    unstable_preventBodyScroll,
    unstable_autoFocusOnShow,
    unstable_autoFocusOnHide,
    ...options
  };
  const dialog = React.useRef<HTMLElement>(null);
  const portal = usePortalRef(dialog, options.visible);
  const disclosure = useDisclosureRef(
    options.unstable_hiddenId,
    options.visible
  );

  unstable_preventBodyScroll = !unstable_modal
    ? false
    : unstable_preventBodyScroll;
  usePreventBodyScroll(dialog, options.visible && unstable_preventBodyScroll);

  useFocusTrap(dialog, portal, options.visible && unstable_modal);

  useFocusOnShow(
    dialog,
    portal,
    options.unstable_initialFocusRef,
    options.visible && unstable_autoFocusOnShow
  );

  useFocusOnHide(
    dialog,
    options.unstable_finalFocusRef || disclosure,
    !options.visible && unstable_autoFocusOnHide
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
    options.visible && unstable_hideOnClickOutside
  );

  // Hide on focus outside
  useEventListenerOutside(
    portal,
    "focus",
    hide,
    options.visible && !unstable_modal && unstable_hideOnClickOutside
  );

  htmlProps = mergeProps(
    {
      ref: dialog,
      role: "dialog",
      tabIndex: -1,
      "aria-modal": unstable_modal,
      "data-dialog": true,
      onKeyDown: event => {
        const keyMap = {
          Escape: () => {
            if (!options.hide || !unstable_hideOnEsc) return;
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

const keys: Keys<unstable_DialogOptions> = [
  ...useHidden.__keys,
  ...useDialogState.__keys,
  "unstable_modal",
  "unstable_hideOnEsc",
  "unstable_hideOnClickOutside",
  "unstable_preventBodyScroll",
  "unstable_initialFocusRef",
  "unstable_finalFocusRef",
  "unstable_autoFocusOnShow",
  "unstable_autoFocusOnHide"
];

useDialog.__keys = keys;

export const Dialog = unstable_createComponent({
  as: "div",
  useHook: useDialog,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props`,
      "Dialog"
    );

    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
});
