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
import {
  getActiveElement,
  isFocusable,
  isSelfTarget,
  getDocument,
  invariant,
  isFalsyBooleanCallback,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type {
  ElementType,
  FocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
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
type HTMLType = HTMLElementTagNameMap[TagName];

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

    const baseElement = useStoreState(store, "baseElement");
    const inputElement = useStoreState(store, "inputElement");
    const selectElement = useStoreState(store, "selectElement");
    const hiddenByClickOutsideRef = useRef(false);
    const hasSelect = !!selectElement;
    const selectOwnsFocus =
      !!selectElement && getActiveElement(selectElement) === selectElement;

    const selectOnMove = useStoreState(store, "selectOnMove");
    const acceptedEscapeRef = useRef<{
      event: KeyboardEvent;
      defaultPrevented: boolean;
      cancelBubble: boolean;
    } | null>(null);
    const preserveBaselineOnNextShowRef = useRef(false);
    const selectedValueBeforeShowRef = useRef(store.getState().selectedValue);

    // Capture the value when the popover is shown. The explicit assignment also
    // captures the current value if an already-open store replaces the store.
    useEffect(() => {
      selectedValueBeforeShowRef.current = store.getState().selectedValue;
      return sync(store, ["open"], (state, prevState) => {
        if (!state.open || prevState.open) return;
        if (preserveBaselineOnNextShowRef.current) {
          preserveBaselineOnNextShowRef.current = false;
          return;
        }
        selectedValueBeforeShowRef.current = store.getState().selectedValue;
      });
    }, [store]);

    // Virtual focus keeps DOM focus on the combobox input or select, so the
    // popup itself must never hold it. Otherwise arrow keys stop working until
    // the user tabs back out.
    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      if (!isSelfTarget(event)) return;
      const baseElement = store?.getState().baseElement;
      if (!baseElement) return;
      // A modal popover may render the base element inert, in which case
      // moving focus there would fight the dialog's focus containment.
      if (!isFocusable(baseElement)) return;
      const popover = event.currentTarget;
      queueMicrotask(() => {
        if (getDocument(popover).activeElement !== popover) return;
        baseElement.focus();
      });
    });

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
      onFocus,
    });
    props = useCompositeTypeahead({
      store,
      typeahead: !inputElement,
      ...props,
    });

    const hideOnEscapeProp = useBooleanEvent(props.hideOnEscape ?? true);
    const onCloseProp = props.onClose;

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
        // Keep the same baseline across that false-to-true rollback.
        preserveBaselineOnNextShowRef.current = true;
        queueMicrotask(() => {
          preserveBaselineOnNextShowRef.current = false;
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
      store.setSelectedValue(selectedValueBeforeShowRef.current);
    });

    props = usePopover({
      store,
      modal,
      alwaysVisible,
      backdrop: false,
      // A callback would always be truthy, defeating the dialog's early-out and
      // forcing a tabbable scan of the whole popup on every open.
      // Without an input, only take focus when the select initiated the open.
      autoFocusOnShow: hasSelect && (!!inputElement || selectOwnsFocus),
      initialFocus: hasSelect ? inputElement : undefined,
      finalFocus: selectElement || baseElement,
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
        const elements = props.getPersistentElements?.() || [];
        if (!modal) return elements;
        if (!store) return elements;
        const { baseElement, contentElement, inputElement, selectElement } =
          store.getState();
        const controls = [baseElement, inputElement, selectElement];
        const persistentElement = selectElement || inputElement || baseElement;
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
        const baseId = state?.baseElement?.id;
        if (isController(event.target, contentId, baseId)) return false;
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
   * Whether the combobox
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * should be restored to the value it had before the popover was shown when
   * the popover accepts Escape and the cancelable close event isn't prevented.
   * A descendant that handles Escape itself leaves the value alone. Defaults
   * to the store's
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
