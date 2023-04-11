import type { GroupOptions } from "../group/group.js";
import { useGroup } from "../group/group.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { CompositeStore } from "./composite-store.js";

/**
 * Returns props to create a `CompositeGroup` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeGroup({ store });
 * <Composite store={store}>
 *   <Role {...props}>
 *     <CompositeGroupLabel>Label</CompositeGroupLabel>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeItem>Item 2</CompositeItem>
 *   </Role>
 * </Composite>
 * ```
 */
export const useCompositeGroup = createHook<CompositeGroupOptions>(
  ({ store, ...props }) => {
    props = useGroup(props);
    return props;
  }
);

/**
 * Renders a group element for composite items.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite}>
 *   <CompositeGroup>
 *     <CompositeGroupLabel>Label</CompositeGroupLabel>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeItem>Item 2</CompositeItem>
 *   </CompositeGroup>
 * </Composite>
 * ```
 */
export const CompositeGroup = createComponent<CompositeGroupOptions>(
  (props) => {
    const htmlProps = useCompositeGroup(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  CompositeGroup.displayName = "CompositeGroup";
}

export interface CompositeGroupOptions<T extends As = "div">
  extends GroupOptions<T> {
  /**
   * Object returned by the `useCompositeStore` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  store?: CompositeStore;
}

export type CompositeGroupProps<T extends As = "div"> = Props<
  CompositeGroupOptions<T>
>;
