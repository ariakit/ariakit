import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeGroupLabelOptions,
  useCompositeGroupLabel,
} from "../composite/composite-group-label";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label in a select group. This hook must be used
 * in a component that's wrapped with `SelectGroup` so the `aria-labelledby`
 * prop is properly set on the select group element.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * // This component must be wrapped with SelectGroup
 * const props = useSelectGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useSelectGroupLabel = createHook<SelectGroupLabelOptions>(
  (props) => {
    props = useCompositeGroupLabel(props);
    return props;
  }
);

/**
 * A component that renders a label in a select group. This component must be
 * wrapped with `SelectGroup` so the `aria-labelledby` prop is properly set
 * on the select group element.
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
 *   <SelectGroup>
 *     <SelectGroupLabel>Meat</SelectGroupLabel>
 *     <SelectItem value="Beef" />
 *     <SelectItem value="Chicken" />
 *   </SelectGroup>
 * </SelectPopover>
 * ```
 */
export const SelectGroupLabel = createComponent<SelectGroupLabelOptions>(
  (props) => {
    const htmlProps = useSelectGroupLabel(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  SelectGroupLabel.displayName = "SelectGroupLabel";
}

export type SelectGroupLabelOptions<T extends As = "div"> = Omit<
  CompositeGroupLabelOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useSelectState` hook. If not provided, the parent
   * `SelectList` or `SelectPopover` components' context will be used.
   */
  state?: SelectState;
};

export type SelectGroupLabelProps<T extends As = "div"> = Props<
  SelectGroupLabelOptions<T>
>;
