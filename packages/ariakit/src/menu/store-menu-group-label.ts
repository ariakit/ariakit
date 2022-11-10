import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  CompositeGroupLabelOptions,
  useCompositeGroupLabel,
} from "../composite/store-composite-group-label";
import { MenuStore } from "./store-menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label in a menu group. This hook must be used
 * in a component that's wrapped with `MenuGroup` so the `aria-labelledby`
 * prop is properly set on the menu group element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * // This component must be wrapped with MenuGroup
 * const props = useMenuGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useMenuGroupLabel = createHook<MenuGroupLabelOptions>((props) => {
  props = useCompositeGroupLabel(props);
  return props;
});

/**
 * A component that renders a label in a menu group. This component must be
 * wrapped with `MenuGroup` so the `aria-labelledby` prop is properly set
 * on the menu group element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <MenuButton store={menu}>Recent Items</MenuButton>
 * <Menu store={menu}>
 *   <MenuGroup>
 *     <MenuGroupLabel>Applications</MenuGroupLabel>
 *     <MenuItem>Google Chrome.app</MenuItem>
 *     <MenuItem>Safari.app</MenuItem>
 *   </MenuGroup>
 * </Menu>
 * ```
 */
export const MenuGroupLabel = createComponent<MenuGroupLabelOptions>(
  (props) => {
    const htmlProps = useMenuGroupLabel(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  MenuGroupLabel.displayName = "MenuGroupLabel";
}

export type MenuGroupLabelOptions<T extends As = "div"> = Omit<
  CompositeGroupLabelOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useMenuStore` hook.
   */
  store?: MenuStore;
};

export type MenuGroupLabelProps<T extends As = "div"> = Props<
  MenuGroupLabelOptions<T>
>;
