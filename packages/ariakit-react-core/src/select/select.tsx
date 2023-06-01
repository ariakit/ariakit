import type { KeyboardEvent, MouseEvent, SelectHTMLAttributes } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getPopupRole } from "@ariakit/core/utils/dom";
import { queueBeforeEvent } from "@ariakit/core/utils/events";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.js";
import { useCompositeTypeahead } from "../composite/composite-typeahead.js";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.js";
import { usePopoverDisclosure } from "../popover/popover-disclosure.js";
import {
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  useWrapElement,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { SelectArrow } from "./select-arrow.js";
import { SelectContext } from "./select-context.js";
import type { SelectStore } from "./select-store.js";

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
export const useSelect = createHook<SelectOptions>(
  ({
    store,
    name,
    form,
    required,
    showOnKeyDown = true,
    moveOnKeyDown = true,
    toggleOnClick = false,
    toggleOnPress = !toggleOnClick,
    ...props
  }) => {
    toggleOnPress = toggleOnClick ? false : toggleOnPress;

    const onKeyDownProp = props.onKeyDown;
    const showOnKeyDownProp = useBooleanEvent(showOnKeyDown);
    const moveOnKeyDownProp = useBooleanEvent(moveOnKeyDown);
    const toggleOnPressProp = useBooleanEvent(toggleOnPress);
    const placement = store.useState("placement");
    const dir = placement.split("-")[0] as BasePlacement;
    const value = store.useState("value");
    const multiSelectable = Array.isArray(value);

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      const { orientation, items, activeId } = store.getState();
      // toggleOnPress
      if (event.key === " " || event.key === "Enter") {
        if (toggleOnPressProp(event)) {
          event.preventDefault();
          store.toggle();
        }
      }
      // moveOnKeyDown
      const isVertical = orientation !== "horizontal";
      const isHorizontal = orientation !== "vertical";
      const isGrid = !!items.find(
        (item) => !item.disabled && item.value != null
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
        store.show();
        store.move(activeId);
      }
    });

    const onMouseDownProp = props.onMouseDown;

    const onMouseDown = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.button) return;
      if (event.ctrlKey) return;
      if (!toggleOnPressProp(event)) return;
      const element = event.currentTarget;
      queueBeforeEvent(element, "focusin", () => {
        store.setDisclosureElement(element);
        store.toggle();
      });
    });

    props = useWrapElement(
      props,
      (element) => (
        <SelectContext.Provider value={store}>{element}</SelectContext.Provider>
      ),
      [store]
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
    const items = store.useState("items");
    const values = useMemo(
      // Filter out items without value and duplicate values.
      () => [...new Set(items.map((i) => i.value!).filter((v) => v != null))],
      [items]
    );

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
              value={value}
              multiple={multiSelectable}
              // Even though this element is visually hidden and is not
              // tabbable, it's still focusable. Some autofill extensions like
              // 1password will move focus to the next form element on autofill.
              // In this case, we want to move focus to our custom select
              // element.
              onFocus={() => store.getState().selectElement?.focus()}
              onChange={(event) => {
                nativeSelectChangedRef.current = true;
                setAutofill(true);
                store.setValue(
                  multiSelectable
                    ? getSelectedValues(event.target)
                    : event.target.value
                );
              }}
            >
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
      ]
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
      "data-autofill": autofill ? "" : undefined,
      "data-name": name,
      children,
      ...props,
      ref: useMergeRefs(store.setSelectElement, props.ref),
      onKeyDown,
      onMouseDown,
    };

    props = usePopoverDisclosure({ store, toggleOnClick, ...props });
    props = useCompositeTypeahead({ store, ...props });

    return props;
  }
);

/**
 * Renders a select button.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore();
 * <Select store={select} />
 * <SelectPopover store={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const Select = createComponent<SelectOptions>((props) => {
  const htmlProps = useSelect(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Select.displayName = "Select";
}

export interface SelectOptions<T extends As = "button">
  extends PopoverDisclosureOptions<T>,
    CompositeTypeaheadOptions<T>,
    Pick<
      SelectHTMLAttributes<HTMLSelectElement>,
      "name" | "form" | "required"
    > {
  /**
   * Object returned by the `useSelectStore` hook.
   */
  store: SelectStore;
  /**
   * Determines whether the select list will be shown when the user presses
   * arrow keys while the select element is focused.
   * @default true
   */
  showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Determines whether pressing arrow keys will move the active item even
   * when the select list is hidden.
   * @default false
   */
  moveOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Determines whether `store.toggle()` will be called on click. By default,
   * the select list will be shown on press (on mouse down and on key down).
   * If this prop is set to `true`, the select list will be shown on click
   * instead.
   * @default false
   */
  toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Determines whether pressing space, enter or mouse down will toggle the
   * select list. This will be ignored if `toggleOnClick` is set to `true`.
   * @default true
   */
  toggleOnPress?: BooleanOrCallback<
    MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  >;
}

export type SelectProps<T extends As = "button"> = Props<SelectOptions<T>>;
