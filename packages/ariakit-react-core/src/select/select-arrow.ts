import {
  PopoverDisclosureArrowOptions,
  usePopoverDisclosureArrow,
} from "../popover/popover-disclosure-arrow";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { SelectStore } from "./select-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow pointing to the select popover position.
 * It's usually rendered inside the `Select` component.
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
export const useSelectArrow = createHook<SelectArrowOptions>(
  ({ store, ...props }) => {
    props = usePopoverDisclosureArrow({ store, ...props });
    return props;
  }
);

/**
 * A component that renders an arrow pointing to the select popover position.
 * It's usually rendered inside the `Select` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore();
 * <Select store={select}>
 *   {select.value}
 *   <SelectArrow />
 * </Select>
 * <SelectPopover store={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const SelectArrow = createComponent<SelectArrowOptions>((props) => {
  const htmlProps = useSelectArrow(props);
  return createElement("span", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectArrow.displayName = "SelectArrow";
}

export type SelectArrowOptions<T extends As = "span"> = Omit<
  PopoverDisclosureArrowOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useSelectStore` hook. If not provided, the parent
   * `Select` component's context will be used.
   */
  store?: SelectStore;
};

export type SelectArrowProps<T extends As = "span"> = Props<
  SelectArrowOptions<T>
>;
