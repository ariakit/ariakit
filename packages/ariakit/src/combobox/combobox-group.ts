import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeGroupOptions,
  useCompositeGroup,
} from "../composite/composite-group";
import { ComboboxState } from "./combobox-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox group.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxGroup({ state });
 * <Combobox state={state} />
 * <ComboboxPopover state={state}>
 *   <Role {...props}>
 *     <ComboboxGroupLabel>Label</ComboboxGroupLabel>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxItem value="Item 2" />
 *   </Role>
 * </ComboboxPopover>
 * ```
 */
export const useComboboxGroup = createHook<ComboboxGroupOptions>((props) => {
  props = useCompositeGroup(props);
  return props;
});

/**
 * A component that renders a combobox group.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <Combobox state={state} />
 * <ComboboxPopover state={state}>
 *   <ComboboxGroup>
 *     <ComboboxGroupLabel>Label</ComboboxGroupLabel>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxItem value="Item 2" />
 *   </ComboboxGroup>
 * </ComboboxPopover>
 * ```
 */
export const ComboboxGroup = createComponent<ComboboxGroupOptions>((props) => {
  const htmlProps = useComboboxGroup(props);
  return createElement("div", htmlProps);
});

export type ComboboxGroupOptions<T extends As = "div"> = Omit<
  CompositeGroupOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useComboboxState` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  state?: ComboboxState;
};

export type ComboboxGroupProps<T extends As = "div"> = Props<
  ComboboxGroupOptions<T>
>;
