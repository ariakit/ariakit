import { invariant } from "@ariakit/core/utils/misc";
import type { SeparatorOptions } from "../separator/separator.js";
import { useSeparator } from "../separator/separator.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useCompositeContext } from "./composite-context.js";
import type { CompositeStore } from "./composite-store.js";

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
export const useCompositeSeparator = createHook<CompositeSeparatorOptions>(
  ({ store, ...props }) => {
    const context = useCompositeContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "CompositeSeparator must be wrapped in a Composite component.",
    );

    const orientation = store.useState((state) =>
      state.orientation === "horizontal" ? "vertical" : "horizontal",
    );

    props = useSeparator({ ...props, orientation });

    return props;
  },
);

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
export const CompositeSeparator = createComponent<CompositeSeparatorOptions>(
  (props) => {
    const htmlProps = useCompositeSeparator(props);
    return createElement("hr", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  CompositeSeparator.displayName = "CompositeSeparator";
}

export interface CompositeSeparatorOptions<T extends As = "hr">
  extends SeparatorOptions<T> {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook. If not provided, the closest
   * [`Composite`](https://ariakit.org/reference/composite) or
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * components' context will be used.
   */
  store?: CompositeStore;
  /**
   * The orientation of the separator. By default, this is the opposite of the
   * [`orientation`](https://ariakit.org/reference/composite-provider#orientation)
   * state of the composite widget. Which means it doesn't need to be explicitly
   * set in most cases.
   */
  orientation?: SeparatorOptions<T>["orientation"];
}

export type CompositeSeparatorProps<T extends As = "hr"> = Props<
  CompositeSeparatorOptions<T>
>;
