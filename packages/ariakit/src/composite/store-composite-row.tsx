import { useContext, useMemo } from "react";
import { useId, useWrapElement } from "ariakit-react-utils/hooks";
import { useStoreState } from "ariakit-react-utils/store2";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import { CompositeContext, CompositeRowContext } from "./__store-utils";
import { CompositeStore } from "./store-composite-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a composite row. Wrapping `CompositeItem`
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
  ({ store, ...props }) => {
    const context = useContext(CompositeContext);
    store = store || context;
    const id = useId(props.id);

    const baseElement = useStoreState(
      store,
      (state) => state.baseElement || undefined
    );

    const providerValue = useMemo(
      () => ({ id, baseElement }),
      [id, baseElement]
    );

    props = useWrapElement(
      props,
      (element) => (
        <CompositeRowContext.Provider value={providerValue}>
          {element}
        </CompositeRowContext.Provider>
      ),
      [providerValue]
    );

    props = { id, ...props };

    return props;
  }
);

/**
 * A component that renders a composite row. Wrapping `CompositeItem` elements
 * within `CompositeRow` will create a two-dimensional composite widget, such
 * as a grid.
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

export type CompositeRowOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCompositeStore` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  store?: CompositeStore;
};

export type CompositeRowProps<T extends As = "div"> = Props<
  CompositeRowOptions<T>
>;
