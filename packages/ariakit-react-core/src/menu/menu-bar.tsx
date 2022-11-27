import { CompositeOptions, useComposite } from "../composite/composite";
import { useWrapElement } from "../utils/hooks";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { MenuBarStore } from "./menu-bar-store";
import { MenuBarContext } from "./menu-context";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu bar that may contain a group of menu items
 * that control other submenus.
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
    const orientation = store.useState((state) =>
      !composite || state.orientation === "both" ? undefined : state.orientation
    );

    props = useWrapElement(
      props,
      (element) => (
        <MenuBarContext.Provider value={store}>
          {element}
        </MenuBarContext.Provider>
      ),
      [store]
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
  }
);

/**
 * A component that renders a menu bar that may contain a group of menu items
 * that control other submenus.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuBarStore();
 * const fileProps = useMenuItem({ store });
 * const editProps = useMenuItem({ store });
 * const fileMenu = useMenuStore();
 * const editMenu = useMenuStore();
 * <MenuBar store={store}>
 *   <MenuButton {...fileProps} store={fileMenu}>
 *     File
 *   </MenuButton>
 *   <Menu store={fileMenu}>
 *     <MenuItem>New File</MenuItem>
 *     <MenuItem>New Window</MenuItem>
 *   </Menu>
 *   <MenuButton {...editProps} store={editMenu}>
 *     Edit
 *   </MenuButton>
 *   <Menu store={editMenu}>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuBar>
 * ```
 */
export const MenuBar = createComponent<MenuBarOptions>((props) => {
  const htmlProps = useMenuBar(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuBar.displayName = "MenuBar";
}

export type MenuBarOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useMenuBarStore` hook.
   */
  store: MenuBarStore;
};

export type MenuBarProps<T extends As = "div"> = Props<MenuBarOptions<T>>;
