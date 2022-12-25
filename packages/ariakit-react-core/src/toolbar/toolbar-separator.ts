import {
  CompositeSeparatorOptions,
  useCompositeSeparator,
} from "../composite/composite-separator";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { ToolbarStore } from "./toolbar-store";

/**
 * Returns props to create a `ToolbarSeparator` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarSeparator({ store });
 * <Toolbar store={store}>
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
 * Renders a separator for toolbar items.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarStore();
 * <Toolbar store={toolbar}>
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

if (process.env.NODE_ENV !== "production") {
  ToolbarSeparator.displayName = "ToolbarSeparator";
}

export interface ToolbarSeparatorOptions<T extends As = "hr">
  extends CompositeSeparatorOptions<T> {
  /**
   * Object returned by the `useToolbarStore` hook. If not provided, the parent
   * `Toolbar` component's context will be used.
   */
  store?: ToolbarStore;
}

export type ToolbarSeparatorProps<T extends As = "hr"> = Props<
  ToolbarSeparatorOptions<T>
>;
