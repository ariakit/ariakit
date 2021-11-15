import { useContext, useMemo, useRef } from "react";
import { useForkRef, useId, useWrapElement } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { CompositeContext, CompositeRowContext } from "./__utils";
import { CompositeState } from "./composite-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a composite row. Wrapping `CompositeItem`
 * elements within rows will create a two-dimensional composite widget, such as
 * a grid.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeRow({ state });
 * <Composite state={state}>
 *   <Role {...props}>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeItem>Item 2</CompositeItem>
 *     <CompositeItem>Item 3</CompositeItem>
 *   </Role>
 * </Composite>
 * ```
 */
export const useCompositeRow = createHook<CompositeRowOptions>(
  ({ state, ...props }) => {
    const context = useContext(CompositeContext);
    state = state || context;
    const ref = useRef<HTMLDivElement>(null);
    const id = useId(props.id);

    const providerValue = useMemo(
      () => ({ id, baseRef: state?.baseRef }),
      [id, state?.baseRef]
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

    props = {
      id,
      ...props,
      ref: useForkRef(ref, props.ref),
    };

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
 * const composite = useCompositeState();
 * <Composite state={composite}>
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

export type CompositeRowOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCompositeState` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  state?: CompositeState;
};

export type CompositeRowProps<T extends As = "div"> = Props<
  CompositeRowOptions<T>
>;
