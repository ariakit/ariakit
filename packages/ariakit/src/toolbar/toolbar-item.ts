import { createMemoComponent } from "ariakit-react-utils/store";
import { createElement, createHook } from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { ToolbarState } from "./toolbar-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an interactive element in a toolbar.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const state = useToolbarState();
 * const props = useToolbarItem({ state });
 * <Toolbar state={state}>
 *   <Role {...props}>Item</Role>
 * </Toolbar>
 * ```
 */
export const useToolbarItem = createHook<ToolbarItemOptions>(
  ({ state, ...props }) => {
    props = useCompositeItem({ state, ...props });
    return props;
  }
);

/**
 * A component that renders an interactive element in a toolbar.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarState();
 * <Toolbar state={toolbar}>
 *   <ToolbarItem>Item</ToolbarItem>
 * </Toolbar>
 * ```
 */
export const ToolbarItem = createMemoComponent<ToolbarItemOptions>((props) => {
  const htmlProps = useToolbarItem(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  ToolbarItem.displayName = "ToolbarItem";
}

export type ToolbarItemOptions<T extends As = "button"> = Omit<
  CompositeItemOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useToolbarState` hook. If not provided, the parent
   * `Toolbar` component's context will be used.
   */
  state?: ToolbarState;
};

export type ToolbarItemProps<T extends As = "button"> = Props<
  ToolbarItemOptions<T>
>;
