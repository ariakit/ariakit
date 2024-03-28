import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import { useWrapElement } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  ToolbarScopedContextProvider,
  useToolbarProviderContext,
} from "./toolbar-context.tsx";
import { useToolbarStore } from "./toolbar-store.ts";
import type { ToolbarStore, ToolbarStoreProps } from "./toolbar-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useToolbar = createHook<TagName, ToolbarOptions>(
  function useToolbar({
    store: storeProp,
    orientation: orientationProp,
    virtualFocus,
    focusLoop,
    rtl,
    ...props
  }) {
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
export const Toolbar = forwardRef(function Toolbar(props: ToolbarProps) {
  const htmlProps = useToolbar(props);
  return createElement(TagName, htmlProps);
});

export interface ToolbarOptions<T extends ElementType = TagName>
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

export type ToolbarProps<T extends ElementType = TagName> = Props<
  T,
  ToolbarOptions<T>
>;
