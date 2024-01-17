import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.js";
import { useCompositeSeparator } from "../composite/composite-separator.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useToolbarContext } from "./toolbar-context.js";
import type { ToolbarStore } from "./toolbar-store.js";

const TagName = "hr" satisfies ElementType;
type TagName = typeof TagName;

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
export const useToolbarSeparator = createHook<TagName, ToolbarSeparatorOptions>(
  function useToolbarSeparator({ store, ...props }) {
    const context = useToolbarContext();
    store = store || context;
    props = useCompositeSeparator({ store, ...props });
    return props;
  },
);

/**
 * Renders a divider between
 * [`ToolbarItem`](https://ariakit.org/reference/toolbar-item) elements.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx {3}
 * <Toolbar>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarSeparator />
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Toolbar>
 * ```
 */
export const ToolbarSeparator = forwardRef(function ToolbarSeparator(
  props: ToolbarSeparatorProps,
) {
  const htmlProps = useToolbarSeparator(props);
  return createElement(TagName, htmlProps);
});

export interface ToolbarSeparatorOptions<T extends ElementType = TagName>
  extends CompositeSeparatorOptions<T> {
  /**
   * Object returned by the
   * [`useToolbarStore`](https://ariakit.org/reference/use-toolbar-store) hook.
   * If not provided, the closest
   * [`Toolbar`](https://ariakit.org/reference/toolbar) component's context will
   * be used.
   */
  store?: ToolbarStore;
}

export type ToolbarSeparatorProps<T extends ElementType = TagName> = Props<
  T,
  ToolbarSeparatorOptions<T>
>;
