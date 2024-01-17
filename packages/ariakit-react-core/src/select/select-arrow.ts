import type { ElementType } from "react";
import type { PopoverDisclosureArrowOptions } from "../popover/popover-disclosure-arrow.js";
import { usePopoverDisclosureArrow } from "../popover/popover-disclosure-arrow.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useSelectContext } from "./select-context.js";
import type { SelectStore } from "./select-store.js";

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectArrow` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectArrow({ store });
 * <Select store={store}>
 *   {store.value}
 *   <Role {...props} />
 * </Select>
 * <SelectPopover store={store}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const useSelectArrow = createHook<TagName, SelectArrowOptions>(
  function useSelectArrow({ store, ...props }) {
    const context = useSelectContext();
    store = store || context;
    props = usePopoverDisclosureArrow({ store, ...props });
    return props;
  },
);

/**
 * Renders an arrow pointing to the select popover position. It's usually
 * rendered inside the [`Select`](https://ariakit.org/reference/select)
 * component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4}
 * <SelectProvider>
 *   <Select>
 *     {select.value}
 *     <SelectArrow />
 *   </Select>
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectArrow = forwardRef(function SelectArrow(
  props: SelectArrowProps,
) {
  const htmlProps = useSelectArrow(props);
  return createElement(TagName, htmlProps);
});

export interface SelectArrowOptions<T extends ElementType = TagName>
  extends PopoverDisclosureArrowOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
   * not provided, the closest [`Select`](https://ariakit.org/reference/select)
   * or [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * components' context will be used.
   */
  store?: SelectStore;
}

export type SelectArrowProps<T extends ElementType = TagName> = Props<
  T,
  SelectArrowOptions<T>
>;
