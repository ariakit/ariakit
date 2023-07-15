import type { CompositeInputOptions } from "../composite/composite-input.js";
import { useCompositeInput } from "../composite/composite-input.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
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
export const useToolbarInput = createHook<ToolbarInputOptions>(
  ({ store, ...props }) => {
    props = useCompositeInput({ store, ...props });
    props = useToolbarItem({ store, ...props });
    return props;
  },
);

/**
 * Renders an input as a toolbar item.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarStore();
 * <Toolbar store={toolbar}>
 *   <ToolbarInput />
 * </Toolbar>
 * ```
 */
export const ToolbarInput = createMemoComponent<ToolbarInputOptions>(
  (props) => {
    const htmlProps = useToolbarInput(props);
    return createElement("input", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  ToolbarInput.displayName = "ToolbarInput";
}

export interface ToolbarInputOptions<T extends As = "input">
  extends ToolbarItemOptions<T>,
    CompositeInputOptions<T> {}

export type ToolbarInputProps<T extends As = "input"> = Props<
  ToolbarInputOptions<T>
>;
