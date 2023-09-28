import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.js";
import { useCompositeGroupLabel } from "../composite/composite-group-label.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { ComboboxStore } from "./combobox-store.js";

/**
 * Returns props to create a `ComboboxGroupLabel` component. This hook should be
 * used in a component that's wrapped with `ComboboxGroup` so the
 * `aria-labelledby` is correctly set on the combobox group element.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * // This component should be wrapped with ComboboxGroup
 * const props = useComboboxGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useComboboxGroupLabel = createHook<ComboboxGroupLabelOptions>(
  (props) => {
    props = useCompositeGroupLabel(props);
    return props;
  },
);

/**
 * Renders a label in a combobox group. This component should be wrapped with
 * `ComboboxGroup` so the `aria-labelledby` is correctly set on the combobox
 * group element.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxGroup>
 *       <ComboboxGroupLabel>Fruits</ComboboxGroupLabel>
 *       <ComboboxItem value="Apple" />
 *       <ComboboxItem value="Banana" />
 *     </ComboboxGroup>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxGroupLabel = createComponent<ComboboxGroupLabelOptions>(
  (props) => {
    const htmlProps = useComboboxGroupLabel(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  ComboboxGroupLabel.displayName = "ComboboxGroupLabel";
}

export interface ComboboxGroupLabelOptions<T extends As = "div">
  extends CompositeGroupLabelOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the parent
   * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components' context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxGroupLabelProps<T extends As = "div"> = Props<
  ComboboxGroupLabelOptions<T>
>;
