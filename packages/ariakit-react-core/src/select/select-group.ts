import {
  CompositeGroupOptions,
  useCompositeGroup,
} from "../composite/composite-group";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { SelectStore } from "./select-store";

/**
 * Returns props to create a `SelectGroup` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectGroup({ store });
 * <Select store={store} />
 * <SelectPopover store={store}>
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
 * Renders a select group.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore();
 * <Select store={select} />
 * <SelectPopover store={select}>
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

export interface SelectGroupOptions<T extends As = "div">
  extends CompositeGroupOptions<T> {
  /**
   * Object returned by the `useSelectStore` hook. If not provided, the parent
   * `SelectList` or `SelectPopover` components' context will be used.
   */
  store?: SelectStore;
}

export type SelectGroupProps<T extends As = "div"> = Props<
  SelectGroupOptions<T>
>;
