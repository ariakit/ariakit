import type { PopoverDisclosureArrowOptions } from "../popover/popover-disclosure-arrow.js";
import { usePopoverDisclosureArrow } from "../popover/popover-disclosure-arrow.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useMenuContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuButtonArrow` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuButtonArrow({ store });
 * <MenuButton store={store}>
 *   Edit
 *   <Role {...props} />
 * </MenuButton>
 * <Menu store={store}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuButtonArrow = createHook2<TagName, MenuButtonArrowOptions>(
  ({ store, ...props }) => {
    const context = useMenuContext();
    store = store || context;
    props = usePopoverDisclosureArrow({ store, ...props });
    return props;
  },
);

/**
 * Displays an arrow within a
 * [`MenuButton`](https://ariakit.org/reference/menu-button), pointing to the
 * [`Menu`](https://ariakit.org/reference/menu) position. It's typically based
 * on the [`placement`](https://ariakit.org/reference/menu-provider#placement)
 * state from the menu store, but this can be overridden with the
 * [`placement`](https://ariakit.org/reference/menu-button-arrow#placement)
 * prop.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4}
 * <MenuProvider placement="bottom-start">
 *   <MenuButton>
 *     Edit
 *     <MenuButtonArrow />
 *   </MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuButtonArrow = forwardRef(function MenuButtonArrow(
  props: MenuButtonArrowProps,
) {
  const htmlProps = useMenuButtonArrow(props);
  return createElement("span", htmlProps);
});

export interface MenuButtonArrowOptions<T extends As = "span">
  extends PopoverDisclosureArrowOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest
   * [`MenuButton`](https://ariakit.org/reference/menu-button) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuButtonArrowProps<T extends As = "span"> = Props<
  MenuButtonArrowOptions<T>
>;
