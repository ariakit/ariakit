import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeGroupLabelOptions,
  useCompositeGroupLabel,
} from "../composite/composite-group-label";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label in a menu group. This hook must be used
 * in a component that's wrapped with `MenuGroup` so the `aria-labelledby`
 * prop is properly set on the menu group element.
 * @see https://ariakit.org/docs/menu
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
 * @see https://ariakit.org/docs/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <MenuButton state={menu}>Recent Items</MenuButton>
 * <Menu state={menu}>
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

export type MenuGroupLabelOptions<T extends As = "div"> = Omit<
  CompositeGroupLabelOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useMenuState` hook.
   */
  state?: MenuState;
};

export type MenuGroupLabelProps<T extends As = "div"> = Props<
  MenuGroupLabelOptions<T>
>;
