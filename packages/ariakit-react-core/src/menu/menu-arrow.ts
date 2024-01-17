import type { ElementType } from "react";
import type { PopoverArrowOptions } from "../popover/popover-arrow.js";
import { usePopoverArrow } from "../popover/popover-arrow.js";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import { useMenuContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `MenuArrow` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuArrow({ store });
 * <MenuButton store={store}>Menu</MenuButton>
 * <Menu store={store}>
 *   <Role {...props} />
 * </Menu>
 * ```
 */
export const useMenuArrow = createHook2<TagName, MenuArrowOptions>(
  function useMenuArrow({ store, ...props }) {
    const context = useMenuContext();
    store = store || context;
    return usePopoverArrow({ store, ...props });
  },
);

/**
 * Renders an arrow element inside a
 * [`Menu`](https://ariakit.org/reference/menu) component that points to its
 * [`MenuButton`](https://ariakit.org/reference/menu-button).
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4}
 * <MenuProvider>
 *   <MenuButton>Menu</MenuButton>
 *   <Menu>
 *     <MenuArrow />
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuArrow = forwardRef(function MenuArrow(props: MenuArrowProps) {
  const htmlProps = useMenuArrow(props);
  return createElement(TagName, htmlProps);
});

export interface MenuArrowOptions<T extends ElementType = TagName>
  extends PopoverArrowOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuArrowProps<T extends ElementType = TagName> = Props2<
  T,
  MenuArrowOptions<T>
>;
