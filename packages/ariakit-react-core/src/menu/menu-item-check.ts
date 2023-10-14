import { useContext } from "react";
import type { CheckboxCheckOptions } from "../checkbox/checkbox-check.js";
import { useCheckboxCheck } from "../checkbox/checkbox-check.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { MenuItemCheckedContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

/**
 * Returns props to create a `MenuItemCheck` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const props = useMenuItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useMenuItemCheck = createHook<MenuItemCheckOptions>(
  ({ store, checked, ...props }) => {
    const context = useContext(MenuItemCheckedContext);
    checked = checked ?? context;
    props = useCheckboxCheck({ ...props, checked });
    return props;
  },
);

/**
 * Renders a checkmark inside a `MenuItemCheckbox` or `MenuItemRadio`
 * components. This component must be wrapped with one of those components or
 * the `checked` prop must be explicitly passed to the component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider defaultValues={{ apple: true, orange: false }}>
 *   <MenuButton>Fruits</MenuButton>
 *   <Menu>
 *     <MenuItemCheckbox name="apple">
 *       <MenuItemCheck />
 *       Apple
 *     </MenuItemCheckbox>
 *     <MenuItemCheckbox name="orange">
 *       <MenuItemCheck />
 *       Orange
 *     </MenuItemCheckbox>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuItemCheck = createComponent<MenuItemCheckOptions>((props) => {
  const htmlProps = useMenuItemCheck(props);
  return createElement("span", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuItemCheck.displayName = "MenuItemCheck";
}

export interface MenuItemCheckOptions<T extends As = "span">
  extends Omit<CheckboxCheckOptions<T>, "store"> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook.
   */
  store?: MenuStore;
}

export type MenuItemCheckProps<T extends As = "span"> = Props<
  MenuItemCheckOptions<T>
>;
