import { useContext } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  CheckboxCheckOptions,
  useCheckboxCheck,
} from "../checkbox/checkbox-check";
import { MenuItemCheckedContext } from "./__utils";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a checkmark inside a `MenuItemCheckbox` or
 * `MenuItemRadio` components. This hook must be used in a component that's
 * wrapped with one of those components or the `checked` prop must be explicitly
 * passed to the component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const props = useMenuItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useMenuItemCheck = createHook<MenuItemCheckOptions>(
  ({ state, checked, ...props }) => {
    const context = useContext(MenuItemCheckedContext);
    checked = checked ?? context;
    props = useCheckboxCheck({ ...props, checked });
    return props;
  }
);

/**
 * A component that renders a checkmark inside a `MenuItemCheckbox` or
 * `MenuItemRadio` components. This component must be wrapped with one of those
 * components or the `checked` prop must be explicitly passed to the component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState({
 *   defaultValues: { apple: true, orange: false },
 * });
 * <MenuButton state={menu}>Fruits</MenuButton>
 * <Menu state={menu}>
 *   <MenuItemCheckbox name="apple">
 *     <MenuItemCheck />
 *     Apple
 *   </MenuItemCheckbox>
 *   <MenuItemCheckbox name="orange">
 *     <MenuItemCheck />
 *     Orange
 *   </MenuItemCheckbox>
 * </Menu>
 * ```
 */
export const MenuItemCheck = createComponent<MenuItemCheckOptions>((props) => {
  const htmlProps = useMenuItemCheck(props);
  return createElement("span", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuItemCheck.displayName = "MenuItemCheck";
}

export type MenuItemCheckOptions<T extends As = "span"> = Omit<
  CheckboxCheckOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useMenuState` hook.
   */
  state?: MenuState;
};

export type MenuItemCheckProps<T extends As = "span"> = Props<
  MenuItemCheckOptions<T>
>;
