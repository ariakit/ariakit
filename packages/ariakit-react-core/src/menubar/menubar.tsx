import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { useWrapElement } from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  MenubarScopedContextProvider,
  useMenubarProviderContext,
} from "./menubar-context.js";
import { useMenubarStore } from "./menubar-store.js";
import type { MenubarStore, MenubarStoreProps } from "./menubar-store.js";

/**
 * Returns props to create a `Menubar` component.
 * @see https://ariakit.org/components/menubar
 * @example
 * ```jsx
 * const store = useMenubarStore();
 * const menubarProps = useMenubar({ store });
 * const fileProps = useMenuItem({ store });
 * const fileMenu = useMenuStore();
 * <Role {...menubarProps}>
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
export const useMenubar = createHook2<TagName, MenubarOptions>(
  ({
    store: storeProp,
    composite = true,
    orientation: orientationProp,
    virtualFocus,
    focusLoop,
    rtl,
    ...props
  }) => {
    const context = useMenubarProviderContext();
    storeProp = storeProp || context;

    const store = useMenubarStore({
      store: storeProp,
      orientation: orientationProp,
      virtualFocus,
      focusLoop,
      rtl,
    });

    const orientation = store.useState((state) =>
      !composite || state.orientation === "both"
        ? undefined
        : state.orientation,
    );

    props = useWrapElement(
      props,
      (element) => (
        <MenubarScopedContextProvider value={store}>
          {element}
        </MenubarScopedContextProvider>
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
 * Renders a menubar that may contain a group of
 * [`MenuItem`](https://ariakit.org/reference/menu-item) elements that control
 * other submenus.
 * @see https://ariakit.org/components/menubar
 * @example
 * ```jsx
 * <Menubar>
 *   <MenuProvider>
 *     <MenuItem render={<MenuButton />}>File</MenuItem>
 *     <Menu>
 *       <MenuItem>New File</MenuItem>
 *       <MenuItem>New Window</MenuItem>
 *     </Menu>
 *   </MenuProvider>
 *   <MenuProvider>
 *     <MenuItem render={<MenuButton />}>Edit</MenuItem>
 *     <Menu>
 *       <MenuItem>Undo</MenuItem>
 *       <MenuItem>Redo</MenuItem>
 *     </Menu>
 *   </MenuProvider>
 * </Menubar>
 * ```
 */
export const Menubar = forwardRef(function Menubar(props: MenubarProps) {
  const htmlProps = useMenubar(props);
  return createElement(TagName, htmlProps);
});

export interface MenubarOptions<T extends ElementType = TagName>
  extends CompositeOptions<T>,
    Pick<
      MenubarStoreProps,
      "focusLoop" | "orientation" | "rtl" | "virtualFocus"
    > {
  /**
   * Object returned by the
   * [`useMenubarStore`](https://ariakit.org/reference/use-menubar-store) hook.
   * If not provided, the closest
   * [`MenubarProvider`](https://ariakit.org/reference/menubar-provider)
   * component context will be used. If the component is not wrapped in a
   * [`MenubarProvider`](https://ariakit.org/reference/menubar-provider)
   * component, an internal store will be used.
   */
  store?: MenubarStore;
}

export type MenubarProps<T extends ElementType = TagName> = Props2<
  T,
  MenubarOptions<T>
>;
