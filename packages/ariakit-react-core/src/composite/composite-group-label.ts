import type { GroupLabelOptions } from "../group/group-label.js";
import { useGroupLabel } from "../group/group-label.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { CompositeStore } from "./composite-store.js";

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
export const useCompositeGroupLabel = createHook<CompositeGroupLabelOptions>(
  ({ store, ...props }) => {
    props = useGroupLabel(props);
    return props;
  },
);

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
export const CompositeGroupLabel = createComponent<CompositeGroupLabelOptions>(
  (props) => {
    const htmlProps = useCompositeGroupLabel(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  CompositeGroupLabel.displayName = "CompositeGroupLabel";
}

export interface CompositeGroupLabelOptions<T extends As = "div">
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

export type CompositeGroupLabelProps<T extends As = "div"> = Props<
  CompositeGroupLabelOptions<T>
>;
