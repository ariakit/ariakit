import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { useRef } from "react";
import { getPopupItemRole, getPopupRole } from "@ariakit/core/utils/dom";
import { disabledFromProps, invariant } from "@ariakit/core/utils/misc";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.js";
import { useCompositeTypeahead } from "../composite/composite-typeahead.js";
import type { HovercardAnchorOptions } from "../hovercard/hovercard-anchor.js";
import { useHovercardAnchor } from "../hovercard/hovercard-anchor.js";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.js";
import { usePopoverDisclosure } from "../popover/popover-disclosure.js";
import { Role } from "../role/role.js";
import {
  useEvent,
  useId,
  useMergeRefs,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { MenuContextProvider, useMenuProviderContext } from "./menu-context.js";
import type { MenuStore, MenuStoreState } from "./menu-store.js";

type BasePlacement = "top" | "bottom" | "left" | "right";

function getInitialFocus(event: KeyboardEvent, dir: BasePlacement) {
  const keyMap = {
    ArrowDown: dir === "bottom" || dir === "top" ? "first" : false,
    ArrowUp: dir === "bottom" || dir === "top" ? "last" : false,
    ArrowRight: dir === "right" ? "first" : false,
    ArrowLeft: dir === "left" ? "first" : false,
  } as const;
  return keyMap[event.key as keyof typeof keyMap];
}

function hasActiveItem(
  items?: MenuStoreState["items"],
  excludeElement?: Element | null,
) {
  return !!items?.some((item) => {
    if (!item.element) return false;
    if (item.element === excludeElement) return false;
    return item.element.getAttribute("aria-expanded") === "true";
  });
}

/**
 * Returns props to create a `MenuButton` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuButton({ store });
 * <Role {...props}>Edit</Role>
 * <Menu store={store}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuButton = createHook2<TagName, MenuButtonOptions>(
  ({ store, focusable, accessibleWhenDisabled, showOnHover, ...props }) => {
    const context = useMenuProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuButton must receive a `store` prop or be wrapped in a MenuProvider component.",
    );

    const ref = useRef<HTMLElement>(null);
    const parentMenu = store.parent;
    const parentMenubar = store.menubar;
    const hasParentMenu = !!parentMenu;
    const parentIsMenubar = !!parentMenubar && !hasParentMenu;
    const disabled = disabledFromProps(props);

    const showMenu = () => {
      const trigger = ref.current;
      if (!trigger) return;
      store?.setDisclosureElement(trigger);
      store?.setAnchorElement(trigger);
      store?.show();
    };

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLButtonElement>) => {
      onFocusProp?.(event as any);
      if (disabled) return;
      if (event.defaultPrevented) return;
      // Reset the autoFocusOnShow state so we can focus the menu button while
      // the menu is open and press arrow keys to move focus to the menu items.
      store?.setAutoFocusOnShow(false);
      // We need to unset the active menu item so no menu item appears active
      // while the menu button is focused.
      store?.setActiveId(null);
      // When the menu button is focused, we'll only show its menu if it's in a
      // menu bar
      if (!parentMenubar) return;
      if (!parentIsMenubar) return;
      const { items } = parentMenubar.getState();
      // and there's already another expanded menu button or the previously
      // focused element is another menu item.
      if (hasActiveItem(items, event.currentTarget)) {
        showMenu();
      }
    });

    const dir = store.useState(
      (state) => state.placement.split("-")[0] as BasePlacement,
    );

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDownProp?.(event as any);
      if (disabled) return;
      if (event.defaultPrevented) return;
      const initialFocus = getInitialFocus(event, dir);
      if (initialFocus) {
        event.preventDefault();
        showMenu();
        store?.setAutoFocusOnShow(true);
        store?.setInitialFocus(initialFocus);
      }
    });

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event as any);
      if (event.defaultPrevented) return;
      if (!store) return;
      const isKeyboardClick = !event.detail;
      const { open } = store.getState();
      // When the menu button is clicked, if the menu is hidden or if it's a
      // keyboard click (enter or space),
      if (!open || isKeyboardClick) {
        // we'll only automatically focus on the menu if it's not a submenu
        // button, or if it's a keyboard click.
        if (!hasParentMenu || isKeyboardClick) {
          store.setAutoFocusOnShow(true);
        }
        store.setInitialFocus(isKeyboardClick ? "first" : "container");
      }
      // On submenu buttons, we can't hide the submenu by clicking on the menu
      // button again.
      if (hasParentMenu) {
        showMenu();
      }
    });

    props = useWrapElement(
      props,
      (element) => (
        <MenuContextProvider value={store}>{element}</MenuContextProvider>
      ),
      [store],
    );

    if (hasParentMenu) {
      // On Safari, VO+Space triggers a click twice on native button elements
      // with role menuitem (https://bugs.webkit.org/show_bug.cgi?id=228318).
      // So, if the menu button is rendered within a menu, we need to render it
      // as another element.
      props = {
        ...props,
        render: <Role.div render={props.render} />,
      };
    }

    // We'll use this id to render the aria-labelledby attribute on the menu.
    const id = useId(props.id);

    const parentContentElement = useStoreState(
      parentMenu?.combobox || parentMenu,
      "contentElement",
    );

    // When the menu button is rendered inside another menu, we set the role
    // attribute here so it doesn't get overridden by the button component with
    // role="button".
    const role =
      hasParentMenu || parentIsMenubar
        ? getPopupItemRole(parentContentElement, "menuitem")
        : undefined;

    const contentElement = store.useState("contentElement");

    props = {
      id,
      role,
      "aria-haspopup": getPopupRole(contentElement, "menu"),
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onFocus,
      onKeyDown,
      onClick,
    };

    props = useHovercardAnchor({
      store,
      focusable,
      accessibleWhenDisabled,
      ...props,
      showOnHover: (event) => {
        const getShowOnHover = () => {
          if (typeof showOnHover === "function") return showOnHover(event);
          if (showOnHover != null) return showOnHover;
          if (hasParentMenu) return true;
          if (!parentMenubar) return false;
          const { items } = parentMenubar.getState();
          return parentIsMenubar && hasActiveItem(items);
        };
        const canShowOnHover = getShowOnHover();
        if (!canShowOnHover) return false;
        const parent = parentIsMenubar ? parentMenubar : parentMenu;
        if (!parent) return true;
        // When hovering over a menu button shows a menu and the menu button is
        // part of another menu or menubar, it's not guaranteed that the button
        // will get focused. That's why we make sure the active item is updated
        // on the parent menu store. See "moving between menus with arrow keys
        // after hovering over subitems" test.
        parent.setActiveId(event.currentTarget.id);
        return true;
      },
    });

    props = usePopoverDisclosure({
      store,
      toggleOnClick: !hasParentMenu,
      focusable,
      accessibleWhenDisabled,
      ...props,
    });

    props = useCompositeTypeahead({
      store,
      typeahead: parentIsMenubar,
      ...props,
    });

    return props;
  },
);

/**
 * Renders a menu button that toggles the visibility of a
 * [`Menu`](https://ariakit.org/reference/menu) component when clicked or when
 * using arrow keys.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {2}
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuButton = forwardRef(function MenuButton(
  props: MenuButtonProps,
) {
  const htmlProps = useMenuButton(props);
  return createElement(TagName, htmlProps);
});

export interface MenuButtonOptions<T extends ElementType = TagName | "div">
  extends HovercardAnchorOptions<T>,
    PopoverDisclosureOptions<T>,
    CompositeTypeaheadOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
   * provided, the closest
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider) component's
   * context will be used.
   */
  store?: MenuStore;
  /**
   * Determines whether pressing a character key while focusing on the
   * [`MenuButton`](https://ariakit.org/reference/menu-button) should move focus
   * to the [`MenuItem`](https://ariakit.org/reference/menu-item) starting with
   * that character.
   *
   * By default, it's `true` for menu buttons in a
   * [`Menubar`](https://ariakit.org/reference/menubar), but `false` for other
   * menu buttons.
   */
  typeahead?: boolean;
}

export type MenuButtonProps<T extends ElementType = TagName | "div"> = Props<
  MenuButtonOptions<T>
>;
