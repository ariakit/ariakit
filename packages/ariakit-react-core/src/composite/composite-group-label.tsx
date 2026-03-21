import type { ElementType } from "react";
import type { GroupLabelOptions } from "../group/group-label.tsx";
import { useGroupLabel } from "../group/group-label.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { CompositeStore } from "./composite-store.ts";

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
export const useCompositeGroupLabel = createHook<
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

export interface CompositeGroupLabelOptions<
  T extends ElementType = TagName,
> extends GroupLabelOptions<T> {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook.
   * This prop can also receive the corresponding
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * component, which makes the component read the store from that provider's
   * context explicitly, or `null`, which disables context lookup.
   * If not provided, the closest
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * component's context will be used.
   */
  store?: StoreProp<CompositeStore>;
}

export type CompositeGroupLabelProps<T extends ElementType = TagName> = Props<
  T,
  CompositeGroupLabelOptions<T>
>;
