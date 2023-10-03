import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  ToolbarScopedContextProvider,
  useToolbarProviderContext,
} from "./toolbar-context.js";
import { useToolbarStore } from "./toolbar-store.js";
import type { ToolbarStore, ToolbarStoreProps } from "./toolbar-store.js";

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
export const useToolbar = createHook<ToolbarOptions>(
  ({
    store: storeProp,
    orientation: orientationProp,
    virtualFocus,
    focusLoop,
    rtl,
    ...props
  }) => {
    const context = useToolbarProviderContext();
    storeProp = storeProp || context;

    const store = useToolbarStore({
      store: storeProp,
      orientation: orientationProp,
      virtualFocus,
      focusLoop,
      rtl,
    });

    const orientation = store.useState((state) =>
      state.orientation === "both" ? undefined : state.orientation,
    );

    props = useWrapElement(
      props,
      (element) => (
        <ToolbarScopedContextProvider value={store}>
          {element}
        </ToolbarScopedContextProvider>
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
  },
);

/**
 * Renders a toolbar element that groups interactive elements together.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * <Toolbar>
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
  extends CompositeOptions<T>,
    Pick<
      ToolbarStoreProps,
      "focusLoop" | "orientation" | "rtl" | "virtualFocus"
    > {
  /**
   * Object returned by the
   * [`useToolbarStore`](https://ariakit.org/reference/use-toolbar-store) hook.
   * If not provided, the closest
   * [`ToolbarProvider`](https://ariakit.org/reference/toolbar-provider)
   * component context will be used. If the component is not wrapped in a
   * [`ToolbarProvider`](https://ariakit.org/reference/toolbar-provider)
   * component, an internal store will be used.
   */
  store?: ToolbarStore;
}

export type ToolbarProps<T extends As = "div"> = Props<ToolbarOptions<T>>;
