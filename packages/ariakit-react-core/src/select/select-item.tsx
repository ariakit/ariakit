import type { MouseEvent } from "react";
import { useCallback } from "react";
import { getPopupItemRole } from "@ariakit/core/utils/dom";
import { isDownloading, isOpeningInNewTab } from "@ariakit/core/utils/events";
import { disabledFromProps, invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeHoverOptions } from "../composite/composite-hover.js";
import { useCompositeHover } from "../composite/composite-hover.js";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import {
  useBooleanEvent,
  useEvent,
  useId,
  useWrapElement,
} from "../utils/hooks.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  SelectItemCheckedContext,
  useSelectScopedContext,
} from "./select-context.js";
import type { SelectStore } from "./select-store.js";

function isSelected(storeValue?: string | string[], itemValue?: string) {
  if (storeValue == null) return false;
  if (itemValue == null) return false;
  if (Array.isArray(storeValue)) {
    return storeValue.includes(itemValue);
  }
  return storeValue === itemValue;
}

/**
 * Returns props to create a `SelectItem` component.
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
    const context = useSelectScopedContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "SelectItem must be wrapped in a SelectList or SelectPopover component.",
    );

    const id = useId(props.id);
    const disabled = disabledFromProps(props);

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
      [disabled, value, getItemProp],
    );

    const multiSelectable = store.useState((state) =>
      Array.isArray(state.value),
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
      [selected],
    );

    const contentElement = store.useState("contentElement");
    const autoFocus = store.useState((state) => {
      if (state.activeId !== id && store?.item(state.activeId)) return false;
      if (state.value == null) return false;
      if (value == null) return false;
      if (Array.isArray(state.value)) {
        return state.value[state.value.length - 1] === value;
      }
      return state.value === value;
    });

    props = {
      id,
      role: getPopupItemRole(contentElement),
      "aria-selected": selected,
      children: value,
      ...props,
      autoFocus: props.autoFocus ?? autoFocus,
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
  },
);

/**
 * Renders a select item inside a
 * [`SelectList`](https://ariakit.org/reference/select-list) or
 * [`SelectPopover`](https://ariakit.org/reference/select-popover).
 *
 * The `role` attribute will be automatically set on the item based on the
 * list's own `role` attribute. For example, if the
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) component's
 * `role` attribute is set to `listbox` (which is the default), the item `role`
 * will be set to `option`.
 *
 * By default, the [`value`](https://ariakit.org/reference/select-item#value)
 * prop will be rendered as the children, but this can be overriden if a custom
 * children is provided.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4-5}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectItem = createMemoComponent<SelectItemOptions>((props) => {
  const htmlProps = useSelectItem(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectItem.displayName = "SelectItem";
}

export interface SelectItemOptions<T extends As = "div">
  extends CompositeItemOptions<T>,
    CompositeHoverOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
   * not provided, the parent
   * [`SelectList`](https://ariakit.org/reference/select-list) or
   * [`SelectPopover`](https://ariakit.org/reference/select-popover) components'
   * context will be used.
   */
  store?: SelectStore;
  /**
   * The value of the item. This will be rendered as the children by default.
   * - If
   *   [`setValueOnClick`](https://ariakit.org/reference/select-item#setvalueonclick)
   *   is set to `true`, the
   *   [`value`](https://ariakit.org/reference/select-provider#value) state will
   *   be set to this value when the user clicks on it.
   * - If
   *   [`setValueOnMove`](https://ariakit.org/reference/select-provider#setvalueonmove)
   *   is set to `true`, the
   *   [`value`](https://ariakit.org/reference/select-provider#value) state will
   *   be set to this value when the user moves to it (which is usually the case
   *   when moving through the items using the keyboard).
   *
   * Live examples:
   * - [Form with Select](https://ariakit.org/examples/form-select)
   * - [Animated Select](https://ariakit.org/examples/select-animated)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   * - [Select grid](https://ariakit.org/examples/select-grid)
   * - [SelectGroup](https://ariakit.org/examples/select-group)
   * - [Select with custom
   *   item](https://ariakit.org/examples/select-item-custom)
   * @example
   * ```jsx
   * <SelectItem value="Apple" />
   * ```
   */
  value?: string;
  /**
   * Whether to hide the select when this item is clicked. By default, it's
   * `true` when the [`value`](https://ariakit.org/reference/select-item#value)
   * prop is also provided.
   */
  hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * Whether to set the select value with this item's value, if any, when this
   * item is clicked. By default, it's `true` when the
   * [`value`](https://ariakit.org/reference/select-item#value) prop is also
   * provided.
   */
  setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * @default true
   */
  preventScrollOnKeyDown?: CompositeItemOptions["preventScrollOnKeyDown"];
}

export type SelectItemProps<T extends As = "div"> = Props<SelectItemOptions<T>>;
