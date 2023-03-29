import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { SeparatorOptions } from "../separator/separator.js";
import { useSeparator } from "../separator/separator.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { CompositeContext } from "./composite-context.js";
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
    const context = useContext(CompositeContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "CompositeSeparator must be wrapped in a Composite component"
    );

    const orientation = store.useState((state) =>
      state.orientation === "horizontal" ? "vertical" : "horizontal"
    );

    props = useSeparator({ ...props, orientation });

    return props;
  }
);

/**
 * Renders a separator for composite items.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeSeparator />
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export const CompositeSeparator = createComponent<CompositeSeparatorOptions>(
  (props) => {
    const htmlProps = useCompositeSeparator(props);
    return createElement("hr", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  CompositeSeparator.displayName = "CompositeSeparator";
}

export interface CompositeSeparatorOptions<T extends As = "hr">
  extends SeparatorOptions<T> {
  /**
   * Object returned by the `useCompositeStore` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  store?: CompositeStore;
}

export type CompositeSeparatorProps<T extends As = "hr"> = Props<
  CompositeSeparatorOptions<T>
>;
