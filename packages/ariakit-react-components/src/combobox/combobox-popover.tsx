import { useStoreState } from "@ariakit/react-store";
import {
  useBooleanEvent,
  useEvent,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import {
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
import { useEffect, useRef, useState } from "react";
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
    hideOnEscape = true,
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

    const mounted = useStoreState(store, "mounted");
    const moved = useStoreState(store, ["moves"], (state) => !!state.moves);
    const selectOnMove = useStoreState(store, "selectOnMove");
    const selectedValue = useStoreState(store, "selectedValue");
    const multiSelectable = Array.isArray(selectedValue);
    const [defaultSelectedValue, setDefaultSelectedValue] =
      useState(selectedValue);

    // Keep tracking the selected value until the user moves through the items.
    // The popover may already be shown on its first render, and the store may
    // only settle its initial selected value afterwards, so freezing it any
    // earlier would restore a value the user never saw.
    useEffect(() => {
      if (mounted && moved) return;
      setDefaultSelectedValue(selectedValue);
    }, [mounted, moved, selectedValue]);

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
      baseElement.focus();
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

    props = usePopover({
      store,
      modal,
      alwaysVisible,
      backdrop: false,
      // A callback would always be truthy, defeating the dialog's early-out and
      // forcing a tabbable scan of the whole popup on every open.
      autoFocusOnShow: hasSelect && !!inputElement,
      initialFocus: hasSelect ? inputElement : undefined,
      finalFocus: selectElement || baseElement,
      preserveTabOrderAnchor: null,
      unstable_treeSnapshotKey: treeSnapshotKey,
      ...props,
      // When the combobox popover is modal, we make sure to include the
      // combobox input and all the combobox controls (cancel, disclosure) in
      // the list of persistent elements so they make part of the modal context,
      // allowing users to tab through them.
      getPersistentElements() {
        const elements = props.getPersistentElements?.() || [];
        if (!modal) return elements;
        if (!store) return elements;
        const { baseElement, contentElement, inputElement, selectElement } =
          store.getState();
        const persistentElement = selectElement || inputElement || baseElement;
        if (!persistentElement) return elements;
        const persistentElements = new Set(elements);
        if (baseElement) {
          persistentElements.add(baseElement);
        }
        if (inputElement) {
          persistentElements.add(inputElement);
        }
        if (selectElement) {
          persistentElements.add(selectElement);
        }
        const doc = getDocument(persistentElement);
        const selectors: string[] = [];
        if (contentElement?.id) {
          selectors.push(`[aria-controls~="${contentElement.id}"]`);
        }
        if (baseElement?.id) {
          selectors.push(`[aria-controls~="${baseElement.id}"]`);
        }
        if (inputElement?.id) {
          selectors.push(`[aria-controls~="${inputElement.id}"]`);
        }
        if (selectElement?.id) {
          selectors.push(`[aria-controls~="${selectElement.id}"]`);
        }
        if (!selectors.length) return [...persistentElements];
        const selector = selectors.join(",");
        const controlElements = doc.querySelectorAll<HTMLElement>(selector);
        controlElements.forEach((element) => {
          persistentElements.add(element);
        });
        return [...persistentElements];
      },
      // The popup only gets keyboard events proxied from the active item, so
      // restoring the value on a keydown there would be skipped whenever no
      // item is active. This runs wherever focus is. The dialog memoizes it per
      // event, so it never runs twice, but it runs while the escape key is
      // still being preflighted: a descendant that prevents the default
      // afterwards keeps the popover open with the value already restored.
      hideOnEscape(event) {
        if (isFalsyBooleanCallback(hideOnEscape, event)) return false;
        if (!multiSelectable && resetOnEscapeProp(event)) {
          store?.setSelectedValue(defaultSelectedValue);
        }
        return true;
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
   * Whether the combobox
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * should be restored to the value it had before the popover was shown when
   * Escape is pressed. Defaults to the store's
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
