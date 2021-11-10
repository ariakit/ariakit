import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { PopoverArrowOptions, usePopoverArrow } from "../popover/popover-arrow";
import { ComboboxState } from "./combobox-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow inside the combobox popover element.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxArrow({ state });
 * <ComboboxPopover state={state}>
 *   <Role {...props} />
 * </ComboboxPopover>
 * ```
 */
export const useComboboxArrow = createHook<ComboboxArrowOptions>((props) => {
  return usePopoverArrow(props);
});

/**
 * A component that renders an arrow inside a `ComboboxPopover` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={combobox} />
 * <ComboboxPopover state={combobox}>
 *   <ComboboxArrow />
 * </ComboboxPopover>
 * ```
 */
export const ComboboxArrow = createComponent<ComboboxArrowOptions>((props) => {
  const htmlProps = useComboboxArrow(props);
  return createElement("div", htmlProps);
});

export type ComboboxArrowOptions<T extends As = "div"> = Omit<
  PopoverArrowOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useComboboxState` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  state?: ComboboxState;
};

export type ComboboxArrowProps<T extends As = "div"> = Props<
  ComboboxArrowOptions<T>
>;
