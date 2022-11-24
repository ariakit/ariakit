import { GroupLabelOptions, useGroupLabel } from "../group/group-label";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { CompositeStore } from "./composite-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label in a composite group. This hook must be
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
  }
);

/**
 * A component that renders a label in a composite group. This component must be
 * wrapped with `CompositeGroup` so the `aria-labelledby` prop is properly set
 * on the composite group element.
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
export const CompositeGroupLabel = createComponent<CompositeGroupLabelOptions>(
  (props) => {
    const htmlProps = useCompositeGroupLabel(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  CompositeGroupLabel.displayName = "CompositeGroupLabel";
}

export type CompositeGroupLabelOptions<T extends As = "div"> =
  GroupLabelOptions<T> & {
    /**
     * Object returned by the `useCompositeStore` hook. If not provided, the
     * parent `Composite` component's context will be used.
     */
    store?: CompositeStore;
  };

export type CompositeGroupLabelProps<T extends As = "div"> = Props<
  CompositeGroupLabelOptions<T>
>;
