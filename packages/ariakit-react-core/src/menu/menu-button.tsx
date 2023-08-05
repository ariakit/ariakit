import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { useContext, useEffect, useRef } from "react";
import { getPopupItemRole, getPopupRole } from "@ariakit/core/utils/dom";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.js";
import { useCompositeTypeahead } from "../composite/composite-typeahead.js";
import type { HovercardAnchorOptions } from "../hovercard/hovercard-anchor.js";
import { useHovercardAnchor } from "../hovercard/hovercard-anchor.js";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.js";
import { usePopoverDisclosure } from "../popover/popover-disclosure.js";
import { useEvent, useId, useMergeRefs } from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { MenuBarContext, MenuContext } from "./menu-context.js";
import type { MenuStore } from "./menu-store.js";
import { hasExpandedMenuButton } from "./utils.js";

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
export const useMenuButton = createHook<MenuButtonOptions>(
  ({ store, focusable, accessibleWhenDisabled, showOnHover, ...props }) => {
    const ref = useRef<HTMLElement>(null);
    const parentMenu = useContext(MenuContext);
    const parentMenuBar = useContext(MenuBarContext);
    const hasParentMenu = !!parentMenu;
    const parentIsMenuBar = !!parentMenuBar && !hasParentMenu;
    const disabled =
      props.disabled ||
      props["aria-disabled"] === true ||
      props["aria-disabled"] === "true";

    useEffect(() => {
      // Makes sure that the menu button is assigned as the menu disclosure
      // element. This is needed to support screen reader focusing on sibling
      // menu items.
      return store.sync(() => {
        store.setState("disclosureElement", ref.current);
      }, ["disclosureElement"]);
    }, [store]);

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLButtonElement>) => {
      onFocusProp?.(event as any);
      if (disabled) return;
      if (event.defaultPrevented) return;
      // Reset the autoFocusOnShow state so we can focus the menu button while
      // the menu is open and press arrow keys to move focus to the menu items.
      store.setAutoFocusOnShow(false);
      // We need to unset the active menu item so no menu item appears active
      // while the menu button is focused.
      store.setActiveId(null);
      // When the menu button is focused, we'll only show its menu if it's in a
      // menu bar
      if (!parentMenuBar) return;
      if (!parentIsMenuBar) return;
      const { items } = parentMenuBar.getState();
      // and there's already another expanded menu button.
      if (hasExpandedMenuButton(items, event.currentTarget)) {
        store.show();
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
        store.show();
        store.setAutoFocusOnShow(true);
        store.setInitialFocus(initialFocus);
      }
    });

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event as any);
      if (event.defaultPrevented) return;
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
        store.show();
      }
    });

    if (hasParentMenu) {
      // On Safari, VO+Space triggers a click twice on native button elements
      // with role menuitem (https://bugs.webkit.org/show_bug.cgi?id=228318).
      // So, if the menu button is rendered within a menu, we need to render it
      // as another element.
      props = { render: <div />, ...props };
    }

    // We'll use this id to render the aria-labelledby attribute on the menu.
    const id = useId(props.id);

    const parentContentElement = useStoreState(parentMenu, "contentElement");

    // When the menu button is rendered inside another menu, we set the role
    // attribute here so it doesn't get overridden by the button component with
    // role="button".
    const role =
      hasParentMenu || parentIsMenuBar
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
        if (typeof showOnHover === "function") return showOnHover(event);
        if (showOnHover != null) return showOnHover;
        if (hasParentMenu) return true;
        if (!parentMenuBar) return false;
        const { items } = parentMenuBar.getState();
        return parentIsMenuBar && hasExpandedMenuButton(items);
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
      typeahead: parentIsMenuBar,
      ...props,
    });

    return props;
  },
);

/**
 * Renders a menu button that triggers a dropdown menu. Usually, this is
 * rendered as a native `button` element, but if it's a submenu button rendered
 * as a menu item inside another menu, it'll be rendered as a `div`.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuStore();
 * <MenuButton store={menu}>Edit</MenuButton>
 * <Menu store={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const MenuButton = createComponent<MenuButtonOptions>((props) => {
  const htmlProps = useMenuButton(props);
  return createElement("button", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuButton.displayName = "MenuButton";
}

export interface MenuButtonOptions<T extends As = "button" | "div">
  extends HovercardAnchorOptions<T>,
    PopoverDisclosureOptions<T>,
    CompositeTypeaheadOptions<T> {
  /**
   * Object returned by the `useMenuStore` hook.
   */
  store: MenuStore;
  /**
   * Determines whether pressing a character key while focusing on the
   * `MenuButton` should move focus to the `MenuItem` starting with that
   * character. By default, it's `true` for menu buttons in a `MenuBar`, but
   * `false` for other menu buttons.
   */
  typeahead?: boolean;
}

export type MenuButtonProps<T extends As = "button" | "div"> = Props<
  MenuButtonOptions<T>
>;
