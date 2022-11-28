import { CompositeOptions, useComposite } from "../composite/composite";
import { useWrapElement } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { ToolbarContext } from "./toolbar-context";
import { ToolbarStore } from "./toolbar-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a toolbar element that groups interactive
 * elements together.
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
    state.orientation === "both" ? undefined : state.orientation
  );

  props = useWrapElement(
    props,
    (element) => (
      <ToolbarContext.Provider value={store}>{element}</ToolbarContext.Provider>
    ),
    [store]
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
 * A component that renders a toolbar element that groups interactive elements
 * together.
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

export type ToolbarOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useToolbarStore` hook.
   */
  store: ToolbarStore;
};

export type ToolbarProps<T extends As = "div"> = Props<ToolbarOptions<T>>;
