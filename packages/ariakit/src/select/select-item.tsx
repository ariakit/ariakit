import { MouseEvent, useCallback } from "react";
import { getPopupItemRole } from "ariakit-utils/dom";
import { useBooleanEvent, useEvent, useWrapElement } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { BooleanOrCallback } from "ariakit-utils/types";
import {
  CompositeHoverOptions,
  useCompositeHover,
} from "../composite/composite-hover";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { SelectContext, SelectItemCheckedContext } from "./__utils";
import { SelectState } from "./select-state";

function isSelected(stateValue?: string | string[], itemValue?: string) {
  if (stateValue == null) return false;
  if (itemValue == null) return false;
  if (Array.isArray(stateValue)) {
    return stateValue.includes(itemValue);
  }
  return stateValue === itemValue;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select item.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectItem({ state, value: "Apple" });
 * <Role {...props} />
 * ```
 */
export const useSelectItem = createHook<SelectItemOptions>(
  ({
    state,
    value,
    getItem: getItemProp,
    hideOnClick,
    setValueOnClick = value != null,
    preventScrollOnKeyDown = true,
    focusOnHover = true,
    ...props
  }) => {
    state = useStore(state || SelectContext, [
      useCallback((s: SelectState) => isSelected(s.value, value), [value]),
      "setValue",
      "hide",
      "contentElement",
      "open",
    ]);

    const disabled = props.disabled;

    const getItem = useCallback<NonNullable<CompositeItemOptions["getItem"]>>(
      (item) => {
        // When the item is disabled, we don't register its value.
        const nextItem = { ...item, value: disabled ? undefined : value };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [disabled, value, getItemProp]
    );

    const multiSelectable = Array.isArray(state?.value);
    hideOnClick = hideOnClick ?? (value != null && !multiSelectable);

    const onClickProp = props.onClick;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const hideOnClickProp = useBooleanEvent(hideOnClick);

    const onClick = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (setValueOnClickProp(event) && value != null) {
        state?.setValue((prevValue) => {
          if (!Array.isArray(prevValue)) return value;
          if (prevValue.includes(value)) {
            return prevValue.filter((v) => v !== value);
          }
          return [...prevValue, value];
        });
      }
      if (hideOnClickProp(event)) {
        state?.hide();
      }
    });

    const selected = isSelected(state?.value, value);

    props = useWrapElement(
      props,
      (element) => (
        <SelectItemCheckedContext.Provider value={selected}>
          {element}
        </SelectItemCheckedContext.Provider>
      ),
      [selected]
    );

    props = {
      role: getPopupItemRole(state?.contentElement),
      "aria-selected": selected,
      children: value,
      ...props,
      onClick,
    };

    props = useCompositeItem({
      state,
      getItem,
      preventScrollOnKeyDown,
      ...props,
    });

    const focusOnHoverProp = useBooleanEvent(focusOnHover);

    props = useCompositeHover({
      state,
      ...props,
      // We have to disable focusOnHover when the popup is closed, otherwise
      // the active item will change to null (the container) when the popup is
      // closed by clicking on an item.
      focusOnHover: (event) => {
        if (!focusOnHoverProp(event)) return false;
        return !!state?.open;
      },
    });

    return props;
  }
);

/**
 * A component that renders a select item inside a select list or select
 * popover. The `role` prop will be automatically set based on the `SelectList`
 * or `SelectPopover` own `role` prop. For example, if the `SelectPopover`
 * component's `role` prop is set to `listbox` (default), the `SelectItem`
 * `role` will be set to `option`. By default, the `value` prop will be rendered
 * as the children, but this can be overriden.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const SelectItem = createMemoComponent<SelectItemOptions>((props) => {
  const htmlProps = useSelectItem(props);
  return createElement("div", htmlProps);
});

export type SelectItemOptions<T extends As = "div"> = Omit<
  CompositeItemOptions<T>,
  "state" | "preventScrollOnKeyDown"
> &
  Omit<CompositeHoverOptions<T>, "state"> & {
    /**
     * Object returned by the `useSelectState` hook. If not provided, the
     * parent `SelectList` or `SelectPopover` components' context will be
     * used.
     */
    state?: SelectState;
    /**
     * The value of the item. This will be rendered as the children by default.
     *   - If `setValueOnClick` is set to `true` on this component, the
     *     `select.value` state will be set to this value when the user clicks
     *     on it.
     *   - If `select.setValueOnMove` is set to `true` on the select state, the
     *     `select.value` state will be set to this value when the user moves to
     *     it (which is usually the case when moving through the items using the
     *     keyboard).
     * @example
     * ```jsx
     * <SelectItem value="Apple" />
     * ```
     */
    value?: string;
    /**
     * Whether to hide the select when this item is clicked. By default, it's
     * `true` when the `value` prop is also provided.
     */
    hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
    /**
     * Whether to set the select value with this item's value, if any, when this
     * item is clicked. By default, it's `true` when the `value` prop is also
     * provided.
     */
    setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
    /**
     * Whether the scroll behavior should be prevented when pressing arrow keys
     * on the first or the last items.
     * @default true
     */
    preventScrollOnKeyDown?: CompositeItemOptions["preventScrollOnKeyDown"];
  };

export type SelectItemProps<T extends As = "div"> = Props<SelectItemOptions<T>>;
