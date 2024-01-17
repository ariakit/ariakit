import type { ElementType } from "react";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useToolbarContext } from "./toolbar-context.js";
import type { ToolbarStore } from "./toolbar-store.js";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;

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
export const useToolbarItem = createHook<TagName, ToolbarItemOptions>(
  function useToolbarItem({ store, ...props }) {
    const context = useToolbarContext();
    store = store || context;
    props = useCompositeItem({ store, ...props });
    return props;
  },
);

/**
 * Renders an interactive element inside a
 * [`Toolbar`](https://ariakit.org/reference/toolbar).
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx {2}
 * <Toolbar>
 *   <ToolbarItem>Item</ToolbarItem>
 * </Toolbar>
 * ```
 */
export const ToolbarItem = memo(
  forwardRef(function ToolbarItem(props: ToolbarItemProps) {
    const htmlProps = useToolbarItem(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface ToolbarItemOptions<T extends ElementType = TagName>
  extends CompositeItemOptions<T> {
  /**
   * Object returned by the
   * [`useToolbarStore`](https://ariakit.org/reference/use-toolbar-store) hook.
   * If not provided, the closest
   * [`Toolbar`](https://ariakit.org/reference/toolbar) component's context will
   * be used.
   */
  store?: ToolbarStore;
}

export type ToolbarItemProps<T extends ElementType = TagName> = Props<
  T,
  ToolbarItemOptions<T>
>;
