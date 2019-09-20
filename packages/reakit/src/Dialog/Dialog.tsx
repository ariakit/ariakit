import * as React from "react";
import { warning } from "reakit-utils/warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { usePipe } from "reakit-utils/usePipe";
import { HiddenOptions, HiddenHTMLProps, useHidden } from "../Hidden/Hidden";
import { Portal } from "../Portal/Portal";
import { useDisclosuresRef } from "./__utils/useDisclosuresRef";
import { usePreventBodyScroll } from "./__utils/usePreventBodyScroll";
import { useFocusOnShow } from "./__utils/useFocusOnShow";
import { useFocusTrap } from "./__utils/useFocusTrap";
import { useFocusOnHide } from "./__utils/useFocusOnHide";
import { useNestedDialogs } from "./__utils/useNestedDialogs";
import { useHideOnClickOutside } from "./__utils/useHideOnClickOutside";
import { useDialogState, DialogStateReturn } from "./DialogState";
import { useDisableHoverOutside } from "./__utils/useDisableHoverOutside";

export type DialogOptions = HiddenOptions &
  Pick<Partial<DialogStateReturn>, "hide"> &
  Pick<DialogStateReturn, "unstable_hiddenId"> & {
    /**
     * Toggles Dialog's `modal` state.
     *  - Non-modal: `preventBodyScroll` doesn't work and focus is free.
     *  - Modal: `preventBodyScroll` is automatically enabled, focus is
     * trapped within the dialog and the dialog is rendered within a `Portal`
     * by default.
     */
    modal?: boolean;
    /**
     * When enabled, user can hide the dialog by pressing `Escape`.
     */
    hideOnEsc?: boolean;
    /**
     * When enabled, user can hide the dialog by clicking outside it.
     */
    hideOnClickOutside?: boolean;
    /**
     * When enabled, user can't scroll on body when the dialog is visible.
     * This option doesn't work if the dialog isn't modal.
     */
    preventBodyScroll?: boolean;
    /**
     * The element that will be focused when the dialog shows.
     * When not set, the first tabbable element within the dialog will be used.
     */
    unstable_initialFocusRef?: React.RefObject<HTMLElement>;
    /**
     * The element that will be focused when the dialog hides.
     * When not set, the disclosure component will be used.
     */
    unstable_finalFocusRef?: React.RefObject<HTMLElement>;
    /**
     * Whether or not the dialog should be rendered within `Portal`.
     * It's `true` by default if `modal` is `true`.
     */
    unstable_portal?: boolean;
    /**
     * Whether or not the dialog should be a child of its parent.
     * Opening a nested orphan dialog will close its parent dialog if
     * `hideOnClickOutside` is set to `true` on the parent.
     * It will be set to `false` if `modal` is `false`.
     */
    unstable_orphan?: boolean;
    /**
     * Whether or not to move focus when the dialog shows.
     * @private
     */
    unstable_autoFocusOnShow?: boolean;
    /**
     * Whether or not to move focus when the dialog hides.
     * @private
     */
    unstable_autoFocusOnHide?: boolean;
  };

export type DialogHTMLProps = HiddenHTMLProps;

export type DialogProps = DialogOptions & DialogHTMLProps;

export const useDialog = createHook<DialogOptions, DialogHTMLProps>({
  name: "Dialog",
  compose: useHidden,
  useState: useDialogState,
  keys: [
    "modal",
    "hideOnEsc",
    "hideOnClickOutside",
    "preventBodyScroll",
    "unstable_initialFocusRef",
    "unstable_finalFocusRef",
    "unstable_autoFocusOnShow",
    "unstable_autoFocusOnHide",
    "unstable_portal",
    "unstable_orphan"
  ],

  useOptions({
    modal = true,
    hideOnEsc = true,
    hideOnClickOutside = true,
    preventBodyScroll = true,
    unstable_autoFocusOnShow = true,
    unstable_autoFocusOnHide = true,
    unstable_portal = modal,
    unstable_orphan,
    ...options
  }) {
    return {
      modal,
      hideOnEsc,
      hideOnClickOutside,
      preventBodyScroll,
      unstable_autoFocusOnShow,
      unstable_autoFocusOnHide,
      unstable_portal,
      unstable_orphan: modal && unstable_orphan,
      ...options
    };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      onKeyDown: htmlOnKeyDown,
      unstable_wrap: htmlWrap,
      ...htmlProps
    }
  ) {
    const dialog = React.useRef<HTMLElement>(null);
    const disclosures = useDisclosuresRef(options);
    const { dialogs, wrap } = useNestedDialogs(dialog, options);

    usePreventBodyScroll(dialog, options);
    useFocusTrap(dialog, dialogs, options);
    useFocusOnShow(dialog, dialogs, options);
    useFocusOnHide(dialog, disclosures, options);
    useHideOnClickOutside(dialog, disclosures, dialogs, options);
    useDisableHoverOutside(dialog, dialogs, options);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Escape" && options.hideOnEsc) {
          if (!options.hide) {
            warning(
              true,
              "Dialog",
              "`hideOnEsc` prop is truthy, but `hide` prop wasn't provided.",
              "See https://reakit.io/docs/dialog"
            );
            return;
          }
          event.stopPropagation();
          options.hide();
        }
      },
      [options.hideOnEsc, options.hide]
    );

    const wrapChildren = React.useCallback(
      (children: React.ReactNode) => {
        if (options.unstable_portal) {
          return <Portal>{wrap(children)}</Portal>;
        }
        return wrap(children);
      },
      [options.unstable_portal, wrap]
    );

    return {
      ref: mergeRefs(dialog, htmlRef),
      role: "dialog",
      tabIndex: -1,
      "aria-modal": options.modal,
      "data-dialog": true,
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      unstable_wrap: usePipe(wrapChildren, htmlWrap),
      ...htmlProps
    };
  }
});

export const Dialog = createComponent({
  as: "div",
  useHook: useDialog,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "Dialog",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/dialog"
    );
    return useCreateElement(type, props, children);
  }
});
