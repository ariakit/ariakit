import { GroupLabelOptions, useGroupLabel } from "../group/group-label.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Props } from "../utils/types.js";
import { CompositeStore } from "./composite-store.js";

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
  }
);

/**
 * Renders a label in a composite group. This component must be wrapped with
 * `CompositeGroup` so the `aria-labelledby` prop is properly set on the
 * composite group element.
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

export interface CompositeGroupLabelOptions<T extends As = "div">
  extends GroupLabelOptions<T> {
  /**
   * Object returned by the `useCompositeStore` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  store?: CompositeStore;
}

export type CompositeGroupLabelProps<T extends As = "div"> = Props<
  CompositeGroupLabelOptions<T>
>;
