import { useStoreState } from "@ariakit/react-store";
import {
  useBooleanEvent,
  useEvent,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { sync } from "@ariakit/store";
import { getDocument, invariant, isFalsyBooleanCallback } from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import { useCompositeTypeahead } from "../composite/composite-typeahead.tsx";
import { createDialogComponent } from "../dialog/dialog.tsx";
import type { PopoverOptions } from "../popover/popover.tsx";
import { usePopover } from "../popover/popover.tsx";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import type { ComboboxListOptions } from "./combobox-list.tsx";
import { useComboboxList } from "./combobox-list.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

function isController(
  target: EventTarget | Element | null,
  ...ids: Array<string | undefined>
) {
  if (!target) return false;
  if ("id" in target) {
    const selector = ids
      .filter(Boolean)
      .map((id) => `[aria-controls~="${id}"]`)
      .join(", ");
    if (!selector) return false;
    return target.matches(selector);
  }
  return false;
}

/**
 * Returns props to create a `ComboboxPopover` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxPopover({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxPopover = createHook<TagName, ComboboxPopoverOptions>(
  function useComboboxPopover({
    store,
    modal,
    tabIndex,
    alwaysVisible,
    resetOnEscape,
    autoFocusOnHide = true,
    hideOnInteractOutside = true,
    ...props
  }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxPopover must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const compositeElement = useStoreState(store, "compositeElement");
    const inputElement = useStoreState(store, "inputElement");
    const selectElement = useStoreState(store, "selectElement");
    const hiddenByClickOutsideRef = useRef(false);
    const hasSelect = !!selectElement;

    const selectOnMove = useStoreState(store, "selectOnMove");
    const acceptedEscapeRef = useRef<{
      event: KeyboardEvent;
      defaultPrevented: boolean;
      cancelBubble: boolean;
    } | null>(null);
    const captureSelectedValueRef = useRef(false);
    const captureSelectedValueBeforeCloseRef = useRef(false);
    const preserveCaptureOnNextOpenRef = useRef<boolean | null>(null);
    const selectedValueBeforeMoveRef = useRef(store.getState().selectedValue);

    // Keep tracking the selected value until the user moves through the items.
    // The popover may already be shown on its first render, and the store may
    // only settle its initial selected value afterwards, so freezing it any
    // earlier would restore a value the user never saw. Once frozen, a moves
    // reset from another Composite interaction must not re-arm it.
    useEffect(() => {
      const initialState = store.getState();
      captureSelectedValueRef.current =
        initialState.open && !initialState.moves;
      selectedValueBeforeMoveRef.current = initialState.selectedValue;
      return sync(
        store,
        ["open", "moves", "selectedValue"],
        (state, prevState) => {
          if (!state.open) {
            if (prevState.open) {
              captureSelectedValueBeforeCloseRef.current =
                captureSelectedValueRef.current;
            }
            captureSelectedValueRef.current = false;
            return;
          }
          if (!prevState.open) {
            const preservedCapture = preserveCaptureOnNextOpenRef.current;
            if (preservedCapture !== null) {
              captureSelectedValueRef.current = preservedCapture;
              preserveCaptureOnNextOpenRef.current = null;
            } else {
              captureSelectedValueRef.current = true;
            }
          }
          if (state.moves) {
            captureSelectedValueRef.current = false;
          }
          if (!captureSelectedValueRef.current) return;
          selectedValueBeforeMoveRef.current = state.selectedValue;
        },
      );
    }, [store]);

    // Moving through items only changes the selected value when selectOnMove is
    // enabled, so that's the only case where there's something to restore.
    const resetOnEscapeProp = useBooleanEvent(resetOnEscape ?? selectOnMove);

    // When new tags are rendered while the combobox popover is open, they will
    // be considered nested popups, and therefore the popover won't hide when
    // interacting with them. We use the treeSnapshotKey to force the popover to
    // take a new snapshot of the tree when new items are rendered.
    const treeSnapshotKey = useStoreState(
      store.tag,
      ["renderedItems"],
      (state) => state?.renderedItems.length,
    );

    props = useComboboxList({
      store,
      alwaysVisible,
      ...props,
    });
    props = useCompositeTypeahead({
      store,
      typeahead: !inputElement,
      ...props,
    });

    const hideOnEscapeProp = useBooleanEvent(props.hideOnEscape ?? true);
    const onCloseProp = props.onClose;
    const getPersistentElementsProp = props.getPersistentElements;

    const hideOnEscape = useEvent((event: KeyboardEvent) => {
      const accepted = hideOnEscapeProp(event);
      if (!accepted) return false;
      const acceptedEscape = {
        event,
        defaultPrevented: event.defaultPrevented,
        cancelBubble: event.cancelBubble,
      };
      acceptedEscapeRef.current = acceptedEscape;
      // Browsers may flush microtasks between capture and bubble listeners.
      // Keep the marker through the current task so the close event can use it.
      setTimeout(() => {
        if (acceptedEscapeRef.current !== acceptedEscape) return;
        acceptedEscapeRef.current = null;
      });
      return true;
    });

    const onClose = useEvent((event: Event) => {
      const acceptedEscape = acceptedEscapeRef.current;
      acceptedEscapeRef.current = null;
      onCloseProp?.(event);
      if (event.defaultPrevented) {
        // Dialog restores its open state synchronously after a prevented close.
        // Preserve the original baseline across that false-to-true rollback.
        preserveCaptureOnNextOpenRef.current =
          captureSelectedValueBeforeCloseRef.current;
        queueMicrotask(() => {
          preserveCaptureOnNextOpenRef.current = null;
        });
        return;
      }
      if (!acceptedEscape) return;
      if (
        acceptedEscape.event.defaultPrevented &&
        !acceptedEscape.defaultPrevented
      ) {
        return;
      }
      if (acceptedEscape.event.cancelBubble && !acceptedEscape.cancelBubble) {
        return;
      }
      if (Array.isArray(store.getState().selectedValue)) return;
      if (!resetOnEscapeProp(acceptedEscape.event)) return;
      store.setSelectedValue(selectedValueBeforeMoveRef.current);
    });

    props = usePopover({
      store,
      modal,
      alwaysVisible,
      backdrop: false,
      // A select-shaped popup takes focus on every open, including a default or
      // programmatic one: showing it is a request to interact with it, and
      // leaving focus behind would strand the user outside an open listbox.
      // https://github.com/ariakit/ariakit/issues/7068
      // Keep this a boolean, since a callback would always be truthy and defeat
      // the dialog's early-out for popups that take no focus at all.
      autoFocusOnShow: hasSelect,
      initialFocus: hasSelect ? inputElement : undefined,
      finalFocus: selectElement || compositeElement,
      preserveTabOrderAnchor: null,
      unstable_treeSnapshotKey: treeSnapshotKey,
      ...props,
      hideOnEscape,
      onClose,
      // When the combobox popover is modal, we make sure to include the
      // combobox input and all the combobox controls (cancel, disclosure) that
      // are rendered outside of it in the list of persistent elements, so they
      // make part of the modal context and users can tab through them.
      getPersistentElements() {
        const elements = getPersistentElementsProp?.() || [];
        if (!modal) return elements;
        if (!store) return elements;
        const {
          compositeElement,
          contentElement,
          inputElement,
          selectElement,
        } = store.getState();
        const controls = [compositeElement, inputElement, selectElement];
        const persistentElement =
          selectElement || inputElement || compositeElement;
        if (!persistentElement) return elements;
        const persistentElements = new Set(elements);
        // Elements inside the popup are already part of the modal context.
        // Passing them along would make the popup an ancestor of one of its own
        // persistent elements, which the dialog reads as a nested dialog and
        // stops dismissing on Escape.
        const addPersistentElement = (element: HTMLElement | null) => {
          if (!element) return;
          if (contentElement?.contains(element)) return;
          persistentElements.add(element);
        };
        controls.forEach(addPersistentElement);
        const doc = getDocument(persistentElement);
        const selectors = new Set<string>();
        for (const element of [contentElement, ...controls]) {
          if (!element?.id) continue;
          selectors.add(`[aria-controls~="${element.id}"]`);
        }
        if (!selectors.size) return [...persistentElements];
        const selector = [...selectors].join(",");
        const controlElements = doc.querySelectorAll<HTMLElement>(selector);
        controlElements.forEach(addPersistentElement);
        return [...persistentElements];
      },
      // The combobox popover should focus on the combobox input when it hides,
      // unless the event was triggered by a click outside the popover, in which
      // case the input shouldn't be re-focused.
      autoFocusOnHide(element) {
        if (isFalsyBooleanCallback(autoFocusOnHide, element)) return false;
        if (hiddenByClickOutsideRef.current) {
          hiddenByClickOutsideRef.current = false;
          return false;
        }
        return true;
      },
      // Make sure we don't hide the popover when the user interacts with the
      // combobox cancel or the combobox disclosure buttons. They will have the
      // aria-controls attribute pointing to either the combobox input or the
      // combobox popover elements.
      hideOnInteractOutside(event: Event) {
        const state = store?.getState();
        const contentId = state?.contentElement?.id;
        const compositeId = state?.compositeElement?.id;
        if (isController(event.target, contentId, compositeId)) return false;
        const result =
          typeof hideOnInteractOutside === "function"
            ? hideOnInteractOutside(event)
            : hideOnInteractOutside;
        if (result) {
          hiddenByClickOutsideRef.current = event.type === "click";
        }
        return result;
      },
    });

    return props;
  },
);

/**
 * Renders a combobox popover. The `role` prop is set to `listbox` by default,
 * but can be overriden by any other valid combobox popup role (`listbox`,
 * `menu`, `tree`, `grid` or `dialog`).
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxPopover = createDialogComponent(
  forwardRef(function ComboboxPopover(props: ComboboxPopoverProps) {
    const htmlProps = useComboboxPopover(props);
    return createElement(TagName, htmlProps);
  }),
  useComboboxProviderContext,
);

export interface ComboboxPopoverOptions<T extends ElementType = TagName>
  extends ComboboxListOptions<T>, Omit<PopoverOptions<T>, "store"> {
  /**
   * When enabled, pressing printable character keys will move focus to the next
   * combobox item that starts with the entered characters.
   *
   * Defaults to `false` when a
   * [`ComboboxInput`](https://ariakit.com/reference/combobox-input) is rendered,
   * and `true` otherwise.
   */
  typeahead?: CompositeTypeaheadOptions<T>["typeahead"];
  /**
   * Determines whether the popup takes focus when it opens. Where that focus
   * lands depends on the popup's contents and on
   * [`virtualFocus`](https://ariakit.com/reference/combobox-provider#virtualfocus);
   * the
   * [`initialFocus`](https://ariakit.com/reference/combobox-popover#initialfocus)
   * prop can be used to set a specific element to receive it.
   *
   * Defaults to `true` when a
   * [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) is
   * rendered, and `false` otherwise, since a standalone
   * [`ComboboxInput`](https://ariakit.com/reference/combobox-input) keeps focus
   * while its popup is open.
   */
  autoFocusOnShow?: PopoverOptions<T>["autoFocusOnShow"];
  /**
   * Whether the combobox's
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * should be restored to what it was before the first item movement when
   * the popover accepts Escape and the cancelable close event isn't prevented.
   * Selection changes made before any item movement become part of the selected
   * value Escape restores.
   *
   * A descendant that handles Escape itself leaves the selected value alone.
   * Defaults to the store's
   * [`selectOnMove`](https://ariakit.com/reference/combobox-provider#selectonmove)
   * value, since moving through items is what changes the selected value while
   * the popover is open. This has no effect when the combobox supports multiple
   * selections.
   */
  resetOnEscape?: BooleanOrCallback<KeyboardEvent | ReactKeyboardEvent>;
}

export type ComboboxPopoverProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxPopoverOptions<T>
>;
