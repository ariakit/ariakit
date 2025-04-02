import { toArray } from "@ariakit/core/utils/array";
import { getPopupRole } from "@ariakit/core/utils/dom";
import { queueBeforeEvent } from "@ariakit/core/utils/events";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type {
  ElementType,
  KeyboardEvent,
  MouseEvent,
  SelectHTMLAttributes,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import { useCompositeTypeahead } from "../composite/composite-typeahead.tsx";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.tsx";
import { usePopoverDisclosure } from "../popover/popover-disclosure.tsx";
import {
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  useWrapElement,
} from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { SelectArrow } from "./select-arrow.tsx";
import {
  SelectScopedContextProvider,
  useSelectProviderContext,
} from "./select-context.tsx";
import type { SelectStore } from "./select-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];
type BasePlacement = "top" | "bottom" | "left" | "right";

function getSelectedValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

// When moving through the items when the select list is closed, we don't want
// to move to items without value, so we filter them out here.
function nextWithValue(store: SelectStore, next: SelectStore["next"]) {
  return () => {
    const nextId = next();
    if (!nextId) return;
    let i = 0;
    let nextItem = store.item(nextId);
    const firstItem = nextItem;
    while (nextItem && nextItem.value == null) {
      const nextId = next(++i);
      if (!nextId) return;
      nextItem = store.item(nextId);
      // Prevents infinite loop when focusLoop is true
      if (nextItem === firstItem) break;
    }
    return nextItem?.id;
  };
}

/**
 * Returns props to create a `Select` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelect({ store });
 * <Role {...props} />
 * ```
 */
export const useSelect = createHook<TagName, SelectOptions>(function useSelect({
  store,
  name,
  form,
  required,
  showOnKeyDown = true,
  moveOnKeyDown = true,
  toggleOnPress = true,
  toggleOnClick = toggleOnPress,
  ...props
}) {
  const context = useSelectProviderContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "Select must receive a `store` prop or be wrapped in a SelectProvider component.",
  );

  const onKeyDownProp = props.onKeyDown;
  const showOnKeyDownProp = useBooleanEvent(showOnKeyDown);
  const moveOnKeyDownProp = useBooleanEvent(moveOnKeyDown);
  const placement = store.useState("placement");
  const dir = placement.split("-")[0] as BasePlacement;
  const value = store.useState("value");
  const multiSelectable = Array.isArray(value);

  const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
    onKeyDownProp?.(event);
    if (event.defaultPrevented) return;
    if (!store) return;
    const { orientation, items, activeId } = store.getState();
    // moveOnKeyDown
    const isVertical = orientation !== "horizontal";
    const isHorizontal = orientation !== "vertical";
    const isGrid = !!items.find((item) => !item.disabled && item.value != null)
      ?.rowId;
    const moveKeyMap = {
      ArrowUp: (isGrid || isVertical) && nextWithValue(store, store.up),
      ArrowRight: (isGrid || isHorizontal) && nextWithValue(store, store.next),
      ArrowDown: (isGrid || isVertical) && nextWithValue(store, store.down),
      ArrowLeft:
        (isGrid || isHorizontal) && nextWithValue(store, store.previous),
    };
    const getId = moveKeyMap[event.key as keyof typeof moveKeyMap];
    if (getId && moveOnKeyDownProp(event)) {
      event.preventDefault();
      store.move(getId());
    }
    // showOnKeyDown
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
    if (canShow && showOnKeyDownProp(event)) {
      event.preventDefault();
      store.move(activeId);
      // Schedule the show event to run after the key event has finished
      // bubbling. This is necessary to avoid the page to scroll when the
      // popover is shown.
      queueBeforeEvent(event.currentTarget, "keyup", store.show);
    }
  });

  props = useWrapElement(
    props,
    (element) => (
      <SelectScopedContextProvider value={store}>
        {element}
      </SelectScopedContextProvider>
    ),
    [store],
  );

  const [autofill, setAutofill] = useState(false);
  const nativeSelectChangedRef = useRef(false);

  // Resets the autofilled state when the select value changes, but only if
  // the change wasn't triggered by the native select element (which is an
  // autofill).
  useEffect(() => {
    const nativeSelectChanged = nativeSelectChangedRef.current;
    nativeSelectChangedRef.current = false;
    if (nativeSelectChanged) return;
    setAutofill(false);
  }, [value]);

  const labelId = store.useState((state) => state.labelElement?.id);
  const label = props["aria-label"];
  const labelledBy = props["aria-labelledby"] || labelId;
  const items = store.useState((state) => {
    if (!name) return;
    return state.items;
  });
  const values = useMemo(() => {
    // Filter out items without value and duplicate values.
    return [...new Set(items?.map((i) => i.value!).filter((v) => v != null))];
  }, [items]);

  // Renders a native select element with the same value as the select so we
  // support browser autofill. When the native select value changes, the
  // onChange event is triggered and we set the autofill state to true.
  props = useWrapElement(
    props,
    (element) => {
      if (!name) return element;
      return (
        <>
          <select
            style={{
              border: 0,
              clip: "rect(0 0 0 0)",
              height: "1px",
              margin: "-1px",
              overflow: "hidden",
              padding: 0,
              position: "absolute",
              whiteSpace: "nowrap",
              width: "1px",
            }}
            tabIndex={-1}
            aria-hidden
            aria-label={label}
            aria-labelledby={labelledBy}
            name={name}
            form={form}
            required={required}
            disabled={props.disabled}
            value={value}
            multiple={multiSelectable}
            // Even though this element is visually hidden and is not
            // tabbable, it's still focusable. Some autofill extensions like
            // 1password will move focus to the next form element on autofill.
            // In this case, we want to move focus to our custom select
            // element.
            onFocus={() => store?.getState().selectElement?.focus()}
            onChange={(event) => {
              nativeSelectChangedRef.current = true;
              setAutofill(true);
              store?.setValue(
                multiSelectable
                  ? getSelectedValues(event.target)
                  : event.target.value,
              );
            }}
          >
            {toArray(value).map((value) => {
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
      value,
      multiSelectable,
      values,
      props.disabled,
    ],
  );

  const children = (
    <>
      {value}
      <SelectArrow />
    </>
  );

  const contentElement = store.useState("contentElement");

  props = {
    role: "combobox",
    "aria-autocomplete": "none",
    "aria-labelledby": labelId,
    "aria-haspopup": getPopupRole(contentElement, "listbox"),
    "data-autofill": autofill || undefined,
    "data-name": name,
    children,
    ...props,
    ref: useMergeRefs(store.setSelectElement, props.ref),
    onKeyDown,
  };

  props = usePopoverDisclosure({ store, toggleOnClick, ...props });
  props = useCompositeTypeahead<TagName>({ store, ...props });

  return props;
});

/**
 * Renders a custom select element that controls the visibility of either a
 * [`SelectList`](https://ariakit.org/reference/select-list) or a
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) component.
 *
 * By default, the
 * [`value`](https://ariakit.org/reference/select-provider#value) state is
 * rendered as the children, followed by a
 * [`SelectArrow`](https://ariakit.org/reference/select-arrow) component. This
 * can be customized by passing different children to the component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {2}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const Select = forwardRef(function Select(props: SelectProps) {
  const htmlProps = useSelect(props);
  return createElement(TagName, htmlProps);
});

export interface SelectOptions<T extends ElementType = TagName>
  extends PopoverDisclosureOptions<T>,
    CompositeTypeaheadOptions<T>,
    Pick<
      SelectHTMLAttributes<HTMLSelectElement>,
      "name" | "form" | "required"
    > {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
   * not provided, the closest
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * component's context will be used.
   */
  store?: SelectStore;
  /**
   * Determines if the
   * [`SelectList`](https://ariakit.org/reference/select-list) or
   * [`SelectPopover`](https://ariakit.org/reference/select-popover) components
   * will appear when the user uses arrow keys while the select element is
   * in focus.
   *
   * Live examples:
   * - [Select Grid](https://ariakit.org/examples/select-grid)
   * @default true
   */
  showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Determines whether pressing arrow keys will move the active item even when
   * the [`SelectList`](https://ariakit.org/reference/select-list) or
   * [`SelectPopover`](https://ariakit.org/reference/select-popover) components
   * are hidden.
   * @default false
   */
  moveOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Determines whether pressing Space, Enter, or a click event will
   * [`toggle`](https://ariakit.org/reference/use-select-store#toggle) the
   * [`SelectList`](https://ariakit.org/reference/select-list) or
   * [`SelectPopover`](https://ariakit.org/reference/select-popover) components.
   * @default true
   * @deprecated Use
   * [`toggleOnClick`](https://ariakit.org/reference/select#toggleonclick)
   * instead.
   */
  toggleOnPress?: BooleanOrCallback<
    MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  >;
}

export type SelectProps<T extends ElementType = TagName> = Props<
  T,
  SelectOptions<T>
>;
