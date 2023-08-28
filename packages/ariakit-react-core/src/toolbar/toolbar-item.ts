import { useContext } from "react";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { ToolbarContext } from "./toolbar-context.js";
import type { ToolbarStore } from "./toolbar-store.js";

/**
 * Returns props to create a `ToolbarItem` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarItem({ store });
 * <Toolbar store={store}>
 *   <Role {...props}>Item</Role>
 * </Toolbar>
 * ```
 */
export const useToolbarItem = createHook<ToolbarItemOptions>(
  ({ store, ...props }) => {
    // TODO: Do this for all components that may not use the store directly.
    const context = useContext(ToolbarContext);
    store = store || context;
    props = useCompositeItem({ store, ...props });
    return props;
  },
);

/**
 * Renders an interactive element in a toolbar.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarStore();
 * <Toolbar store={toolbar}>
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

export interface ToolbarItemOptions<T extends As = "button">
  extends CompositeItemOptions<T> {
  /**
   * Object returned by the `useToolbarStore` hook. If not provided, the parent
   * `Toolbar` component's context will be used.
   */
  store?: ToolbarStore;
}

export type ToolbarItemProps<T extends As = "button"> = Props<
  ToolbarItemOptions<T>
>;
