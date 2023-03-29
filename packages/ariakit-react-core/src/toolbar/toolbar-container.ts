import type { CompositeContainerOptions } from "../composite/composite-container.js";
import { useCompositeContainer } from "../composite/composite-container.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { ToolbarItemOptions } from "./toolbar-item.js";
import { useToolbarItem } from "./toolbar-item.js";

/**
 * Returns props to create a `ToolbarContainer` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarContainer({ store });
 * <Toolbar store={store}>
 *   <Role {...props}>
 *     <input type="text" />
 *   </Role>
 * </Toolbar>
 * ```
 */
export const useToolbarContainer = createHook<ToolbarContainerOptions>(
  ({ store, ...props }) => {
    props = useCompositeContainer({ store, ...props });
    props = useToolbarItem({ store, ...props });
    return props;
  }
);

/**
 * Renders a container for interactive widgets inside toolbar items.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarStore();
 * <Toolbar store={toolbar}>
 *   <ToolbarContainer>
 *     <input type="text" />
 *   </ToolbarContainer>
 * </Toolbar>
 * ```
 */
export const ToolbarContainer = createMemoComponent<ToolbarContainerOptions>(
  (props) => {
    const htmlProps = useToolbarContainer(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  ToolbarContainer.displayName = "ToolbarContainer";
}

export interface ToolbarContainerOptions<T extends As = "div">
  extends ToolbarItemOptions<T>,
    CompositeContainerOptions<T> {}

export type ToolbarContainerProps<T extends As = "div"> = Props<
  ToolbarContainerOptions<T>
>;
