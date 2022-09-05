import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  CompositeSeparatorOptions,
  useCompositeSeparator,
} from "../composite/composite-separator";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a separator element for select items.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectSeparator({ state });
 * <SelectPopover state={state}>
 *   <SelectItem value="Item 1" />
 *   <Role {...props} />
 *   <SelectItem value="Item 2" />
 *   <SelectItem value="Item 3" />
 * </SelectPopover>
 * ```
 */
export const useSelectSeparator = createHook<SelectSeparatorOptions>(
  (props) => {
    props = useCompositeSeparator(props);
    return props;
  }
);

/**
 * A component that renders a separator element for select items.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState();
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectItem value="Item 1" />
 *   <SelectSeparator />
 *   <SelectItem value="Item 2" />
 *   <SelectItem value="Item 3" />
 * </SelectPopover>
 * ```
 */
export const SelectSeparator = createComponent<SelectSeparatorOptions>(
  (props) => {
    const htmlProps = useSelectSeparator(props);
    return createElement("hr", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  SelectSeparator.displayName = "SelectSeparator";
}

export type SelectSeparatorOptions<T extends As = "hr"> = Omit<
  CompositeSeparatorOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useSelectState` hook. If not provided, the parent
   * `SelectList` or `SelectPopover` components' context will be used.
   */
  state?: SelectState;
};

export type SelectSeparatorProps<T extends As = "hr"> = Props<
  SelectSeparatorOptions<T>
>;
