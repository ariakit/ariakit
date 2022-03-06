import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  PopoverDisclosureArrowOptions,
  usePopoverDisclosureArrow,
} from "../popover/popover-disclosure-arrow";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow pointing to the select popover position.
 * It's usually rendered inside the `Select` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectArrow({ state });
 * <Select state={state}>
 *   {state.value}
 *   <Role {...props} />
 * </Select>
 * <SelectPopover state={state}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const useSelectArrow = createHook<SelectArrowOptions>(
  ({ state, ...props }) => {
    props = usePopoverDisclosureArrow({ state, ...props });
    return props;
  }
);

/**
 * A component that renders an arrow pointing to the select popover position.
 * It's usually rendered inside the `Select` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <Select state={select}>
 *   {select.value}
 *   <SelectArrow />
 * </Select>
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const SelectArrow = createComponent<SelectArrowOptions>((props) => {
  const htmlProps = useSelectArrow(props);
  return createElement("span", htmlProps);
});

export type SelectArrowOptions<T extends As = "span"> = Omit<
  PopoverDisclosureArrowOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useSelectState` hook. If not provided, the parent
   * `Select` component's context will be used.
   */
  state?: SelectState;
};

export type SelectArrowProps<T extends As = "span"> = Props<
  SelectArrowOptions<T>
>;
