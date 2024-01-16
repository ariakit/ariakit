import type { CompositeContainerOptions } from "../composite/composite-container.js";
import { useCompositeContainer } from "../composite/composite-container.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useToolbarContext } from "./toolbar-context.js";
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
export const useToolbarContainer = createHook2<
  TagName,
  ToolbarContainerOptions
>(({ store, ...props }) => {
  const context = useToolbarContext();
  store = store || context;
  props = useCompositeContainer({ store, ...props });
  props = useToolbarItem({ store, ...props });
  return props;
});

/**
 * Renders a toolbar item that may contain interactive widgets inside.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx {2-4}
 * <Toolbar>
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
  },
);

export interface ToolbarContainerOptions<T extends As = "div">
  extends ToolbarItemOptions<T>,
    Omit<CompositeContainerOptions<T>, "store"> {}

export type ToolbarContainerProps<T extends As = "div"> = Props<
  ToolbarContainerOptions<T>
>;
