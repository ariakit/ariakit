import { useMemo } from "react";
import type { ElementType } from "react";
import { invariant, removeUndefinedValues } from "@ariakit/core/utils/misc";
import { useId, useWrapElement } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import {
  CompositeRowContext,
  useCompositeContext,
} from "./composite-context.js";
import type { CompositeStore } from "./composite-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useCompositeRow = createHook<TagName, CompositeRowOptions>(
  function useCompositeRow({
    store,
    "aria-setsize": ariaSetSize,
    "aria-posinset": ariaPosInSet,
    ...props
  }) {
    const context = useCompositeContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "CompositeRow must be wrapped in a Composite component.",
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

    return removeUndefinedValues(props);
  },
);

/**
 * Renders a row element for composite items that allows two-dimensional arrow
 * key navigation.
 * [`CompositeItem`](https://ariakit.org/reference/composite-item) elements
 * wrapped within this component will automatically receive a
 * [`rowId`](https://ariakit.org/reference/composite-item#rowid) prop.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx {3-12}
 * <CompositeProvider>
 *   <Composite>
 *     <CompositeRow>
 *       <CompositeItem>Item 1.1</CompositeItem>
 *       <CompositeItem>Item 1.2</CompositeItem>
 *       <CompositeItem>Item 1.3</CompositeItem>
 *     </CompositeRow>
 *     <CompositeRow>
 *       <CompositeItem>Item 2.1</CompositeItem>
 *       <CompositeItem>Item 2.2</CompositeItem>
 *       <CompositeItem>Item 2.3</CompositeItem>
 *     </CompositeRow>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export const CompositeRow = forwardRef(function CompositeRow(
  props: CompositeRowProps,
) {
  const htmlProps = useCompositeRow(props);
  return createElement(TagName, htmlProps);
});

export interface CompositeRowOptions<_T extends ElementType = TagName>
  extends Options {
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

export type CompositeRowProps<T extends ElementType = TagName> = Props<
  T,
  CompositeRowOptions<T>
>;
