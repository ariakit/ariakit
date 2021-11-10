import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { SeparatorOptions, useSeparator } from "../separator/separator";
import { CompositeContext } from "./__utils";
import { CompositeState } from "./composite-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a separator for composite items.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeSeparator({ state });
 * <Composite state={state}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <Role {...props} />
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export const useCompositeSeparator = createHook<CompositeSeparatorOptions>(
  ({ state, ...props }) => {
    state = useStore(state || CompositeContext, ["orientation"]);

    const orientation =
      state?.orientation === "horizontal" ? "vertical" : "horizontal";

    props = useSeparator({ ...props, orientation });

    return props;
  }
);

/**
 * A component that renders a separator for composite items.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite}>
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

export type CompositeSeparatorOptions<T extends As = "hr"> =
  SeparatorOptions<T> & {
    /**
     * Object returned by the `useCompositeState` hook. If not provided, the
     * parent `Composite` component's context will be used.
     */
    state?: CompositeState;
  };

export type CompositeSeparatorProps<T extends As = "hr"> = Props<
  CompositeSeparatorOptions<T>
>;
