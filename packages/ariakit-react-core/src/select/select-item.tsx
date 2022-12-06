import { MouseEvent, useCallback, useContext } from "react";
import { getPopupItemRole } from "@ariakit/core/utils/dom";
import { isDownloading, isOpeningInNewTab } from "@ariakit/core/utils/events";
import { invariant } from "@ariakit/core/utils/misc";
import { BooleanOrCallback } from "@ariakit/core/utils/types";
import {
  CompositeHoverOptions,
  useCompositeHover,
} from "../composite/composite-hover";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { useBooleanEvent, useEvent, useWrapElement } from "../utils/hooks";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system";
import { As, Props } from "../utils/types";
import { SelectContext, SelectItemCheckedContext } from "./select-context";
import { SelectStore } from "./select-store";

function isSelected(storeValue?: string | string[], itemValue?: string) {
  if (storeValue == null) return false;
  if (itemValue == null) return false;
  if (Array.isArray(storeValue)) {
    return storeValue.includes(itemValue);
  }
  return storeValue === itemValue;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select item.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectItem({ store, value: "Apple" });
 * <Role {...props} />
 * ```
 */
export const useSelectItem = createHook<SelectItemOptions>(
  ({
    store,
    value,
    getItem: getItemProp,
    hideOnClick,
    setValueOnClick = value != null,
    preventScrollOnKeyDown = true,
    focusOnHover = true,
    ...props
  }) => {
    const context = useContext(SelectContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "SelectItem must be wrapped in a SelectList or SelectPopover component"
    );

    const disabled = props.disabled;

    const getItem = useCallback<NonNullable<CompositeItemOptions["getItem"]>>(
      (item) => {
        // When the item is disabled, we don't register its value.
        const nextItem = {
          ...item,
          value: disabled ? undefined : value,
          children: value,
        };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [disabled, value, getItemProp]
    );

    const multiSelectable = store.useState((state) =>
      Array.isArray(state.value)
    );

    hideOnClick = hideOnClick ?? (value != null && !multiSelectable);

    const onClickProp = props.onClick;
    const setValueOnClickProp = useBooleanEvent(setValueOnClick);
    const hideOnClickProp = useBooleanEvent(hideOnClick);

    const onClick = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isDownloading(event)) return;
      if (isOpeningInNewTab(event)) return;
      if (setValueOnClickProp(event) && value != null) {
        store?.setValue((prevValue) => {
          if (!Array.isArray(prevValue)) return value;
          if (prevValue.includes(value)) {
            return prevValue.filter((v) => v !== value);
          }
          return [...prevValue, value];
        });
      }
      if (hideOnClickProp(event)) {
        store?.hide();
      }
    });

    const selected = store.useState((state) => isSelected(state.value, value));

    props = useWrapElement(
      props,
      (element) => (
        <SelectItemCheckedContext.Provider value={selected}>
          {element}
        </SelectItemCheckedContext.Provider>
      ),
      [selected]
    );

    const contentElement = store.useState("contentElement");

    props = {
      role: getPopupItemRole(contentElement),
      "aria-selected": selected,
      children: value,
      ...props,
      onClick,
    };

    props = useCompositeItem({
      store,
      getItem,
      preventScrollOnKeyDown,
      ...props,
    });

    const focusOnHoverProp = useBooleanEvent(focusOnHover);

    props = useCompositeHover({
      store,
      ...props,
      // We have to disable focusOnHover when the popup is closed, otherwise
      // the active item will change to null (the container) when the popup is
      // closed by clicking on an item.
      focusOnHover: (event) => {
        if (!focusOnHoverProp(event)) return false;
        const state = store?.getState();
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
 * const select = useSelectStore();
 * <Select store={select} />
 * <SelectPopover store={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const SelectItem = createMemoComponent<SelectItemOptions>((props) => {
  const htmlProps = useSelectItem(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectItem.displayName = "SelectItem";
}

export type SelectItemOptions<T extends As = "div"> = Omit<
  CompositeItemOptions<T>,
  "store" | "preventScrollOnKeyDown"
> &
  Omit<CompositeHoverOptions<T>, "store"> & {
    /**
     * Object returned by the `useSelectStore` hook. If not provided, the
     * parent `SelectList` or `SelectPopover` components' context will be
     * used.
     */
    store?: SelectStore;
    /**
     * The value of the item. This will be rendered as the children by default.
     *   - If `setValueOnClick` is set to `true` on this component, the
     *     `select.value` state will be set to this value when the user clicks
     *     on it.
     *   - If `select.setValueOnMove` is set to `true` on the select store, the
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
