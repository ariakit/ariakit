import {
  ComponentPropsWithRef,
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  contains,
  getActiveElement,
  getDocument,
  isButton,
} from "ariakit-utils/dom";
import { addGlobalEventListener, queueBeforeEvent } from "ariakit-utils/events";
import {
  ensureFocus,
  focusIfNeeded,
  getFirstTabbableIn,
  getLastTabbableIn,
  isFocusable,
} from "ariakit-utils/focus";
import {
  useBooleanEvent,
  useForkRef,
  useLiveRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "ariakit-utils/hooks";
import { chain } from "ariakit-utils/misc";
import { isApple, isFirefox, isSafari } from "ariakit-utils/platform";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import {
  DisclosureContentOptions,
  DisclosureContentProps,
  useDisclosureContent,
} from "../disclosure/disclosure-content";
import { FocusableOptions, useFocusable } from "../focusable/focusable";
import { HeadingLevel } from "../heading/heading-level";
import { PortalOptions, usePortal } from "../portal/portal";
import { DialogBackdrop } from "./__utils/dialog-backdrop";
import {
  DialogContext,
  DialogDescriptionContext,
  DialogHeadingContext,
} from "./__utils/dialog-context";
import { disableAccessibilityTreeOutside } from "./__utils/disable-accessibility-tree-outside";
import { disablePointerEventsOutside } from "./__utils/disable-pointer-events-outside";
import { prependHiddenDismiss } from "./__utils/prepend-hidden-dismiss";
import { useFocusOnChildUnmount } from "./__utils/use-focus-on-child-unmount";
import { useHideOnInteractOutside } from "./__utils/use-hide-on-interact-outside";
import { useHideOnUnmount } from "./__utils/use-hide-on-unmount";
import { useNestedDialogs } from "./__utils/use-nested-dialogs";
import { usePreventBodyScroll } from "./__utils/use-prevent-body-scroll";
import { DialogState } from "./dialog-state";

const isSafariOrFirefoxOnAppleDevice = isApple() && (isSafari() || isFirefox());

function isBackdrop(dialog: HTMLElement, element: Element) {
  const id = dialog.id;
  if (!id) return;
  return element.getAttribute("data-backdrop") === id;
}

function isInDialog(element: Node) {
  return (dialogRef: RefObject<Node>) =>
    dialogRef.current && contains(dialogRef.current, element);
}

function isAlreadyFocusingAnotherElement(
  dialog: HTMLElement,
  nestedDialogs?: Array<RefObject<HTMLElement>>
) {
  const activeElement = getActiveElement();
  if (!activeElement) return false;
  if (contains(dialog, activeElement)) return false;
  if (isBackdrop(dialog, activeElement)) return false;
  if (nestedDialogs?.some(isInDialog(activeElement))) return false;
  if (isFocusable(activeElement)) return true;
  return false;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const state = useDialogState();
 * const props = useDialog({ state });
 * <Role {...props}>Dialog</Role>
 * ```
 */
export const useDialog = createHook<DialogOptions>(
  ({
    state,
    focusable = true,
    modal = true,
    portal = !!modal,
    backdrop = !!modal,
    backdropProps,
    hideOnEscape = true,
    hideOnInteractOutside = true,
    preventBodyScroll = !!modal,
    autoFocusOnShow = true,
    autoFocusOnHide = true,
    initialFocusRef,
    finalFocusRef,
    ...props
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const visibleRef = useRef(state.visible);
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    const portalRef = useForkRef(setPortalNode, props.portalRef);
    // domReady can be also the portal node element so it's updated when the
    // portal node changes (like in between re-renders), triggering effects
    // again.
    const domReady = !portal || portalNode;
    // Sets preserveTabOrder to true only if the dialog is not a modal and is
    // visible.
    const preserveTabOrder = props.preserveTabOrder && !modal && state.mounted;

    // Sets disclosure ref. It needs to be a layout effect so we get the focused
    // element right before the dialog is mounted.
    useSafeLayoutEffect(() => {
      if (!state.mounted) return;
      const dialog = ref.current;
      const activeElement = getActiveElement(dialog, true);
      if (activeElement && activeElement.tagName !== "BODY") {
        state.disclosureRef.current = activeElement;
      }
    }, [state.mounted]);

    const nested = useNestedDialogs(ref, { state, modal });
    const { nestedDialogs, visibleModals, wrapElement } = nested;
    const nestedDialogsRef = useLiveRef(nestedDialogs);

    usePreventBodyScroll(preventBodyScroll && state.mounted);
    // When the dialog is unmounted, we make sure to update the state.
    useHideOnUnmount(ref, state);
    // When a focused child element is removed, focus will be placed on the
    // document's body. This will focus on the dialog instead.
    useFocusOnChildUnmount(ref, state);
    useHideOnInteractOutside(ref, nestedDialogs, {
      state,
      modal,
      hideOnInteractOutside,
      enabled: state.visible,
    });

    // Safari and Firefox on Apple devices do not focus on native buttons on
    // mousedown. The DialogDisclosure component normalizes this behavior using
    // the useFocusable hook, but the disclosure button may use a custom
    // component, and not DialogDisclosure. In this case, we need to make sure
    // the disclosure button gets focused here.
    if (isSafariOrFirefoxOnAppleDevice) {
      useEffect(() => {
        if (!state.mounted) return;
        const disclosure = state.disclosureRef.current;
        if (!disclosure) return;
        if (!isButton(disclosure)) return;
        const onMouseDown = () => {
          queueBeforeEvent(disclosure, "mouseup", () =>
            focusIfNeeded(disclosure)
          );
        };
        disclosure.addEventListener("mousedown", onMouseDown);
        return () => {
          disclosure.removeEventListener("mousedown", onMouseDown);
        };
      }, [state.mounted, state.disclosureRef]);
    }

    // Renders a hidden dismiss button at the top of the modal dialog element.
    // So that screen reader users aren't trapped in the dialog when there's no
    // visible dismiss button.
    useEffect(() => {
      if (!state.mounted) return;
      if (!domReady) return;
      const dialog = ref.current;
      if (!dialog) return;
      // Usually, we only want to force the presence of a dismiss button if the
      // dialog is a modal. But, on Safari, since we're disabling the
      // accessibility tree outside, we need to ensure the user will be able to
      // close the dialog.
      if (modal || (portal && preserveTabOrder && isSafari())) {
        // If there's already a DialogDismiss component, it does nothing.
        const existingDismiss = dialog.querySelector("[data-dialog-dismiss]");
        if (existingDismiss) return;
        return prependHiddenDismiss(dialog, state.hide);
      }
      return;
    }, [state.mounted, domReady, modal, portal, preserveTabOrder, state.hide]);

    // Disables/enables the element tree around the modal dialog element.
    useSafeLayoutEffect(() => {
      // When the dialog is animating, we immediately restore the element tree
      // outside. This means the element tree will be enabled when the focus is
      // moved back to the disclosure element.
      if (state.animating) return;
      if (!state.visible) return;
      // If portal is enabled, we get the portalNode instead of the dialog
      // element. This will consider nested dialogs as they will be children of
      // the portal node, but not the dialog. This also accounts for the tiny
      // delay before the dialog element is appended to the portal node, and the
      // portal node is added to the DOM.
      const element = portal ? portalNode : ref.current;
      if (modal) {
        return chain(
          disableAccessibilityTreeOutside(element),
          // When the backdrop is not visible, we also need to disable pointer
          // events outside of the modal dialog.
          !backdrop ? disablePointerEventsOutside(element) : null
        );
      } else if (portal && preserveTabOrder && isSafari()) {
        // Usually, we only want to disable the accessibility tree outside if
        // the dialog is a modal. But the Portal component can't preserve the
        // tab order on Safari/VoiceOver. By allowing only the dialog/portal to
        // be accessible, we provide a similar tab order flow. We don't need to
        // disable pointer events because it's just for screen readers.
        return disableAccessibilityTreeOutside(element);
      }
      return;
    }, [
      state.animating,
      state.visible,
      portal,
      portalNode,
      modal,
      backdrop,
      preserveTabOrder,
    ]);

    // Auto focus on show.
    useEffect(() => {
      if (state.animating) return;
      if (!state.visible) return;
      if (!autoFocusOnShow) return;
      // Makes sure to wait for the portalNode to be created before moving
      // focus. This is useful for when the Dialog component is unmounted
      // when hidden.
      if (!domReady) return;
      // If there are open nested dialogs, let them handle the focus.
      const isNestedDialogVisible = nestedDialogsRef.current?.some(
        (child) => child.current && !child.current.hidden
      );
      if (isNestedDialogVisible) return;
      const dialog = ref.current;
      if (!dialog) return;
      const initialFocus = initialFocusRef?.current;
      const element =
        initialFocus ||
        // We have to fallback to the first focusable element otherwise portaled
        // dialogs with preserveTabOrder set to true will not receive focus
        // properly because the elements aren't tabbable until the dialog
        // receives focus.
        getFirstTabbableIn(dialog, true, portal && preserveTabOrder) ||
        dialog;
      ensureFocus(element);
    }, [
      state.animating,
      state.visible,
      autoFocusOnShow,
      domReady,
      initialFocusRef,
      portal,
      preserveTabOrder,
    ]);

    // Auto focus on hide.
    useEffect(() => {
      const dialog = ref.current;
      const previouslyVisible = visibleRef.current;
      visibleRef.current = state.visible;
      // We only want to auto focus on hide if the dialog was visible before.
      if (!previouslyVisible) return;
      if (!autoFocusOnHide) return;
      if (!dialog) return;
      // A function so we can use it on the effect setup and cleanup phases.
      const focusOnHide = () => {
        const dialogs = nestedDialogsRef.current;
        // Hide was triggered by a click/focus on a tabbable element outside
        // the dialog or on another dialog. We won't change focus then.
        if (isAlreadyFocusingAnotherElement(dialog, dialogs)) return;
        const element = finalFocusRef?.current || state.disclosureRef.current;
        if (element) {
          if (element.id) {
            const document = getDocument(element);
            const selector = `[aria-activedescendant="${element.id}"]`;
            const composite = document.querySelector<HTMLElement>(selector);
            // If the element is an item in a composite widget that handles
            // focus with the `aria-activedescendant` attribute, we want to
            // focus on the composite element itself.
            if (composite) {
              ensureFocus(composite);
              return;
            }
          }
          ensureFocus(element);
        }
      };
      if (!state.visible) {
        // If this effect is running while state.visible is false, this means
        // that the Dialog component doesn't get unmounted when it's not
        // visible, so we can immediatelly move focus.
        return focusOnHide();
      }
      // Otherwise, we just return the focusOnHide function so it's going to
      // be executed when the Dialog component gets unmounted. This is useful
      // so we can support both mouting and unmouting Dialog components.
      return focusOnHide;
    }, [autoFocusOnHide, state.visible, finalFocusRef, state.disclosureRef]);

    const hideOnEscapeProp = useBooleanEvent(hideOnEscape);

    // Hide on Escape.
    useEffect(() => {
      if (!domReady) return;
      if (!state.mounted) return;
      const onKeyDown = (event: KeyboardEvent) => {
        const dialog = ref.current;
        if (!dialog) return;
        const target = event.target as Node | null;
        const disclosure = state.disclosureRef.current;
        if (event.key !== "Escape") return;
        if (event.defaultPrevented) return;
        if (!target) return;
        // This considers valid targets only the disclosure element or
        // descendants of the dialog element that are not descendants of nested
        // dialogs.
        const isValidTarget = () => {
          if (contains(dialog, target)) {
            const dialogs = nestedDialogsRef.current;
            // Since this is a native DOM event, it won't be triggered by
            // keystrokes on nested dialogs inside portals. But we still need to
            // check if the target is inside a nested non-portal dialog.
            const inNestedDialog = dialogs.some(isInDialog(target));
            if (inNestedDialog) return false;
            return true;
          }
          if (disclosure && contains(disclosure, target)) return true;
          return false;
        };
        if (isValidTarget() && hideOnEscapeProp(event)) {
          state.hide();
        }
      };
      // We're attatching the listener to the document instead of the dialog
      // element so we can also listen to keystrokes on the disclosure element.
      // We can't do this on a onKeyDown prop on the disclosure element because
      // we don't have access to the hideOnEscape prop there.
      return addGlobalEventListener("keydown", onKeyDown);
    }, [
      domReady,
      state.mounted,
      state.disclosureRef,
      hideOnEscapeProp,
      state.hide,
    ]);

    // Wraps the element with the nested dialog context.
    props = useWrapElement(props, wrapElement, [wrapElement]);

    // Resets the heading levels inside the modal dialog so they start with h1.
    props = useWrapElement(
      props,
      (element) => (
        <HeadingLevel level={modal ? 1 : undefined}>{element}</HeadingLevel>
      ),
      [modal]
    );

    // Focus traps.
    props = useWrapElement(
      props,
      (element) => {
        const renderFocusTrap = (getTabbable: typeof getFirstTabbableIn) => {
          if (state.visible && modal && !visibleModals.length) {
            return (
              <span
                tabIndex={0}
                style={{ position: "fixed", top: 0, left: 0 }}
                aria-hidden
                data-focus-trap=""
                onFocus={() => {
                  const dialog = ref.current;
                  if (!dialog) return;
                  const tabbable = getTabbable(dialog, true);
                  if (tabbable) {
                    tabbable.focus();
                  } else {
                    // Fallbacks to the dialog element.
                    dialog.focus();
                  }
                }}
              />
            );
          }
          return null;
        };
        return (
          <>
            {renderFocusTrap(getLastTabbableIn)}
            {element}
            {renderFocusTrap(getFirstTabbableIn)}
          </>
        );
      },
      [state.visible, modal, visibleModals]
    );

    // Wraps the dialog with a backdrop element if the backdrop prop is truthy.
    props = useWrapElement(
      props,
      (element) => {
        if (backdrop) {
          return (
            <DialogBackdrop
              state={state}
              backdrop={backdrop}
              backdropProps={backdropProps}
              hideOnInteractOutside={hideOnInteractOutside}
              hideOnEscape={hideOnEscape}
            >
              {element}
            </DialogBackdrop>
          );
        }
        return element;
      },
      [state, backdrop, backdropProps, hideOnInteractOutside, hideOnEscape]
    );

    const [headingId, setHeadingId] = useState<string>();
    const [descriptionId, setDescriptionId] = useState<string>();

    props = useWrapElement(
      props,
      (element) => (
        <DialogContext.Provider value={state}>
          <DialogHeadingContext.Provider value={setHeadingId}>
            <DialogDescriptionContext.Provider value={setDescriptionId}>
              {element}
            </DialogDescriptionContext.Provider>
          </DialogHeadingContext.Provider>
        </DialogContext.Provider>
      ),
      [state]
    );

    props = {
      "data-dialog": "",
      role: "dialog",
      tabIndex: focusable ? -1 : undefined,
      "aria-labelledby": headingId,
      "aria-describedby": descriptionId,
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    props = useDisclosureContent({ state, ...props });
    props = useFocusable({ ...props, focusable });
    props = usePortal({ portal, ...props, portalRef, preserveTabOrder });

    return props;
  }
);

/**
 * A component that renders a dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogState();
 * <button onClick={dialog.toggle}>Open dialog</button>
 * <Dialog state={dialog}>Dialog</Dialog>
 * ```
 */
export const Dialog = createComponent<DialogOptions>((props) => {
  const htmlProps = useDialog(props);
  return createElement("div", htmlProps);
});

export type DialogOptions<T extends As = "div"> = FocusableOptions<T> &
  PortalOptions<T> &
  Omit<DisclosureContentOptions<T>, "state"> & {
    /**
     * Object returned by the `useDialogState` hook.
     */
    state: DialogState;
    /**
     * Determines whether the dialog is modal. Modal dialogs have distinct
     * states and behaviors:
     *   - The `portal`, `backdrop` and `preventBodyScroll` props are set to
     *     `true`. They can still be manually set to `false`.
     *   - A visually hidden dismiss button will be rendered if the
     *     `DialogDismiss` component hasn't been used. This allows screen reader
     *     users to close the dialog.
     *   - The focus will be trapped within the dialog.
     *   - When the dialog is visible, the elements outside of the dialog will
     *     be hidden to assistive technology users using the `aria-hidden`
     *     attribute.
     *   - When using the `Heading` or `DialogHeading` components within the
     *     dialog, their level will be reset so they start with `h1`.
     * @default true
     */
    modal?: boolean;
    /**
     * Determines whether there will be a backdrop behind the dialog. On modal
     * dialogs, this is `true` by default. Besides a `boolean`, this prop can
     * also be a React component that will be rendered as the backdrop.
     * @example
     * ```jsx
     * <Dialog backdrop={StyledBackdrop} />
     * ```
     */
    backdrop?: boolean | ElementType<ComponentPropsWithRef<"div">>;
    /**
     * Props that will be passed to the backdrop element if `backdrop` is
     * `true`.
     */
    backdropProps?: Omit<DisclosureContentProps, "state">;
    /**
     * Determines whether the dialog will be hidden when the user presses the
     * Escape key.
     * @default true
     */
    hideOnEscape?: BooleanOrCallback<KeyboardEvent | ReactKeyboardEvent>;
    /**
     * Determines whether the dialog will be hidden when the user clicks or
     * focus on an element outside of the dialog.
     * @default true
     */
    hideOnInteractOutside?: BooleanOrCallback<Event | SyntheticEvent>;
    /**
     * Determines whether the body scrolling will be prevented when the dialog
     * is shown.
     */
    preventBodyScroll?: boolean;
    /**
     * Determines whether an element inside the dialog will receive focus when
     * the dialog is shown. By default, this is usually the first tabbable
     * element in the dialog or the dialog itself. The `initialFocusRef` prop
     * can be used to set a different element to receive focus.
     * @default true
     */
    autoFocusOnShow?: boolean;
    /**
     * Determines whether an element outside of the dialog will be focused when
     * the dialog is hidden if another element hasn't been focused in the action
     * of hiding the dialog (for example, by clicking or tabbing into another
     * tabbable element outside of the dialog). By default, this is usually the
     * disclosure element. The `finalFocusRef` prop can be used to define a
     * different element to be focused.
     * @default true
     */
    autoFocusOnHide?: boolean;
    /**
     * Determines which element will receive focus when the dialog is shown.
     * This has no effect if `autoFocusOnShow` is `false`. If not set, the first
     * tabbable element inside the dialog or the dialog itself will receive
     * focus.
     */
    initialFocusRef?: RefObject<HTMLElement>;
    /**
     * Determines which element will receive focus when the dialog is hidden if
     * another element hasn't been focused in the action of hiding the dialog
     * (for example, by clicking or tabbing into another tabbable element
     * outside of the dialog). This has no effect if `autoFocusOnHide` is
     * `false`. If not set, the disclosure element will be used.
     */
    finalFocusRef?: RefObject<HTMLElement>;
  };

export type DialogProps<T extends As = "div"> = Props<DialogOptions<T>>;
