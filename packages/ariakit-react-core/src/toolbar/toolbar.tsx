import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { ToolbarContext } from "./toolbar-context.js";
import type { ToolbarStore } from "./toolbar-store.js";

/**
 * Returns props to create a `Toolbar` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbar({ store });
 * <Role {...props}>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Role>
 * ```
 */
export const useToolbar = createHook<ToolbarOptions>(({ store, ...props }) => {
  const orientation = store.useState((state) =>
    state.orientation === "both" ? undefined : state.orientation,
  );

  props = useWrapElement(
    props,
    (element) => (
      <ToolbarContext.Provider value={store}>{element}</ToolbarContext.Provider>
    ),
    [store],
  );

  props = {
    role: "toolbar",
    "aria-orientation": orientation,
    ...props,
  };

  props = useComposite({ store, ...props });

  return props;
});

/**
 * Renders a toolbar element that groups interactive elements together.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarStore();
 * <Toolbar store={toolbar}>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Toolbar>
 * ```
 */
export const Toolbar = createComponent<ToolbarOptions>((props) => {
  const htmlProps = useToolbar(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Toolbar.displayName = "Toolbar";
}

export interface ToolbarOptions<T extends As = "div">
  extends CompositeOptions<T> {
  /**
   * Object returned by the `useToolbarStore` hook.
   */
  store: ToolbarStore;
}

export type ToolbarProps<T extends As = "div"> = Props<ToolbarOptions<T>>;
