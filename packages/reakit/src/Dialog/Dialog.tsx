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
import { DialogBackdropContext } from "./__utils/DialogBackdropContext";

export type DialogOptions = HiddenOptions &
  Pick<
    Partial<DialogStateReturn>,
    | "modal"
    | "setModal"
    | "unstable_portal"
    | "unstable_setPortal"
    | "unstable_orphan"
    | "unstable_setOrphan"
    | "unstable_stateValues"
    | "hide"
  > &
  Pick<DialogStateReturn, "baseId"> & {
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
    "hideOnEsc",
    "hideOnClickOutside",
    "preventBodyScroll",
    "unstable_initialFocusRef",
    "unstable_finalFocusRef",
    "unstable_autoFocusOnShow",
    "unstable_autoFocusOnHide"
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
    unstable_stateValues,
    setModal,
    unstable_setPortal: setPortal,
    unstable_setOrphan: setOrphan,
    ...options
  }) {
    const trulyOrphan = Boolean(modal && unstable_orphan);
    const { modal: stateModal, portal: statePortal, orphan: stateOrphan } =
      unstable_stateValues || {};

    if (setModal && stateModal !== modal) {
      // warning(
      //   true,
      //   "[reakit/Dialog]",
      //   "Setting `modal` prop on `Dialog` is deprecated. Set it on `useDialogState` (or a derivative state hook, such as `useMenuState`) instead.",
      //   "See https://github.com/reakit/reakit/pull/535"
      // );
      setModal(modal);
    }

    if (setPortal && statePortal !== unstable_portal) {
      // warning(
      //   true,
      //   "[reakit/Dialog]",
      //   "Setting `unstable_portal` prop on `Dialog` is deprecated. Set it on `useDialogState` (or a derivative state hook, such as `useMenuState`) instead.",
      //   "See https://github.com/reakit/reakit/pull/535"
      // );
      setPortal(unstable_portal);
    }

    if (setOrphan && stateOrphan !== trulyOrphan) {
      // warning(
      //   true,
      //   "[reakit/Dialog]",
      //   "Setting `unstable_orphan` prop on `Dialog` is deprecated. Set it on `useDialogState` (or a derivative state hook, such as `useMenuState`) instead.",
      //   "See https://github.com/reakit/reakit/pull/535"
      // );
      setOrphan(trulyOrphan);
    }

    return {
      modal,
      hideOnEsc,
      hideOnClickOutside,
      preventBodyScroll,
      unstable_autoFocusOnShow,
      unstable_autoFocusOnHide,
      unstable_portal,
      unstable_orphan: trulyOrphan,
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
    const backdrop = React.useContext(DialogBackdropContext);
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
              "[reakit/Dialog]",
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
        if (options.unstable_portal && !backdrop) {
          return <Portal>{wrap(children)}</Portal>;
        }
        return wrap(children);
      },
      [options.unstable_portal, backdrop, wrap]
    );

    return {
      ref: mergeRefs(dialog, htmlRef),
      role: "dialog",
      tabIndex: -1,
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      unstable_wrap: usePipe(wrapChildren, htmlWrap),
      "aria-modal": options.modal ? true : undefined,
      "data-dialog": true,
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
      "[reakit/Dialog]",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/dialog"
    );
    return useCreateElement(type, props, children);
  }
});
