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
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select group.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectGroup({ state });
 * <SelectButton state={state}>Recent Items</SelectButton>
 * <Select state={state}>
 *   <Role {...props}>
 *     <SelectGroupLabel>Applications</SelectGroupLabel>
 *     <SelectItem>Google Chrome.app</SelectItem>
 *     <SelectItem>Safari.app</SelectItem>
 *   </Role>
 * </Select>
 * ```
 */
export const useSelectGroup = createHook<SelectGroupOptions>((props) => {
  props = useCompositeGroup(props);
  return props;
});

/**
 * A component that renders a select group.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <SelectButton state={select}>Recent Items</SelectButton>
 * <Select state={select}>
 *   <SelectGroup>
 *     <SelectGroupLabel>Applications</SelectGroupLabel>
 *     <SelectItem>Google Chrome.app</SelectItem>
 *     <SelectItem>Safari.app</SelectItem>
 *   </SelectGroup>
 * </Select>
 * ```
 */
export const SelectGroup = createComponent<SelectGroupOptions>((props) => {
  const htmlProps = useSelectGroup(props);
  return createElement("div", htmlProps);
});

export type SelectGroupOptions<T extends As = "div"> = Omit<
  CompositeGroupOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useSelectState` hook.
   */
  state?: SelectState;
};

export type SelectGroupProps<T extends As = "div"> = Props<
  SelectGroupOptions<T>
>;
