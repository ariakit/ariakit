import {
  CompositeInputOptions,
  useCompositeInput,
} from "../composite/composite-input";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system";
import { As, Props } from "../utils/types";
import { ToolbarItemOptions, useToolbarItem } from "./toolbar-item";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an input as a toolbar item.
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
  }
);

/**
 * A component that renders an input as a toolbar item.
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
  }
);

if (process.env.NODE_ENV !== "production") {
  ToolbarInput.displayName = "ToolbarInput";
}

export type ToolbarInputOptions<T extends As = "input"> = Omit<
  CompositeInputOptions<T>,
  "store"
> &
  ToolbarItemOptions<T>;

export type ToolbarInputProps<T extends As = "input"> = Props<
  ToolbarInputOptions<T>
>;
