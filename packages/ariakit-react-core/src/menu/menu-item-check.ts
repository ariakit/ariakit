import { useContext } from "react";
import type { ElementType } from "react";
import type { CheckboxCheckOptions } from "../checkbox/checkbox-check.js";
import { useCheckboxCheck } from "../checkbox/checkbox-check.js";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import { MenuItemCheckedContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `MenuItemCheck` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const props = useMenuItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useMenuItemCheck = createHook2<TagName, MenuItemCheckOptions>(
  function useMenuItemCheck({ store, checked, ...props }) {
    const context = useContext(MenuItemCheckedContext);
    checked = checked ?? context;
    props = useCheckboxCheck({ ...props, checked });
    return props;
  },
);

/**
 * Renders a checkmark icon when the
 * [`checked`](https://ariakit.org/reference/menu-item-check#checked) prop is
 * `true`. The icon can be overridden by providing a different one as children.
 *
 * When rendered inside
 * [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox) or
 * [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio) components,
 * the [`checked`](https://ariakit.org/reference/menu-item-check#checked) prop
 * is automatically derived from the context.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {5,9}
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
export const MenuItemCheck = forwardRef(function MenuItemCheck(
  props: MenuItemCheckProps,
) {
  const htmlProps = useMenuItemCheck(props);
  return createElement(TagName, htmlProps);
});

export interface MenuItemCheckOptions<T extends ElementType = TagName>
  extends Omit<CheckboxCheckOptions<T>, "store"> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook.
   */
  store?: MenuStore;
}

export type MenuItemCheckProps<T extends ElementType = TagName> = Props2<
  T,
  MenuItemCheckOptions<T>
>;
