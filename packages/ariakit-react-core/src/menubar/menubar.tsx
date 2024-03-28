import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import { useWrapElement } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  MenubarScopedContextProvider,
  useMenubarProviderContext,
} from "./menubar-context.ts";
import { useMenubarStore } from "./menubar-store.ts";
import type { MenubarStore, MenubarStoreProps } from "./menubar-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useMenubar = createHook<TagName, MenubarOptions>(
  function useMenubar({
    store: storeProp,
    composite = true,
    orientation: orientationProp,
    virtualFocus,
    focusLoop,
    rtl,
    ...props
  }) {
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

export type MenubarProps<T extends ElementType = TagName> = Props<
  T,
  MenubarOptions<T>
>;
