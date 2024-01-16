import type { CompositeInputOptions } from "../composite/composite-input.js";
import { useCompositeInput } from "../composite/composite-input.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import { useToolbarContext } from "./toolbar-context.js";
import type { ToolbarItemOptions } from "./toolbar-item.js";
import { useToolbarItem } from "./toolbar-item.js";

/**
 * Returns props to create a `ToolbarInput` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarInput({ store });
 * <Toolbar store={store}>
 *   <Role {...props} />
 * </Toolbar>
 * ```
 */
export const useToolbarInput = createHook2<TagName, ToolbarInputOptions>(
  function useToolbarInput({ store, ...props }) {
    const context = useToolbarContext();
    store = store || context;
    props = useCompositeInput({ store, ...props });
    props = useToolbarItem({ store, ...props });
    return props;
  },
);

/**
 * Renders a text input as a toolbar item, maintaining arrow key navigation on
 * the toolbar.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx {2}
 * <Toolbar>
 *   <ToolbarInput />
 * </Toolbar>
 * ```
 */
export const ToolbarInput = createMemoComponent<ToolbarInputOptions>(
  (props) => {
    const htmlProps = useToolbarInput(props);
    return createElement(TagName, htmlProps);
  },
);

export interface ToolbarInputOptions<T extends ElementType = TagName>
  extends ToolbarItemOptions<T>,
    Omit<CompositeInputOptions<T>, "store"> {}

export type ToolbarInputProps<T extends ElementType = TagName> = Props2<
  T,
  ToolbarInputOptions<T>
>;
