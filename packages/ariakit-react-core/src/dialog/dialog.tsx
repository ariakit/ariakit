import type {
  ComponentPropsWithRef,
  ElementType,
  FC,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  SyntheticEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  useId,
  useMergeRefs,
  usePortalRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { DialogBackdrop } from "./dialog-backdrop.js";
import {
  DialogDescriptionContext,
  DialogHeadingContext,
  DialogScopedContextProvider,
  useDialogProviderContext,
} from "./dialog-context.js";
import { useDialogStore } from "./dialog-store.js";
import type { DialogStore } from "./dialog-store.js";
import { disableTree, disableTreeOutside } from "./utils/disable-tree.js";
import { isElementMarked, markTreeOutside } from "./utils/mark-tree-outside.js";
import { prependHiddenDismiss } from "./utils/prepend-hidden-dismiss.js";
import { useHideOnInteractOutside } from "./utils/use-hide-on-interact-outside.js";
import { useNestedDialogs } from "./utils/use-nested-dialogs.js";
import { usePreventBodyScroll } from "./utils/use-prevent-body-scroll.js";
import { createWalkTreeSnapshot } from "./utils/walk-tree-outside.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

const isSafariBrowser = isSafari();

function isAlreadyFocusingAnotherElement(dialog?: HTMLElement | null) {
  const activeElement = getActiveElement();
  if (!activeElement) return false;
  if (dialog && contains(dialog, activeElement)) return false;
  if (isFocusable(activeElement)) return true;
  return false;
}

function getElementFromProp(
  prop?: HTMLElement | RefObject<HTMLElement> | null,
  focusable = false,
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
export const useDialog = createHook<TagName, DialogOptions>(function useDialog({
  store: storeProp,
  open: openProp,
  onClose,
  focusable = true,
  modal = true,
  portal = !!modal,
  backdrop = !!modal,
  hideOnEscape = true,
  hideOnInteractOutside = true,
  getPersistentElements,
  preventBodyScroll = !!modal,
  autoFocusOnShow = true,
  autoFocusOnHide = true,
  initialFocus,
  finalFocus,
  unmountOnHide,
  ...props
}) {
  const context = useDialogProviderContext();
  const ref = useRef<HTMLType>(null);

  const store = useDialogStore({
    store: storeProp || context,
    open: openProp,
    setOpen(open) {
      if (open) return;
      const dialog = ref.current;
      if (!dialog) return;
      const event = new Event("close", { bubbles: false, cancelable: true });
      if (onClose) {
        dialog.addEventListener("close", onClose, { once: true });
      }
      dialog.dispatchEvent(event);
      if (!event.defaultPrevented) return;
      store.setOpen(true);
    },
  });

  // domReady can be also the portal node element so it's updated when the
  // portal node changes (like in between re-renders), triggering effects
  // again.
  const { portalRef, domReady } = usePortalRef(portal, props.portalRef);
  // Sets preserveTabOrder to true only if the dialog is not a modal and is
  // open.
  const preserveTabOrderProp = props.preserveTabOrder;
  const preserveTabOrder = store.useState(
    (state) => preserveTabOrderProp && !modal && state.mounted,
  );
  const id = useId(props.id);
  const open = store.useState("open");
  const mounted = store.useState("mounted");
  const contentElement = store.useState("contentElement");
  const hidden = isHidden(mounted, props.hidden, props.alwaysVisible);

  usePreventBodyScroll(contentElement, id, preventBodyScroll && !hidden);
  useHideOnInteractOutside(store, hideOnInteractOutside, domReady);

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
  }, [store, open]);

  // Safari does not focus on native buttons on mousedown. The DialogDisclosure
  // component normalizes this behavior using the useFocusable hook, but the
  // disclosure button may use a custom component, and not DialogDisclosure. In
  // this case, we need to make sure the disclosure button gets focused here.
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
    }, [store, mounted]);
  }

  // Renders a hidden dismiss button at the top of the modal dialog element. So
  // that screen reader users aren't trapped in the dialog when there's no
  // visible dismiss button.
  useEffect(() => {
    if (!modal) return;
    if (!mounted) return;
    if (!domReady) return;
    const dialog = ref.current;
    if (!dialog) return;
    // If there's already a DialogDismiss component, it does nothing.
    const existingDismiss = dialog.querySelector("[data-dialog-dismiss]");
    if (existingDismiss) return;
    return prependHiddenDismiss(dialog, store.hide);
  }, [store, modal, mounted, domReady]);

  // When the dialog is animated, the open state will be false and the mounted
  // state will be true. The dialog will still be visible until the animation is
  // complete. We need to disable the dialog tree completely in this case. TODO:
  // We should probably do this in a more generic way in the DisclosureContent
  // component.
  useSafeLayoutEffect(() => {
    if (open) return;
    if (!mounted) return;
    if (!domReady) return;
    const dialog = ref.current;
    if (!dialog) return;
    return disableTree(dialog);
  }, [open, mounted, domReady]);

  const canTakeTreeSnapshot = open && domReady;

  useSafeLayoutEffect(() => {
    if (!id) return;
    if (!canTakeTreeSnapshot) return;
    const dialog = ref.current;
    // When the dialog opens, we capture a snapshot of the document. This
    // snapshot is then used to disable elements outside the dialog in the
    // subsequent effect. However, the issue arises as this next effect also
    // relies on nested dialogs. Meaning, each time a nested dialog is rendered,
    // we capture a new document snapshot, which might disable third-party
    // dialogs. Hence, we take the snapshot here, independent of any nested
    // dialogs.
    return createWalkTreeSnapshot(id, [dialog]);
  }, [id, canTakeTreeSnapshot]);

  const getPersistentElementsProp = useEvent(getPersistentElements);

  // Disables/enables the element tree around the modal dialog element.
  useSafeLayoutEffect(() => {
    if (!id) return;
    if (!canTakeTreeSnapshot) return;
    const { disclosureElement } = store.getState();
    const dialog = ref.current;
    const persistentElements = getPersistentElementsProp() || [];
    const allElements = [
      dialog,
      ...persistentElements,
      ...nestedDialogs.map((dialog) => dialog.getState().contentElement),
    ];
    if (modal) {
      return chain(
        markTreeOutside(id, allElements),
        disableTreeOutside(id, allElements),
      );
    }
    return markTreeOutside(id, [disclosureElement, ...allElements]);
  }, [
    id,
    store,
    canTakeTreeSnapshot,
    getPersistentElementsProp,
    nestedDialogs,
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
    // Makes sure to wait for the portalNode to be created before moving focus.
    // This is useful for when the Dialog component is unmounted when hidden.
    if (!domReady) return;
    // The dialog element may change for different reasons. For example, when
    // the modal or portal props change, the HTML structure will also change,
    // which will affect the dialog element reference. That's why we're
    // listening to contentElement state here instead of getting the ref.current
    // value. This ensures this effect will re-run when the dialog element
    // reference changes.
    if (!contentElement?.isConnected) return;
    const element =
      getElementFromProp(initialFocus, true) ||
      // If no initial focus is specified, we try to focus the first element
      // with the autofocus attribute. If it's an Ariakit component, the
      // Focusable component will consume the autoFocus prop and add the
      // data-autofocus attribute to the element instead.
      contentElement.querySelector<HTMLElement>(
        "[data-autofocus=true],[autofocus]",
      ) ||
      // We have to fallback to the first focusable element otherwise portaled
      // dialogs with preserveTabOrder set to true will not receive focus
      // properly because the elements aren't tabbable until the dialog receives
      // focus.
      getFirstTabbableIn(contentElement, true, portal && preserveTabOrder) ||
      // Finally, we fallback to the dialog element itself.
      contentElement;
    const isElementFocusable = isFocusable(element);
    if (!autoFocusOnShowProp(isElementFocusable ? element : null)) return;
    setAutoFocusEnabled(true);
    queueMicrotask(() => {
      element.focus();
      // Safari doesn't scroll to the element on focus, so we have to do it
      // manually here.
      if (!isSafariBrowser) return;
      element.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
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

  const focusOnHide = useCallback(
    (dialog: HTMLElement | null, retry = true) => {
      const { disclosureElement } = store.getState();
      // Hide was triggered by a click/focus on a tabbable element outside the
      // dialog. We won't change focus then.
      if (isAlreadyFocusingAnotherElement(dialog)) return;
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
      // If the element is not focusable by the time the dialog is hidden, it's
      // probably because it's an element inside another popover or menu that
      // also got hidden when this dialog was shown. We'll try to focus on their
      // disclosure element instead.
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
        requestAnimationFrame(() => focusOnHide(dialog, false));
        return;
      }
      if (!autoFocusOnHideProp(isElementFocusable ? element : null)) return;
      if (!isElementFocusable) return;
      element?.focus();
    },
    [store, finalFocus, autoFocusOnHideProp],
  );

  // Auto focus on hide with an always rendered dialog.
  useSafeLayoutEffect(() => {
    if (open) return;
    if (!hasOpened) return;
    if (!mayAutoFocusOnHide) return;
    const dialog = ref.current;
    focusOnHide(dialog);
  }, [open, hasOpened, domReady, mayAutoFocusOnHide, focusOnHide]);

  // Auto focus on hide with a dialog that gets unmounted when hidden.
  useEffect(() => {
    if (!hasOpened) return;
    if (!mayAutoFocusOnHide) return;
    const dialog = ref.current;
    return () => focusOnHide(dialog);
  }, [hasOpened, mayAutoFocusOnHide, focusOnHide]);

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
      // Ignore the event if the current dialog is marked by another dialog.
      // This guarantees that only the topmost dialog will close on Escape.
      if (isElementMarked(dialog)) return;
      const target = event.target as Element | null;
      if (!target) return;
      const { disclosureElement } = store.getState();
      // This considers valid targets only the disclosure element or descendants
      // of the dialog element.
      const isValidTarget = () => {
        if (target.tagName === "BODY") return true;
        if (contains(dialog, target)) return true;
        if (!disclosureElement) return true;
        if (contains(disclosureElement, target)) return true;
        return false;
      };
      if (!isValidTarget()) return;
      if (!hideOnEscapeProp(event)) return;
      store.hide();
    };
    // We're attatching the listener to the document instead of the dialog
    // element so we can listen to the Escape key anywhere in the document, even
    // when the dialog is not focused. By using the capture phase, users can
    // call `event.stopPropagation()` on the `hideOnEscape` function prop.
    return addGlobalEventListener("keydown", onKeyDown, true);
  }, [store, domReady, mounted, hideOnEscapeProp]);

  // Resets the heading levels inside the modal dialog so they start with h1.
  props = useWrapElement(
    props,
    (element) => (
      <HeadingLevel level={modal ? 1 : undefined}>{element}</HeadingLevel>
    ),
    [modal],
  );

  const hiddenProp = props.hidden;
  const alwaysVisible = props.alwaysVisible;

  // Wraps the dialog with a backdrop element if the backdrop prop is truthy.
  props = useWrapElement(
    props,
    (element) => {
      if (!backdrop) return element;
      return (
        <>
          <DialogBackdrop
            store={store}
            backdrop={backdrop}
            hidden={hiddenProp}
            alwaysVisible={alwaysVisible}
          />
          {element}
        </>
      );
    },
    [store, backdrop, hiddenProp, alwaysVisible],
  );

  const [headingId, setHeadingId] = useState<string>();
  const [descriptionId, setDescriptionId] = useState<string>();

  props = useWrapElement(
    props,
    (element) => (
      <DialogScopedContextProvider value={store}>
        <DialogHeadingContext.Provider value={setHeadingId}>
          <DialogDescriptionContext.Provider value={setDescriptionId}>
            {element}
          </DialogDescriptionContext.Provider>
        </DialogHeadingContext.Provider>
      </DialogScopedContextProvider>
    ),
    [store],
  );

  props = {
    id,
    "data-dialog": "",
    role: "dialog",
    tabIndex: focusable ? -1 : undefined,
    "aria-labelledby": headingId,
    "aria-describedby": descriptionId,
    ...props,
    ref: useMergeRefs(ref, props.ref),
  };

  props = useFocusableContainer({
    ...props,
    autoFocusOnShow: autoFocusEnabled,
  });
  props = useDisclosureContent({ store, ...props });
  props = useFocusable({ ...props, focusable });
  props = usePortal({ portal, ...props, portalRef, preserveTabOrder });

  return props;
});

export function createDialogComponent<T extends DialogOptions>(
  Component: FC<T>,
  useProviderContext = useDialogProviderContext,
) {
  return forwardRef(function DialogComponent(props: T) {
    const context = useProviderContext();
    const store = props.store || context;
    const mounted = useStoreState(
      store,
      (state) => !props.unmountOnHide || state?.mounted || !!props.open,
    );
    if (!mounted) return null;
    return <Component {...props} />;
  });
}

/**
 * Renders a dialog similar to the native `dialog` element that's rendered in a
 * [`portal`](https://ariakit.org/reference/dialog#portal) by default.
 *
 * The dialog can be either
 * [`modal`](https://ariakit.org/reference/dialog#modal) or non-modal. The
 * visibility state can be controlled with the
 * [`open`](https://ariakit.org/reference/dialog#open) and
 * [`onClose`](https://ariakit.org/reference/dialog#onclose) props.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx {4-6}
 * const [open, setOpen] = useState(false);
 *
 * <button onClick={() => setOpen(true)}>Open dialog</button>
 * <Dialog open={open} onClose={() => setOpen(false)}>
 *   Dialog
 * </Dialog>
 * ```
 */
export const Dialog = createDialogComponent(
  forwardRef(function Dialog(props: DialogProps) {
    const htmlProps = useDialog(props);
    return createElement(TagName, htmlProps);
  }),
  useDialogProviderContext,
);

export interface DialogOptions<T extends ElementType = TagName>
  extends FocusableOptions<T>,
    PortalOptions<T>,
    DisclosureContentOptions<T> {
  /**
   * Object returned by the
   * [`useDialogStore`](https://ariakit.org/reference/use-dialog-store) hook. If
   * not provided, the closest
   * [`DialogProvider`](https://ariakit.org/reference/dialog-provider)
   * component's context will be used. Otherwise, an internal store will be
   * created.
   */
  store?: DialogStore;
  /**
   * Controls the open state of the dialog. This is similar to the
   * [`open`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/open)
   * attribute on native dialog elements.
   *
   * Live examples:
   * - [Dialog with scrollable
   *   backdrop](https://ariakit.org/examples/dialog-backdrop-scrollable)
   * - [Dialog with details &
   *   summary](https://ariakit.org/examples/dialog-details)
   * - [Warning on Dialog
   *   hide](https://ariakit.org/examples/dialog-hide-warning)
   * - [Dialog with Menu](https://ariakit.org/examples/dialog-menu)
   */
  open?: boolean;
  /**
   * This is an event handler prop triggered when the dialog's `close` event is
   * dispatched. The `close` event is similar to the native dialog
   * [`close`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close_event)
   * event. The only difference is that this event can be canceled with
   * `event.preventDefault()`, which will prevent the dialog from hiding.
   *
   * It's important to note that this event only fires when the dialog store's
   * [`open`](https://ariakit.org/reference/use-dialog-store#open) state is set
   * to `false`. If the controlled
   * [`open`](https://ariakit.org/reference/dialog#open) prop value changes, or
   * if the dialog's visibility is altered in any other way (such as unmounting
   * the dialog without adjusting the open state), this event won't be
   * triggered.
   *
   * Live examples:
   * - [Dialog with scrollable
   *   backdrop](https://ariakit.org/examples/dialog-backdrop-scrollable)
   * - [Dialog with details &
   *   summary](https://ariakit.org/examples/dialog-details)
   * - [Warning on Dialog
   *   hide](https://ariakit.org/examples/dialog-hide-warning)
   * - [Dialog with Menu](https://ariakit.org/examples/dialog-menu)
   */
  onClose?: (event: Event) => void;
  /**
   * Determines whether the dialog is modal. Modal dialogs have distinct states
   * and behaviors:
   * - The [`portal`](https://ariakit.org/reference/dialog#portal) and
   *   [`preventBodyScroll`](https://ariakit.org/reference/dialog#preventbodyscroll)
   *   props are set to `true`. They can still be manually set to `false`.
   * - When using the [`Heading`](https://ariakit.org/reference/heading) or
   *   [`DialogHeading`](https://ariakit.org/reference/dialog-heading)
   *   components within the dialog, their level will be reset so they start
   *   with `h1`.
   * - A visually hidden dismiss button will be rendered if the
   *   [`DialogDismiss`](https://ariakit.org/reference/dialog-dismiss) component
   *   hasn't been used. This allows screen reader users to close the dialog.
   * - When the dialog is open, element tree outside it will be inert.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   * - [Dialog with details &
   *   summary](https://ariakit.org/examples/dialog-details)
   * - [Form with Select](https://ariakit.org/examples/form-select)
   * - [Context menu](https://ariakit.org/examples/menu-context-menu)
   * - [Responsive Popover](https://ariakit.org/examples/popover-responsive)
   * @default true
   */
  modal?: boolean;
  /**
   * Determines whether there will be a backdrop behind the dialog. On modal
   * dialogs, this is `true` by default. Besides a `boolean`, this prop can also
   * be a React component or JSX element that will be rendered as the backdrop.
   *
   * **Note**: If a custom component is used, it must [accept ref and spread all
   * props to its underlying DOM
   * element](https://ariakit.org/guide/composition#custom-components-must-be-open-for-extension),
   * the same way a native element would.
   *
   * Live examples:
   * - [Animated Dialog](https://ariakit.org/examples/dialog-animated)
   * - [Dialog with scrollable
   *   backdrop](https://ariakit.org/examples/dialog-backdrop-scrollable)
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
   * Determines if the dialog will hide when the user presses the Escape key.
   *
   * This prop can be either a boolean or a function that accepts an event as an
   * argument and returns a boolean. The event object represents the keydown
   * event that initiated the hide action, which could be either a native
   * keyboard event or a React synthetic event.
   *
   * **Note**: When placing Ariakit dialogs inside third-party dialogs, using
   * `event.stopPropagation()` within this function will stop the event from
   * reaching the third-party dialog, closing only the Ariakit dialog.
   * @default true
   */
  hideOnEscape?: BooleanOrCallback<KeyboardEvent | ReactKeyboardEvent>;
  /**
   * Determines if the dialog should hide when the user clicks or focuses on an
   * element outside the dialog.
   *
   * This prop can be either a boolean or a function that takes an event as an
   * argument and returns a boolean. The event object represents the event that
   * triggered the action, which could be a native event or a React synthetic
   * event of various types.
   *
   * Live examples:
   * - [Selection Popover](https://ariakit.org/examples/popover-selection)
   * @default true
   */
  hideOnInteractOutside?: BooleanOrCallback<Event | SyntheticEvent>;
  /**
   * When a dialog is open, the elements outside of it are disabled to prevent
   * interaction if the dialog is
   * [`modal`](https://ariakit.org/reference/dialog#modal). For non-modal
   * dialogs, interacting with elements outside the dialog prompts it to close.
   *
   * This function allows you to return an iterable collection of elements that
   * will be considered as part of the dialog, thus excluding them from this
   * behavior.
   *
   * **Note**: The elements returned by this function must exist in the DOM when
   * the dialog opens.
   *
   * Live examples:
   * - [Dialog with
   *   React-Toastify](https://ariakit.org/examples/dialog-react-toastify)
   */
  getPersistentElements?: () => Iterable<Element>;
  /**
   * Determines whether the body scrolling will be prevented when the dialog is
   * shown. This is automatically set to `true` when the dialog is
   * [`modal`](https://ariakit.org/reference/dialog#modal). You can disable this
   * prop if you want to implement your own logic.
   */
  preventBodyScroll?: boolean;
  /**
   * Determines whether an element inside the dialog will receive focus when the
   * dialog is shown. By default, this is usually the first tabbable element in
   * the dialog or the dialog itself. The
   * [`initialFocus`](https://ariakit.org/reference/dialog#initialfocus) prop
   * can be used to set a different element to receive focus.
   *
   * Live examples:
   * - [Warning on Dialog
   *   hide](https://ariakit.org/examples/dialog-hide-warning)
   * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
   * - [Selection Popover](https://ariakit.org/examples/popover-selection)
   * @default true
   */
  autoFocusOnShow?: BooleanOrCallback<HTMLElement | null>;
  /**
   * Determines whether an element outside of the dialog will be focused when
   * the dialog is hidden if another element hasn't been focused in the action
   * of hiding the dialog (for example, by clicking or tabbing into another
   * tabbable element outside of the dialog).
   *
   * By default, this is usually the disclosure element. The
   * [`finalFocus`](https://ariakit.org/reference/dialog#finalfocus) prop can be
   * used to define a different element to be focused.
   *
   * Live examples:
   * - [Dialog with Next.js App
   *   Router](https://ariakit.org/examples/dialog-next-router)
   * - [Sliding menu](https://ariakit.org/examples/menu-slide)
   * @default true
   */
  autoFocusOnHide?: BooleanOrCallback<HTMLElement | null>;
  /**
   * Specifies the element that will receive focus when the dialog is first
   * opened. It can be an `HTMLElement` or a `React.RefObject` with an
   * `HTMLElement`.
   *
   * If
   * [`autoFocusOnShow`](https://ariakit.org/reference/dialog#autofocusonshow)
   * is set to `false`, this prop will have no effect. If left unset, the dialog
   * will attempt to determine the initial focus element in the following order:
   * 1. A [Focusable](https://ariakit.org/components/focusable) element with an
   *    [`autoFocus`](https://ariakit.org/reference/focusable#autofocus) prop.
   * 2. The first tabbable element inside the dialog.
   * 3. The first focusable element inside the dialog.
   * 4. The dialog element itself.
   */
  initialFocus?: HTMLElement | RefObject<HTMLElement> | null;
  /**
   * Determines the element that will receive focus once the dialog is closed,
   * provided that no other element has been focused while the dialog was being
   * hidden (e.g., by clicking or tabbing into another tabbable element outside
   * of the dialog).
   * - If
   *   [`autoFocusOnHide`](https://ariakit.org/reference/dialog#autofocusonhide)
   *   is set to `false`, this prop will have no effect.
   * - If left unset, the element that was focused before the dialog was opened
   *   will be focused again.
   */
  finalFocus?: HTMLElement | RefObject<HTMLElement> | null;
}

export type DialogProps<T extends ElementType = TagName> = Props<
  T,
  DialogOptions<T>
>;
