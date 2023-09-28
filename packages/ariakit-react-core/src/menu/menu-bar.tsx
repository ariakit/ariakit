import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { MenuBarStore } from "./menu-bar-store.js";
import {
  MenuBarScopedContextProvider,
  useMenuBarProviderContext,
} from "./menu-context.js";

/**
 * Returns props to create a `MenuBar` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuBarStore();
 * const menuBarProps = useMenuBar({ store });
 * const fileProps = useMenuItem({ store });
 * const fileMenu = useMenuStore();
 * <Role {...menuBarProps}>
 *   <MenuButton {...fileProps} store={fileMenu}>
 *     File
 *   </MenuButton>
 *   <Menu store={fileMenu}>
 *     <MenuItem>New File</MenuItem>
 *     <MenuItem>New Window</MenuItem>
 *   </Menu>
 * </Role>
 * ```
 */
export const useMenuBar = createHook<MenuBarOptions>(
  ({ store, composite = true, ...props }) => {
    const context = useMenuBarProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuBar must receive a `store` prop or be wrapped in a MenuBarProvider component.",
    );

    const orientation = store.useState((state) =>
      !composite || state.orientation === "both"
        ? undefined
        : state.orientation,
    );

    props = useWrapElement(
      props,
      (element) => (
        <MenuBarScopedContextProvider value={store}>
          {element}
        </MenuBarScopedContextProvider>
      ),
      [store],
    );

    if (composite) {
      props = {
        role: "menubar",
        "aria-orientation": orientation,
        ...props,
      };
    }

    props = useComposite({ store, composite, ...props });

    return props;
  },
);

/**
 * Renders a menu bar that may contain a group of menu items that control other
 * submenus.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuBarProvider>
 *   <MenuBar>
 *     <MenuProvider>
 *       <MenuItem render={<MenuButton />}>File</MenuItem>
 *       <Menu>
 *         <MenuItem>New File</MenuItem>
 *         <MenuItem>New Window</MenuItem>
 *       </Menu>
 *     </MenuProvider>
 *     <MenuProvider>
 *       <MenuItem render={<MenuButton />}>Edit</MenuItem>
 *       <Menu>
 *         <MenuItem>Undo</MenuItem>
 *         <MenuItem>Redo</MenuItem>
 *       </Menu>
 *     </MenuProvider>
 *   </MenuBar>
 * </MenuBarProvider>
 * ```
 */
export const MenuBar = createComponent<MenuBarOptions>((props) => {
  const htmlProps = useMenuBar(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuBar.displayName = "MenuBar";
}

export interface MenuBarOptions<T extends As = "div">
  extends CompositeOptions<T> {
  /**
   * Object returned by the
   * [`useMenuBarStore`](https://ariakit.org/reference/use-menu-bar-store) hook.
   * If not provided, the closest
   * [`MenuBarProvider`](https://ariakit.org/reference/menu-bar-provider)
   * component's context will be used.
   */
  store?: MenuBarStore;
}

export type MenuBarProps<T extends As = "div"> = Props<MenuBarOptions<T>>;
