import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import {
  toArray,
  disabledFromProps,
  getActiveElement,
  getPopupRole,
  queueBeforeEvent,
  invariant,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, KeyboardEvent, SelectHTMLAttributes } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { withDefaultButtonType } from "../button/utils.ts";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import { useCompositeTypeahead } from "../composite/composite-typeahead.tsx";
import { useComposite } from "../composite/composite.tsx";
import { isCompositeMoveKey } from "../focusable/__utils.ts";
import { getBasePlacement } from "../popover/__utils.ts";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.tsx";
import { usePopoverDisclosure } from "../popover/popover-disclosure.tsx";
import { getVisuallyHiddenStyle } from "../visually-hidden/visually-hidden.tsx";
import {
  getScrollItemIntoView,
  useTrackComboboxSelectPresentation,
} from "./__utils.ts";
import {
  ComboboxScopedContextProvider,
  useComboboxProviderContext,
} from "./combobox-context.tsx";
import { ComboboxSelectArrow } from "./combobox-select-arrow.tsx";
import { ComboboxSelectedValue } from "./combobox-selected-value.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getSelectedValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function ownsFocus(element: HTMLElement) {
  return getActiveElement(element) === element;
}

// When moving through the items while the select list is closed, we don't want
// to move to items without value, so we filter them out here.
function nextWithValue(store: ComboboxStore, next: ComboboxStore["next"]) {
  return () => {
    const visitedIds = new Set<string>();
    let nextId = next();
    while (nextId) {
      const nextItem = store.item(nextId);
      if (!nextItem) return;
      if (nextItem.value != null) {
        return nextItem.id;
      }
      // Walking from the last returned id, as if the key was pressed again
      // from there, skips items without value even across focusLoop
      // boundaries. A repeated id means the walk cycled through every
      // reachable item without finding one with value, so we return undefined
      // to keep move() from changing the active item.
      if (visitedIds.has(nextId)) return;
      visitedIds.add(nextId);
      nextId = next({ activeId: nextId });
    }
    return;
  };
}

/**
 * Returns props to create a `ComboboxSelect` component.
 * @see https://ariakit.com/components/combobox
 */
export const useComboboxSelect = createHook<TagName, ComboboxSelectOptions>(
  function useComboboxSelect({
    store,
    name,
    form,
    required,
    showOnKeyDown = true,
    moveOnKeyDown = true,
    toggleOnClick = true,
    focusable = true,
    ...props
  }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxSelect must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    useTrackComboboxSelectPresentation(store);

    const onKeyDownProp = props.onKeyDown;
    const disabledProp = disabledFromProps(props);
    const showOnKeyDownProp = useBooleanEvent(showOnKeyDown);
    const moveOnKeyDownProp = useBooleanEvent(moveOnKeyDown);
    const placement = useStoreState(store, "placement");
    const dir = getBasePlacement(placement);
    const selectedValue = useStoreState(store, "selectedValue");
    const multiSelectable = Array.isArray(selectedValue);
    const inputElement = useStoreState(store, "inputElement");
    const mounted = useStoreState(store, "mounted");
    const open = useStoreState(store, "open");

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      const { orientation, items, activeId, open } = store.getState();
      const isVertical = orientation !== "horizontal";
      const isHorizontal = orientation !== "vertical";
      const isGrid = !!items.find(
        (item) => !item.disabled && item.value != null,
      )?.rowId;
      const moveKeyMap = {
        ArrowUp: (isGrid || isVertical) && nextWithValue(store, store.up),
        ArrowRight:
          (isGrid || isHorizontal) && nextWithValue(store, store.next),
        ArrowDown: (isGrid || isVertical) && nextWithValue(store, store.down),
        ArrowLeft:
          (isGrid || isHorizontal) && nextWithValue(store, store.previous),
      };
      const getId = moveKeyMap[event.key as keyof typeof moveKeyMap];
      if (!open && getId && moveOnKeyDownProp(event)) {
        event.preventDefault();
        store.move(getId());
      }
      const isTopOrBottom = dir === "top" || dir === "bottom";
      const isLeft = dir === "left";
      const isRight = dir === "right";
      const canShowKeyMap = {
        ArrowDown: isTopOrBottom,
        ArrowUp: isTopOrBottom,
        ArrowLeft: isLeft,
        ArrowRight: isRight,
      };
      const canShow = canShowKeyMap[event.key as keyof typeof canShowKeyMap];
      // While the popup is open, arrow keys only move through items. Running
      // the show branch again would move back to the stale active item read at
      // the start of this handler, undoing the move above.
      if (!open && canShow && showOnKeyDownProp(event)) {
        event.preventDefault();
        store.move(activeId);
        queueBeforeEvent(event.currentTarget, "keyup", store.show);
      }
    });

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxScopedContextProvider value={store}>
          {element}
        </ComboboxScopedContextProvider>
      ),
      [store],
    );

    const [autofill, setAutofill] = useState(false);
    const nativeSelectChangedRef = useRef(false);

    // Resets the autofilled state when the selected value changes, but only if
    // the change wasn't triggered by the native select element.
    useEffect(() => {
      const nativeSelectChanged = nativeSelectChangedRef.current;
      nativeSelectChangedRef.current = false;
      if (nativeSelectChanged) return;
      setAutofill(false);
    }, [selectedValue]);

    const labelElement = useStoreState(store, "selectLabelElement");
    useAttribute(labelElement, "id");
    const labelId = labelElement?.id;
    const label = props["aria-label"];
    const labelledBy = props["aria-labelledby"] || labelId;
    const items = useStoreState(store, ["items"], (state) => {
      if (!name) return;
      return state.items;
    });
    const values = useMemo(() => {
      const itemValues = items?.flatMap((item) => item.value ?? []);
      return [...new Set(itemValues)];
    }, [items]);

    // Mirror the custom select with a native control so browser autofill can
    // update the combobox store.
    props = useWrapElement(
      props,
      (element) => {
        if (!name) return element;
        return (
          <>
            <select
              style={getVisuallyHiddenStyle()}
              tabIndex={-1}
              aria-hidden
              aria-label={label}
              aria-labelledby={label != null ? undefined : labelledBy}
              name={name}
              form={form}
              required={required}
              disabled={disabledProp}
              value={selectedValue}
              multiple={multiSelectable}
              // Although visually hidden and not tabbable, this element remains
              // focusable. Some autofill extensions move focus to the next form
              // element, so redirect it to the custom select.
              onFocus={() => store?.getState().selectElement?.focus()}
              onChange={(event) => {
                nativeSelectChangedRef.current = true;
                setAutofill(true);
                store?.setSelectedValue(
                  multiSelectable
                    ? getSelectedValues(event.target)
                    : event.target.value,
                );
              }}
            >
              {toArray(selectedValue).map((value) => {
                if (value == null) return null;
                if (values.includes(value)) return null;
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
              {values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {element}
          </>
        );
      },
      [
        store,
        label,
        labelledBy,
        name,
        form,
        required,
        selectedValue,
        multiSelectable,
        values,
        disabledProp,
      ],
    );

    const children = (
      <>
        <ComboboxSelectedValue />
        <ComboboxSelectArrow />
      </>
    );
    const contentElement = useStoreState(store, "contentElement");
    // The popup role is resolved asynchronously by ComboboxList, so the
    // attribute is tracked to keep aria-haspopup in sync on the first open.
    useAttribute(contentElement, "role");

    props = {
      role: "combobox",
      "aria-autocomplete": "none",
      "aria-labelledby": props["aria-label"] != null ? undefined : labelId,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      // The select is the combobox for this popup, so it announces the popup's
      // state directly, like Combobox and ComboboxDisclosure do, instead of
      // depending on still owning the store's disclosure element.
      // https://github.com/ariakit/ariakit/issues/7080
      "aria-expanded": open,
      "data-autofill": autofill || undefined,
      "data-name": name,
      children,
      ...props,
      ref: useMergeRefs(store.setSelectElement, props.ref),
      onKeyDown,
    };

    props = usePopoverDisclosure({
      store,
      toggleOnClick,
      focusable,
      ...props,
    });
    const scrollItemIntoView = getScrollItemIntoView(store);
    props = useCompositeTypeahead<TagName>({ store, ...props });
    const onKeyDownCaptureProp = props.onKeyDownCapture;
    const onKeyUpCaptureProp = props.onKeyUpCapture;
    props = useComposite<TagName>({
      store,
      unstable_scrollIntoView: scrollItemIntoView,
      composite: !inputElement,
      focusable,
      // The select handler owns closed navigation so it can skip value-less
      // items. Once open, Composite owns navigation and can also finish moves
      // whose target has no element yet.
      moveOnKeyPress: () => store.getState().open,
      ...props,
    });
    const onCompositeKeyDownCapture = props.onKeyDownCapture;
    const onCompositeKeyUpCapture = props.onKeyUpCapture;
    const shouldProxyCompositeEvent = (event: KeyboardEvent<HTMLType>) => {
      if (!store.getState().open) return false;
      if (!ownsFocus(event.currentTarget)) return false;
      if (!inputElement) return true;
      return isCompositeMoveKey(event.key);
    };
    props = {
      ...props,
      // The store points the active item at the current selection while the
      // popup is closed, but a collapsed select must not reference an item
      // that may not even be rendered.
      "aria-activedescendant": mounted
        ? props["aria-activedescendant"]
        : undefined,
      onKeyDownCapture(event) {
        if (shouldProxyCompositeEvent(event)) {
          onCompositeKeyDownCapture?.(event);
        } else {
          onKeyDownCaptureProp?.(event);
        }
      },
      onKeyUpCapture(event) {
        if (shouldProxyCompositeEvent(event)) {
          onCompositeKeyUpCapture?.(event);
        } else {
          onKeyUpCaptureProp?.(event);
        }
      },
    };

    return props;
  },
);

/**
 * Renders a custom select element that controls the visibility of a
 * [`ComboboxList`](https://ariakit.com/reference/combobox-list) or
 * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).
 *
 * By default, the combobox store's
 * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
 * state is rendered as the children, followed by a
 * [`ComboboxSelectArrow`](https://ariakit.com/reference/combobox-select-arrow).
 * @example
 * ```jsx {2}
 * <ComboboxProvider>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 * @see https://ariakit.com/components/combobox
 */
export const ComboboxSelect = forwardRef(function ComboboxSelect(
  props: ComboboxSelectProps,
) {
  const htmlProps = useComboboxSelect(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface ComboboxSelectOptions<T extends ElementType = TagName>
  extends
    PopoverDisclosureOptions<T>,
    CompositeTypeaheadOptions<T>,
    Pick<
      SelectHTMLAttributes<HTMLSelectElement>,
      "name" | "form" | "required"
    > {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * Whether arrow keys show the combobox popover.
   * @default true
   */
  showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Whether arrow keys move through items while the popover is hidden.
   * @default true
   */
  moveOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
}

export type ComboboxSelectProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxSelectOptions<T>
>;
