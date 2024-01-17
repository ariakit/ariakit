import type { ElementType } from "react";
import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.js";
import { useCompositeGroupLabel } from "../composite/composite-group-label.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import type { ComboboxStore } from "./combobox-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useComboboxGroupLabel = createHook<
  TagName,
  ComboboxGroupLabelOptions
>(function useComboboxGroupLabel(props) {
  props = useCompositeGroupLabel(props);
  return props;
});

/**
 * Renders a label in a combobox group. This component should be wrapped with
 * [`ComboboxGroup`](https://ariakit.org/reference/combobox-group) so the
 * `aria-labelledby` is correctly set on the group element.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {5}
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
export const ComboboxGroupLabel = forwardRef(function ComboboxGroupLabel(
  props: ComboboxGroupLabelProps,
) {
  const htmlProps = useComboboxGroupLabel(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxGroupLabelOptions<T extends ElementType = TagName>
  extends CompositeGroupLabelOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components' context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxGroupLabelProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxGroupLabelOptions<T>
>;
