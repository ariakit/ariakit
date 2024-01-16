import type { ElementType } from "react";
import type { GroupLabelOptions } from "../group/group-label.js";
import { useGroupLabel } from "../group/group-label.js";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import type { CompositeStore } from "./composite-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `CompositeGroupLabel` component. This hook must be
 * used in a component that's wrapped with `CompositeGroup` so the
 * `aria-labelledby` prop is properly set on the composite group element.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * // This component must be wrapped with CompositeGroup
 * const props = useCompositeGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useCompositeGroupLabel = createHook2<
  TagName,
  CompositeGroupLabelOptions
>(function useCompositeGroupLabel({ store, ...props }) {
  props = useGroupLabel(props);
  return props;
});

/**
 * Renders a label in a composite group. This component must be wrapped with
 * [`CompositeGroup`](https://ariakit.org/reference/composite-group) so the
 * `aria-labelledby` prop is properly set on the group element.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {4}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeGroup>
 *       <CompositeGroupLabel>Label</CompositeGroupLabel>
 *       <CompositeItem>Item 1</CompositeItem>
 *       <CompositeItem>Item 2</CompositeItem>
 *     </CompositeGroup>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export const CompositeGroupLabel = forwardRef(function CompositeGroupLabel(
  props: CompositeGroupLabelProps,
) {
  const htmlProps = useCompositeGroupLabel(props);
  return createElement(TagName, htmlProps);
});

export interface CompositeGroupLabelOptions<T extends ElementType = TagName>
  extends GroupLabelOptions<T> {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook. If not provided, the closest
   * [`Composite`](https://ariakit.org/reference/composite) or
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * components' context will be used.
   */
  store?: CompositeStore;
}

export type CompositeGroupLabelProps<T extends ElementType = TagName> = Props2<
  T,
  CompositeGroupLabelOptions<T>
>;
