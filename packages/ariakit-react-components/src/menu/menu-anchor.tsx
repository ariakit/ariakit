import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { PopoverAnchorOptions } from "../popover/popover-anchor.tsx";
import { usePopoverAnchor } from "../popover/popover-anchor.tsx";
import { useMenuProviderContext } from "./menu-context.tsx";
import type { MenuStore } from "./menu-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `MenuAnchor` component.
 * @see https://ariakit.com/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuAnchor({ store });
 * <Role {...props}>Anchor</Role>
 * <MenuButton store={store}>Menu</MenuButton>
 * <Menu store={store}>Content</Menu>
 * ```
 */
export const useMenuAnchor = createHook<TagName, MenuAnchorOptions>(
  function useMenuAnchor({ store, ...props }) {
    const context = useMenuProviderContext();
    store = store || context;
    return usePopoverAnchor({ store, ...props });
  },
);

/**
 * Renders an element that acts as the anchor for the
 * [`Menu`](https://ariakit.com/reference/menu) component.
 * @see https://ariakit.com/components/menu
 * @example
 * ```jsx {3}
 * <MenuProvider>
 *   <MenuButton>Menu</MenuButton>
 *   <MenuAnchor>Anchor</MenuAnchor>
 *   <Menu>Content</Menu>
 * </MenuProvider>
 * ```
 */
export const MenuAnchor = forwardRef(function MenuAnchor(
  props: MenuAnchorProps,
) {
  const htmlProps = useMenuAnchor(props);
  return createElement(TagName, htmlProps);
});

export interface MenuAnchorOptions<
  T extends ElementType = TagName,
> extends PopoverAnchorOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.com/reference/use-menu-store) hook. If not
   * provided, the closest
   * [`MenuProvider`](https://ariakit.com/reference/menu-provider) component's
   * context will be used.
   */
  store?: MenuStore;
}

export type MenuAnchorProps<T extends ElementType = TagName> = Props<
  T,
  MenuAnchorOptions<T>
>;
