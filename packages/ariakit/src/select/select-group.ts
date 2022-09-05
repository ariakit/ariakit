import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
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
 * <Select state={state} />
 * <SelectPopover state={state}>
 *   <Role {...props}>
 *     <SelectGroupLabel>Fruits</SelectGroupLabel>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </Role>
 * </SelectPopover>
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
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectGroup>
 *     <SelectGroupLabel>Fruits</SelectGroupLabel>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectGroup>
 * </SelectPopover>
 * ```
 */
export const SelectGroup = createComponent<SelectGroupOptions>((props) => {
  const htmlProps = useSelectGroup(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectGroup.displayName = "SelectGroup";
}

export type SelectGroupOptions<T extends As = "div"> = Omit<
  CompositeGroupOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useSelectState` hook. If not provided, the parent
   * `SelectList` or `SelectPopover` components' context will be used.
   */
  state?: SelectState;
};

export type SelectGroupProps<T extends As = "div"> = Props<
  SelectGroupOptions<T>
>;
