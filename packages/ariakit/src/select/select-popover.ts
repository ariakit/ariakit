import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { PopoverOptions, usePopover } from "../popover/popover";
import { SelectListOptions, useSelectList } from "./select-list";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select popover.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectPopover({ state });
 * <Role {...props}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </Role>
 * ```
 */
export const useSelectPopover = createHook<SelectPopoverOptions>(
  ({ state, ...props }) => {
    props = useSelectList({ state, ...props });
    props = usePopover({ state, ...props });
    return props;
  }
);

/**
 * A component that renders a select popover. The `role` prop is set to
 * `listbox` by default, but can be overriden by any other valid select popup
 * role (`listbox`, `menu`, `tree`, `grid` or `dialog`).
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
export const SelectPopover = createComponent<SelectPopoverOptions>((props) => {
  const htmlProps = useSelectPopover(props);
  return createElement("div", htmlProps);
});

export type SelectPopoverOptions<T extends As = "div"> = SelectListOptions<T> &
  Omit<PopoverOptions<T>, "state">;

export type SelectPopoverProps<T extends As = "div"> = Props<
  SelectPopoverOptions<T>
>;
