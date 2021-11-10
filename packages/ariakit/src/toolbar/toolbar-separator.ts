import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeSeparatorOptions,
  useCompositeSeparator,
} from "../composite/composite-separator";
import { ToolbarState } from "./toolbar-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a separator for toolbar items.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const state = useToolbarState();
 * const props = useToolbarSeparator({ state });
 * <Toolbar state={state}>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <Role {...props} />
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Toolbar>
 * ```
 */
export const useToolbarSeparator = createHook<ToolbarSeparatorOptions>(
  (props) => {
    props = useCompositeSeparator(props);
    return props;
  }
);

/**
 * A component that renders a separator for toolbar items.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarState();
 * <Toolbar state={toolbar}>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarSeparator />
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Toolbar>
 * ```
 */
export const ToolbarSeparator = createComponent<ToolbarSeparatorOptions>(
  (props) => {
    const htmlProps = useToolbarSeparator(props);
    return createElement("hr", htmlProps);
  }
);

export type ToolbarSeparatorOptions<T extends As = "hr"> = Omit<
  CompositeSeparatorOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useToolbarState` hook. If not provided, the parent
   * `Toolbar` component's context will be used.
   */
  state?: ToolbarState;
};

export type ToolbarSeparatorProps<T extends As = "hr"> = Props<
  ToolbarSeparatorOptions<T>
>;
