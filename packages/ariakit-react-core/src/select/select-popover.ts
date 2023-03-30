import type { PopoverOptions } from "../popover/popover.js";
import { usePopover } from "../popover/popover.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { SelectListOptions } from "./select-list.js";
import { useSelectList } from "./select-list.js";

/**
 * Returns props to create a `SelectPopover` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectPopover({ store });
 * <Role {...props}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </Role>
 * ```
 */
export const useSelectPopover = createHook<SelectPopoverOptions>(
  ({ store, ...props }) => {
    // TODO: Maybe pass the autoFocusOnShow value here to the children with a
    // Provider so they can set autoFocus based on that.
    props = useSelectList({ store, ...props });
    props = usePopover({ store, ...props });

    return props;
  }
);

/**
 * Renders a select popover. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid select popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`).
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
export const SelectPopover = createComponent<SelectPopoverOptions>((props) => {
  const htmlProps = useSelectPopover(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectPopover.displayName = "SelectPopover";
}

export interface SelectPopoverOptions<T extends As = "div">
  extends SelectListOptions<T>,
    Omit<PopoverOptions<T>, "store"> {}

export type SelectPopoverProps<T extends As = "div"> = Props<
  SelectPopoverOptions<T>
>;
