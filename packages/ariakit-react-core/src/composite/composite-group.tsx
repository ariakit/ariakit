import { GroupOptions, useGroup } from "../group/group";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { CompositeStore } from "./composite-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a composite group.
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
 * A component that renders a composite group.
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

export type CompositeGroupOptions<T extends As = "div"> = GroupOptions<T> & {
  /**
   * Object returned by the `useCompositeStore` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  store?: CompositeStore;
};

export type CompositeGroupProps<T extends As = "div"> = Props<
  CompositeGroupOptions<T>
>;
