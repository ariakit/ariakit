import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import type { SeparatorOptions } from "../separator/separator.tsx";
import { useSeparator } from "../separator/separator.tsx";
import { useStoreState } from "../utils/store.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useCompositeContextStore } from "./composite-context.tsx";
import type { CompositeStore } from "./composite-store.ts";

const TagName = "hr" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `CompositeSeparator` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeSeparator({ store });
 * <Composite store={store}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <Role {...props} />
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export const useCompositeSeparator = createHook<
  TagName,
  CompositeSeparatorOptions
>(function useCompositeSeparator({ store, ...props }) {
  store = useCompositeContextStore(store, "CompositeSeparator");

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "CompositeSeparator must be wrapped in a Composite component.",
  );

  const orientation = useStoreState(store, (state) =>
    state.orientation === "horizontal" ? "vertical" : "horizontal",
  );

  props = useSeparator({ ...props, orientation });

  return props;
});

/**
 * Renders a divider between
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) elements.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {4}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeSeparator />
 *     <CompositeItem>Item 2</CompositeItem>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export const CompositeSeparator = forwardRef(function CompositeSeparator(
  props: CompositeSeparatorProps,
) {
  const htmlProps = useCompositeSeparator(props);
  return createElement(TagName, htmlProps);
});

export interface CompositeSeparatorOptions<
  T extends ElementType = TagName,
> extends SeparatorOptions<T> {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook.
   * This prop can also receive the corresponding
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * component, which makes the component read the store from that provider's
   * context explicitly.
   * If not provided, the closest
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * component's context will be used.
   */
  store?: StoreProp<CompositeStore>;
  /**
   * The orientation of the separator. By default, this is the opposite of the
   * [`orientation`](https://ariakit.org/reference/composite-provider#orientation)
   * state of the composite widget. Which means it doesn't need to be explicitly
   * set in most cases.
   */
  orientation?: SeparatorOptions<T>["orientation"];
}

export type CompositeSeparatorProps<T extends ElementType = TagName> = Props<
  T,
  CompositeSeparatorOptions<T>
>;
