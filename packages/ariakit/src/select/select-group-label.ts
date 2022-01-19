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
export const SelectGroupLabel = createComponent<SelectGroupLabelOptions>(
  (props) => {
    const htmlProps = useSelectGroupLabel(props);
    return createElement("div", htmlProps);
  }
);

export type SelectGroupLabelOptions<T extends As = "div"> = Omit<
  CompositeGroupLabelOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useSelectState` hook.
   */
  state?: SelectState;
};

export type SelectGroupLabelProps<T extends As = "div"> = Props<
  SelectGroupLabelOptions<T>
>;
