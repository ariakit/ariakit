import type { ElementType } from "react";
import type { PopoverArrowOptions } from "../popover/popover-arrow.tsx";
import { usePopoverArrow } from "../popover/popover-arrow.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useMenuContextStore } from "./menu-context.tsx";
import type { MenuStore } from "./menu-store.ts";

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
export const useMenuArrow = createHook<TagName, MenuArrowOptions>(
  function useMenuArrow({ store, ...props }) {
    store = useMenuContextStore(store, "MenuArrow");
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

export interface MenuArrowOptions<
  T extends ElementType = TagName,
> extends PopoverArrowOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook.
   * This prop can also receive the corresponding
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) component,
   * which makes the component read the store from that provider's context
   * explicitly, or `null`, which disables context lookup.
   * If not provided, the closest
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider)
   * component's context will be used.
   */
  store?: StoreProp<MenuStore>;
}

export type MenuArrowProps<T extends ElementType = TagName> = Props<
  T,
  MenuArrowOptions<T>
>;
