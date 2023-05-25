import type {
  ComponentPropsWithRef,
  ElementType,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  SyntheticEvent,
} from "react";
import { useEffect, useRef, useState } from "react";
import {
  closest,
  contains,
  getActiveElement,
  getDocument,
  isButton,
} from "@ariakit/core/utils/dom";
import {
  addGlobalEventListener,
  queueBeforeEvent,
} from "@ariakit/core/utils/events";
import {
  focusIfNeeded,
  getFirstTabbableIn,
  isFocusable,
} from "@ariakit/core/utils/focus";
import { chain } from "@ariakit/core/utils/misc";
import { isSafari } from "@ariakit/core/utils/platform";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.js";
import {
  isHidden,
  useDisclosureContent,
} from "../disclosure/disclosure-content.js";
import { useFocusableContainer } from "../focusable/focusable-container.js";
import type { FocusableOptions } from "../focusable/focusable.js";
import { useFocusable } from "../focusable/focusable.js";
import { HeadingLevel } from "../heading/heading-level.js";
import type { PortalOptions } from "../portal/portal.js";
import { usePortal } from "../portal/portal.js";
import {
  useBooleanEvent,
  useEvent,
  useForkRef,
  useId,
  usePortalRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { DialogBackdrop } from "./dialog-backdrop.js";
import {
  DialogContext,
  DialogDescriptionContext,
  DialogHeadingContext,
} from "./dialog-context.js";
import type { DialogStore } from "./dialog-store.js";
import { disableAccessibilityTreeOutside } from "./utils/disable-accessibility-tree-outside.js";
import { disableTreeOutside } from "./utils/disable-tree-outside.js";
import { markTreeOutside } from "./utils/mark-tree-outside.js";
import { prependHiddenDismiss } from "./utils/prepend-hidden-dismiss.js";
import { useHideOnInteractOutside } from "./utils/use-hide-on-interact-outside.js";
import { useNestedDialogs } from "./utils/use-nested-dialogs.js";
import { usePreventBodyScroll } from "./utils/use-prevent-body-scroll.js";

const isSafariBrowser = isSafari();

function isAlreadyFocusingAnotherElement(dialog?: HTMLElement | null) {
  const activeElement = getActiveElement();
  if (!activeElement) return false;
  if (dialog && contains(dialog, activeElement)) return false;
  // When there's a nested dialog, clicking outside both dialogs will close them
  // at the same time, but the active element will still point to the nested
  // dialog element that is still focusable at this point. So we ignore it.
  if (activeElement.hasAttribute("data-dialog")) return false;
  if (isFocusable(activeElement)) return true;
  return false;
}

function getElementFromProp(
  prop?: HTMLElement | RefObject<HTMLElement> | null,
  focusable = false
) {
  if (!prop) return null;
  const element = "current" in prop ? prop.current : prop;
  if (!element) return null;
  if (focusable) return isFocusable(element) ? element : null;
  return element;
}

/**
 * Returns props to create a `Dialog` component.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const store = useDialogStore();
 * const props = useDialog({ store });
 * <Role {...props}>Dialog</Role>
 * ```
 */
export const useDialog = createHook<DialogOptions>(
  ({
    store,
    focusable = true,
    modal = true,
    portal = !!modal,
    backdrop = !!modal,
    backdropProps,
    hideOnEscape = true,
    hideOnInteractOutside = true,
    getPersistentElements,
    preventBodyScroll = !!modal,
    autoFocusOnShow = true,
    autoFocusOnHide = true,
    initialFocus,
    finalFocus,
    ...props
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    // domReady can be also the portal node element so it's updated when the
    // portal node changes (like in between re-renders), triggering effects
    // again.
    const { portalRef, portalNode, domReady } = usePortalRef(
      portal,
      props.portalRef
    );
    // Sets preserveTabOrder to true only if the dialog is not a modal and is
    // open.
    const preserveTabOrderProp = props.preserveTabOrder;
    const preserveTabOrder = store.useState(
      (state) => preserveTabOrderProp && !modal && state.mounted
    );
    const id = useId(props.id);
    const open = store.useState("open");
    const mounted = store.useState("mounted");
    const contentElement = store.useState("contentElement");
    const hidden = isHidden(mounted, props.hidden, props.alwaysVisible);

    usePreventBodyScroll(store, preventBodyScroll && !hidden);
    useHideOnInteractOutside(store, hideOnInteractOutside);

    const { wrapElement, nestedDialogs } = useNestedDialogs(store);
    props = useWrapElement(props, wrapElement, [wrapElement]);

    // Sets disclosure element using the current active element right after the
    // dialog is opened.
    useSafeLayoutEffect(() => {
      if (!open) return;
      const dialog = ref.current;
      const activeElement = getActiveElement(dialog, true);
      if (!activeElement) return;
      if (activeElement.tagName === "BODY") return;
      // The disclosure element can't be inside the dialog.
      if (dialog && contains(dialog, activeElement)) return;
      store.setDisclosureElement(activeElement);
    }, [open]);

    // Safari does not focus on native buttons on mousedown. The
    // DialogDisclosure component normalizes this behavior using the
    // useFocusable hook, but the disclosure button may use a custom component,
    // and not DialogDisclosure. In this case, we need to make sure the
    // disclosure button gets focused here.
    if (isSafariBrowser) {
      useEffect(() => {
        if (!mounted) return;
        const { disclosureElement } = store.getState();
        if (!disclosureElement) return;
        if (!isButton(disclosureElement)) return;
        const onMouseDown = () => {
          let receivedFocus = false;
          const onFocus = () => {
            receivedFocus = true;
          };
          const options = { capture: true, once: true };
          disclosureElement.addEventListener("focusin", onFocus, options);
          queueBeforeEvent(disclosureElement, "mouseup", () => {
            disclosureElement.removeEventListener("focusin", onFocus, true);
            if (receivedFocus) return;
            focusIfNeeded(disclosureElement);
          });
        };
        disclosureElement.addEventListener("mousedown", onMouseDown);
        return () => {
          disclosureElement.removeEventListener("mousedown", onMouseDown);
        };
      }, [mounted]);
    }

    const shouldDisableAccessibilityTree =
      modal ||
      // Usually, we only want to disable the accessibility tree outside if the
      // dialog is a modal. But the Portal component can't preserve the tab
      // order on Safari/VoiceOver. By allowing only the dialog/portal to be
      // accessible, we provide a similar tab order flow. We don't need to
      // disable pointer events because it's just for screen readers.
      (portal && preserveTabOrder && isSafari());

    // Renders a hidden dismiss button at the top of the modal dialog element.
    // So that screen reader users aren't trapped in the dialog when there's no
    // visible dismiss button.
    useEffect(() => {
      if (!mounted) return;
      if (!domReady) return;
      const dialog = ref.current;
      if (!dialog) return;
      // Usually, we only want to force the presence of a dismiss button if the
      // dialog is a modal. But, on Safari, since we're disabling the
      // accessibility tree outside, we need to ensure the user will be able to
      // close the dialog.
      if (!shouldDisableAccessibilityTree) return;
      // If there's already a DialogDismiss component, it does nothing.
      const existingDismiss = dialog.querySelector("[data-dialog-dismiss]");
      if (existingDismiss) return;
      return prependHiddenDismiss(dialog, store.hide);
    }, [mounted, domReady, shouldDisableAccessibilityTree]);

    const getPersistentElementsProp = useEvent(getPersistentElements);

    // Disables/enables the element tree around the modal dialog element.
    useSafeLayoutEffect(() => {
      if (!id) return;
      // When the dialog is animating, we immediately restore the element tree
      // outside. This means the element tree will be enabled when the focus is
      // moved back to the disclosure element. That's why we use open instead of
      // mounted here.
      if (!open) return;
      const { disclosureElement } = store.getState();
      // If portal is enabled, we get the portalNode instead of the dialog
      // element. This will consider nested dialogs as they will be children of
      // the portal node, but not the dialog. This also accounts for the tiny
      // delay before the dialog element is appended to the portal node, and the
      // portal node is added to the DOM.
      const element = portal ? portalNode : ref.current;
      const persistentElements = getPersistentElementsProp() || [];
      const allElements = [element, ...nestedDialogs, ...persistentElements];
      if (!shouldDisableAccessibilityTree) {
        return markTreeOutside(id, disclosureElement, ...allElements);
      }
      if (modal) {
        return chain(
          markTreeOutside(id, ...allElements),
          disableTreeOutside(...allElements)
        );
      }
      return chain(
        markTreeOutside(id, disclosureElement, ...allElements),
        disableAccessibilityTreeOutside(...allElements)
      );
    }, [
      id,
      open,
      store,
      portal,
      portalNode,
      nestedDialogs,
      getPersistentElementsProp,
      shouldDisableAccessibilityTree,
      modal,
    ]);

    const mayAutoFocusOnShow = !!autoFocusOnShow;
    const autoFocusOnShowProp = useBooleanEvent(autoFocusOnShow);
    // We have to wait for the dialog to be mounted before allowing focusable
    // elements to be auto focused. Otherwise, there could be unintended scroll
    // jumps. See select-animated browser tests.
    const [autoFocusEnabled, setAutoFocusEnabled] = useState(false);

    // Auto focus on show.
    useEffect(() => {
      if (!open) return;
      if (!mayAutoFocusOnShow) return;
      // Makes sure to wait for the portalNode to be created before moving
      // focus. This is useful for when the Dialog component is unmounted when
      // hidden.
      if (!domReady) return;
      // The dialog element may change for different reasons. For example, when
      // the modal or portal props change, the HTML structure will also change,
      // which will affect the dialog element reference. That's why we're
      // listening to contentElement state here instead of getting the
      // ref.current value. This ensures this effect will re-run when the dialog
      // element reference changes.
      if (!contentElement?.isConnected) return;
      const element =
        getElementFromProp(initialFocus, true) ||
        // If no initial focus is specified, we try to focus the first element
        // with the autofocus attribute. If it's an Ariakit component, the
        // Focusable component will consume the autoFocus prop and add the
        // data-autofocus attribute to the element instead.
        contentElement.querySelector<HTMLElement>(
          "[data-autofocus=true],[autofocus]"
        ) ||
        // We have to fallback to the first focusable element otherwise portaled
        // dialogs with preserveTabOrder set to true will not receive focus
        // properly because the elements aren't tabbable until the dialog
        // receives focus.
        getFirstTabbableIn(contentElement, true, portal && preserveTabOrder) ||
        // Finally, we fallback to the dialog element itself.
        contentElement;
      const isElementFocusable = isFocusable(element);
      if (!autoFocusOnShowProp(isElementFocusable ? element : null)) return;
      setAutoFocusEnabled(true);
      queueMicrotask(() => element.focus());
    }, [
      open,
      mayAutoFocusOnShow,
      domReady,
      contentElement,
      initialFocus,
      portal,
      preserveTabOrder,
      autoFocusOnShowProp,
    ]);

    const mayAutoFocusOnHide = !!autoFocusOnHide;
    const autoFocusOnHideProp = useBooleanEvent(autoFocusOnHide);

    // Sets a `hasOpened` flag on an effect so we only auto focus on hide if the
    // dialog was open before.
    const [hasOpened, setHasOpened] = useState(false);

    useEffect(() => {
      if (!open) return;
      setHasOpened(true);
      return () => setHasOpened(false);
    }, [open]);

    // Auto focus on hide. This must be a layout effect because we need to move
    // focus synchronously before another dialog is shown in parallel.
    useSafeLayoutEffect(() => {
      // We only want to auto focus on hide if the dialog was open before.
      if (!hasOpened) return;
      if (!mayAutoFocusOnHide) return;
      const dialog = ref.current;
      // A function so we can use it on the effect setup and cleanup phases.
      const focusOnHide = (retry = true) => {
        // Hide was triggered by a click/focus on a tabbable element outside the
        // dialog. We won't change focus then.
        if (isAlreadyFocusingAnotherElement(dialog)) return;
        const { disclosureElement } = store.getState();
        let element = getElementFromProp(finalFocus) || disclosureElement;
        if (element?.id) {
          const doc = getDocument(element);
          const selector = `[aria-activedescendant="${element.id}"]`;
          const composite = doc.querySelector<HTMLElement>(selector);
          // If the element is an item in a composite widget that handles focus
          // with the `aria-activedescendant` attribute, we want to focus on the
          // composite element itself.
          if (composite) {
            element = composite;
          }
        }
        // If the element is not focusable by the time the dialog is hidden,
        // it's probably because it's an element inside another popover or menu
        // that also got hidden when this dialog was shown. We'll try to focus
        // on their disclosure element instead.
        if (element && !isFocusable(element)) {
          const maybeParentDialog = closest(element, "[data-dialog]");
          if (maybeParentDialog && maybeParentDialog.id) {
            const doc = getDocument(maybeParentDialog);
            const selector = `[aria-controls~="${maybeParentDialog.id}"]`;
            const control = doc.querySelector<HTMLElement>(selector);
            if (control) {
              element = control;
            }
          }
        }
        const isElementFocusable = element && isFocusable(element);
        if (!isElementFocusable && retry) {
          // If the element is still not focusable by this time, we retry once
          // again on the next frame. This is sometimes necessary because there
          // may be nested dialogs that still need a tick to remove the inert
          // attribute from elements outside.
          requestAnimationFrame(() => focusOnHide(false));
          return;
        }
        if (!autoFocusOnHideProp(isElementFocusable ? element : null)) return;
        if (!isElementFocusable) return;
        if (!retry) {
          element?.focus();
          return;
        }
        requestAnimationFrame(() => {
          if (isAlreadyFocusingAnotherElement(dialog)) return;
          element?.focus();
        });
      };
      if (!open) {
        // If this effect is running while the open state is false, this means
        // that the Dialog component doesn't get unmounted when it's not open,
        // so we can immediatelly move focus.
        return focusOnHide();
      }
      // Otherwise, we just return the focusOnHide function so it's going to be
      // executed when the Dialog component gets unmounted. This is useful so we
      // can support both mounting and unmounting Dialog components.
      return focusOnHide;
    }, [hasOpened, open, mayAutoFocusOnHide, finalFocus, autoFocusOnHideProp]);

    const hideOnEscapeProp = useBooleanEvent(hideOnEscape);

    // Hide on Escape.
    useEffect(() => {
      if (!domReady) return;
      if (!mounted) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        if (event.defaultPrevented) return;
        const dialog = ref.current;
        if (!dialog) return;
        const target = event.target as Element | null;
        if (!target) return;
        const { disclosureElement } = store.getState();
        // This considers valid targets only the disclosure element or
        // descendants of the dialog element.
        const isValidTarget = () => {
          if (target.tagName === "BODY") return true;
          if (contains(dialog, target)) return true;
          if (!disclosureElement) return false;
          if (contains(disclosureElement, target)) return true;
          return false;
        };
        if (!isValidTarget()) return;
        if (!hideOnEscapeProp(event)) return;
        // If the dialog is not inside a portal, we stop immediate propagation
        // so parent dialogs don't close when we press Escape on a child dialog.
        event.stopImmediatePropagation();
        store.hide();
      };
      // We're attatching the listener to the document instead of the dialog
      // element so we can also listen to keystrokes on the disclosure element.
      // We can't do this on a onKeyDown prop on the disclosure element because
      // we don't have access to the hideOnEscape prop there.
      return addGlobalEventListener("keydown", onKeyDown);
    }, [mounted, domReady, hideOnEscapeProp]);

    // Resets the heading levels inside the modal dialog so they start with h1.
    props = useWrapElement(
      props,
      (element) => (
        <HeadingLevel level={modal ? 1 : undefined}>{element}</HeadingLevel>
      ),
      [modal]
    );

    const hiddenProp = props.hidden;
    const alwaysVisible = props.alwaysVisible;

    // Wraps the dialog with a backdrop element if the backdrop prop is truthy.
    props = useWrapElement(
      props,
      (element) => {
        if (backdrop) {
          return (
            <>
              {backdrop && (
                <DialogBackdrop
                  store={store}
                  backdrop={backdrop}
                  backdropProps={backdropProps}
                  hidden={hiddenProp}
                  alwaysVisible={alwaysVisible}
                />
              )}
              {element}
            </>
          );
        }
        return element;
      },
      [store, backdrop, backdropProps, hiddenProp, alwaysVisible]
    );

    const [headingId, setHeadingId] = useState<string>();
    const [descriptionId, setDescriptionId] = useState<string>();

    props = useWrapElement(
      props,
      (element) => (
        <DialogContext.Provider value={store}>
          <DialogHeadingContext.Provider value={setHeadingId}>
            <DialogDescriptionContext.Provider value={setDescriptionId}>
              {element}
            </DialogDescriptionContext.Provider>
          </DialogHeadingContext.Provider>
        </DialogContext.Provider>
      ),
      [store]
    );

    props = {
      id,
      "data-dialog": "",
      role: "dialog",
      tabIndex: focusable ? -1 : undefined,
      "aria-labelledby": headingId,
      "aria-describedby": descriptionId,
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    props = useFocusableContainer({
      ...props,
      autoFocusOnShow: autoFocusEnabled,
    });
    props = useDisclosureContent({ store, ...props });
    props = useFocusable({ ...props, focusable });
    props = usePortal({ portal, ...props, portalRef, preserveTabOrder });

    return props;
  }
);

/**
 * Renders a dialog element.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogStore();
 * <button onClick={dialog.toggle}>Open dialog</button>
 * <Dialog store={dialog}>Dialog</Dialog>
 * ```
 */
export const Dialog = createComponent<DialogOptions>((props) => {
  const htmlProps = useDialog(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Dialog.displayName = "Dialog";
}

export interface DialogOptions<T extends As = "div">
  extends FocusableOptions<T>,
    PortalOptions<T>,
    DisclosureContentOptions<T> {
  /**
   * Object returned by the `useDialogStore` hook.
   */
  store: DialogStore;
  /**
   * Determines whether the dialog is modal. Modal dialogs have distinct states
   * and behaviors:
   * - The `portal` and `preventBodyScroll` props are set to `true`. They can
   *   still be manually set to `false`.
   * - A visually hidden dismiss button will be rendered if the `DialogDismiss`
   *   component hasn't been used. This allows screen reader users to close the
   *   dialog.
   * - When the dialog is open, element tree outside it will be disabled.
   * - When using the `Heading` or `DialogHeading` components within the dialog,
   *   their level will be reset so they start with `h1`.
   * @default true
   */
  modal?: boolean;
  /**
   * Determines whether there will be a backdrop behind the dialog. On modal
   * dialogs, this is `true` by default. Besides a `boolean`, this prop can also
   * be a React component or JSX element that will be rendered as the backdrop.
   *
   * **If a custom component is used, it must accept ref and spread all props to
   * its underlying DOM element**, the same way a native element would.
   *
   * Live examples:
   * - [Animated Dialog](https://ariakit.org/examples/dialog-animated)
   * - [Dialog with Framer
   *   Motion](https://ariakit.org/examples/dialog-framer-motion)
   * - [Dialog with Menu](https://ariakit.org/examples/dialog-menu)
   * - [Nested Dialog](https://ariakit.org/examples/dialog-nested)
   * - [Dialog with Next.js App
   *   Router](https://ariakit.org/examples/dialog-next-router)
   * @example
   * ```jsx
   * <Dialog backdrop={<div className="backdrop" />} />
   * ```
   */
  backdrop?:
    | boolean
    | ReactElement<ComponentPropsWithRef<"div">>
    | ElementType<ComponentPropsWithRef<"div">>;
  /**
   * Props that will be passed to the backdrop element if `backdrop` is `true`.
   * @deprecated Use the `backdrop` prop instead.
   */
  backdropProps?: ComponentPropsWithRef<"div">;
  /**
   * Determines whether the dialog will be hidden when the user presses the
   * Escape key.
   * @default true
   */
  hideOnEscape?: BooleanOrCallback<KeyboardEvent | ReactKeyboardEvent>;
  /**
   * Determines whether the dialog will be hidden when the user clicks or focus
   * on an element outside of the dialog.
   * @default true
   */
  hideOnInteractOutside?: BooleanOrCallback<Event | SyntheticEvent>;
  /**
   * When a dialog is open, the elements outside of it will be disabled so they
   * can't be interacted with if the dialog is modal. For non-modal dialogs,
   * interacting with elements outside of the dialog will close it. With this
   * function, you can return a collection of elements that will be considered
   * part of the dialog and therefore will be excluded from this behavior.
   *
   * Live examples:
   * - [Dialog with
   *   React-Toastify](https://ariakit.org/examples/dialog-react-toastify)
   */
  getPersistentElements?: () => Iterable<Element>;
  /**
   * Determines whether the body scrolling will be prevented when the dialog is
   * shown.
   */
  preventBodyScroll?: boolean;
  /**
   * Determines whether an element inside the dialog will receive focus when the
   * dialog is shown. By default, this is usually the first tabbable element in
   * the dialog or the dialog itself. The `initialFocus` prop can be used to set
   * a different element to receive focus.
   * @default true
   */
  autoFocusOnShow?: BooleanOrCallback<HTMLElement | null>;
  /**
   * Determines whether an element outside of the dialog will be focused when
   * the dialog is hidden if another element hasn't been focused in the action
   * of hiding the dialog (for example, by clicking or tabbing into another
   * tabbable element outside of the dialog). By default, this is usually the
   * disclosure element. The `finalFocus` prop can be used to define a different
   * element to be focused.
   * @default true
   */
  autoFocusOnHide?: BooleanOrCallback<HTMLElement | null>;
  /**
   * Specifies the element that will receive focus when the dialog is first
   * opened. It can be an `HTMLElement` or a `React.RefObject` with an
   * `HTMLElement`. However, if `autoFocusOnShow` is set to `false`, this prop
   * will have no effect. If left unset, the dialog will attempt to determine
   * the initial focus element in the following order:
   * 1. An element with an `autoFocus` prop.
   * 2. The first tabbable element inside the dialog.
   * 3. The first focusable element inside the dialog.
   * 4. The dialog element itself.
   */
  initialFocus?: HTMLElement | RefObject<HTMLElement> | null;
  /**
   * Determines the element that will receive focus once the dialog is closed,
   * provided that no other element has been focused while the dialog was being
   * hidden (e.g., by clicking or tabbing into another tabbable element outside
   * of the dialog). However, if `autoFocusOnHide` is set to `false`, this prop
   * will have no effect. If left unset, the element that was focused before the
   * dialog was opened will be focused again.
   */
  finalFocus?: HTMLElement | RefObject<HTMLElement> | null;
}

export type DialogProps<T extends As = "div"> = Props<DialogOptions<T>>;
