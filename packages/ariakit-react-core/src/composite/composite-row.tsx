import { useContext, useMemo } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { useId, useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { CompositeContext, CompositeRowContext } from "./composite-context.js";
import type { CompositeStore } from "./composite-store.js";

/**
 * Returns props to create a `CompositeRow` component. Wrapping `CompositeItem`
 * elements within rows will create a two-dimensional composite widget, such as
 * a grid.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeRow({ store });
 * <Composite store={store}>
 *   <Role {...props}>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeItem>Item 2</CompositeItem>
 *     <CompositeItem>Item 3</CompositeItem>
 *   </Role>
 * </Composite>
 * ```
 */
export const useCompositeRow = createHook<CompositeRowOptions>(
  ({
    store,
    "aria-setsize": ariaSetSize,
    "aria-posinset": ariaPosInSet,
    ...props
  }) => {
    const context = useContext(CompositeContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "CompositeRow must be wrapped in a Composite component",
    );

    const id = useId(props.id);

    const baseElement = store.useState(
      (state) => state.baseElement || undefined,
    );

    const providerValue = useMemo(
      () => ({ id, baseElement, ariaSetSize, ariaPosInSet }),
      [id, baseElement, ariaSetSize, ariaPosInSet],
    );

    props = useWrapElement(
      props,
      (element) => (
        <CompositeRowContext.Provider value={providerValue}>
          {element}
        </CompositeRowContext.Provider>
      ),
      [providerValue],
    );

    props = { id, ...props };

    return props;
  },
);

/**
 * Renders a composite row. Wrapping `CompositeItem` elements within
 * `CompositeRow` will create a two-dimensional composite widget, such as a
 * grid.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite}>
 *   <CompositeRow>
 *     <CompositeItem>Item 1.1</CompositeItem>
 *     <CompositeItem>Item 1.2</CompositeItem>
 *     <CompositeItem>Item 1.3</CompositeItem>
 *   </CompositeRow>
 *   <CompositeRow>
 *     <CompositeItem>Item 2.1</CompositeItem>
 *     <CompositeItem>Item 2.2</CompositeItem>
 *     <CompositeItem>Item 2.3</CompositeItem>
 *   </CompositeRow>
 * </Composite>
 * ```
 */
export const CompositeRow = createComponent<CompositeRowOptions>((props) => {
  const htmlProps = useCompositeRow(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  CompositeRow.displayName = "CompositeRow";
}

export interface CompositeRowOptions<T extends As = "div"> extends Options<T> {
  /**
   * Object returned by the `useCompositeStore` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  store?: CompositeStore;
}

export type CompositeRowProps<T extends As = "div"> = Props<
  CompositeRowOptions<T>
>;
