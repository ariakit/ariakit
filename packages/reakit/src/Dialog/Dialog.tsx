import * as React from "react";
import { warning, useWarning } from "reakit-warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { usePipe } from "reakit-utils/usePipe";
import {
  DisclosureContentOptions,
  DisclosureContentHTMLProps,
  useDisclosureContent
} from "../Disclosure/DisclosureContent";
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

export type DialogOptions = DisclosureContentOptions &
  Pick<
    Partial<DialogStateReturn>,
    "modal" | "setModal" | "unstable_modal" | "hide"
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

export type DialogHTMLProps = DisclosureContentHTMLProps;

export type DialogProps = DialogOptions & DialogHTMLProps;

export const useDialog = createHook<DialogOptions, DialogHTMLProps>({
  name: "Dialog",
  compose: useDisclosureContent,
  useState: useDialogState,
  keys: [
    "hideOnEsc",
    "hideOnClickOutside",
    "preventBodyScroll",
    "unstable_initialFocusRef",
    "unstable_finalFocusRef",
    "unstable_orphan",
    "unstable_autoFocusOnShow",
    "unstable_autoFocusOnHide"
  ],

  useOptions({
    modal = true,
    hideOnEsc = true,
    hideOnClickOutside = true,
    preventBodyScroll = modal,
    unstable_autoFocusOnShow = true,
    unstable_autoFocusOnHide = true,
    unstable_orphan,
    unstable_modal,
    setModal,
    ...options
  }) {
    React.useEffect(() => {
      if (setModal && unstable_modal !== modal) {
        warning(
          true,
          "Setting `modal` prop on `Dialog` is deprecated. Set it on `useDialogState` instead.",
          "See https://github.com/reakit/reakit/pull/535"
        );
        setModal(modal);
      }
    }, [setModal, unstable_modal, modal]);

    return {
      modal,
      hideOnEsc,
      hideOnClickOutside,
      preventBodyScroll: modal && preventBodyScroll,
      unstable_autoFocusOnShow,
      unstable_autoFocusOnHide,
      unstable_orphan: modal && unstable_orphan,
      ...options
    };
  },

  useProps(
    options,
    {
      ref: htmlRef,
      onKeyDown: htmlOnKeyDown,
      wrapElement: htmlWrapElement,
      ...htmlProps
    }
  ) {
    const dialog = React.useRef<HTMLElement>(null);
    const backdrop = React.useContext(DialogBackdropContext);
    const disclosures = useDisclosuresRef(dialog, options);
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
              "`hideOnEsc` prop is truthy, but `hide` prop wasn't provided.",
              "See https://reakit.io/docs/dialog",
              dialog.current
            );
            return;
          }
          event.stopPropagation();
          options.hide();
        }
      },
      [options.hideOnEsc, options.hide]
    );

    const wrapElement = React.useCallback(
      (element: React.ReactNode) => {
        if (options.modal && !backdrop) {
          return <Portal>{wrap(element)}</Portal>;
        }
        return wrap(element);
      },
      [options.modal, backdrop, wrap]
    );

    return {
      ref: useForkRef(dialog, htmlRef),
      role: "dialog",
      tabIndex: -1,
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      wrapElement: usePipe(wrapElement, htmlWrapElement),
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
    useWarning(
      !props["aria-label"] && !props["aria-labelledby"],
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/dialog"
    );
    return useCreateElement(type, props, children);
  }
});
