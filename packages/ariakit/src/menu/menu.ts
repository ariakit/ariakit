import {
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from "react";
import { hasFocusWithin } from "ariakit-utils/focus";
import { useBooleanEventCallback, useEventCallback } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { HovercardOptions, useHovercard } from "../hovercard/hovercard";
import { MenuBarContext, MenuContext } from "./__utils";
import { MenuListOptions, useMenuList } from "./menu-list";
import { MenuState } from "./menu-state";

function getItemRefById(items: MenuState["items"], id?: null | string) {
  if (!id) return;
  return items.find((item) => item.id === id)?.ref;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a dropdown menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenu({ state });
 * <MenuButton state={state}>Edit</MenuButton>
 * <Role {...props}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Role>
 * ```
 */
export const useMenu = createHook<MenuOptions>(
  ({ state, hideOnEscape = true, hideOnHoverOutside, ...props }) => {
    const parentMenu = useStore(MenuContext, []);
    const parentMenuBar = useStore(MenuBarContext, []);
    const hasParentMenu = !!parentMenu;
    const parentIsMenuBar = !!parentMenuBar && !hasParentMenu;

    const onKeyDownProp = useEventCallback(props.onKeyDown);
    const hideOnEscapeProp = useBooleanEventCallback(hideOnEscape);

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        if (event.key === "Escape") {
          if (!hideOnEscapeProp(event)) return;
          if (!hasParentMenu) {
            // On Esc, only stop propagation if there's no parent menu.
            // Otherwise, pressing Esc should close all menus
            event.stopPropagation();
          }
          return state.hide();
        }
      },
      [onKeyDownProp, hideOnEscapeProp, hasParentMenu, state.hide]
    );

    props = {
      ...props,
      onKeyDown,
    };

    props = useMenuList({
      state,
      ...props,
    });

    const hasItems = !!state.items.length;
    const [initialFocusRef, setInitialFocusRef] =
      useState<RefObject<HTMLElement>>();

    useEffect(() => {
      if (!hasItems) return;
      if (!state.mounted) return;
      setInitialFocusRef(
        state.initialFocus === "first"
          ? getItemRefById(state.items, state.first())
          : state.initialFocus === "last"
          ? getItemRefById(state.items, state.last())
          : state.baseRef
      );
      // We're intentionally only listening to hasItems here and not to
      // state.items, state.first and state.last, because we don't want to set
      // the initial focus ref again whenever the items change, but only when
      // the menu and the items have been mounted.
    }, [hasItems, state.mounted, state.initialFocus, state.baseRef]);

    const autoFocusOnShow =
      props.autoFocusOnShow === false
        ? false
        : state.autoFocusOnShow || !!props.modal;

    props = useHovercard({
      state,
      initialFocusRef,
      ...props,
      autoFocusOnShow,
      hideOnHoverOutside: (event) => {
        if (typeof hideOnHoverOutside === "function") {
          return hideOnHoverOutside(event);
        }
        if (hideOnHoverOutside != null) return hideOnHoverOutside;
        if (hasParentMenu) {
          parentMenu.setActiveId(null);
          return true;
        }
        if (!parentIsMenuBar) return false;
        const disclosure = state.disclosureRef.current;
        if (!disclosure) return true;
        if (hasFocusWithin(disclosure)) return false;
        return true;
      },
      // If it's a submenu, it shouldn't behave like a modal dialog, nor display
      // a backdrop.
      modal: hasParentMenu ? false : props.modal,
      backdrop: hasParentMenu ? false : props.backdrop,
      // If it's a submenu, hide on esc will be handled differently. That is,
      // event.stopPropagation() won't be called, so the parent menus will also
      // be closed.
      hideOnEscape: hasParentMenu ? false : hideOnEscape,
    });

    return props;
  }
);

/**
 * A component that renders a dropdown menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <MenuButton state={menu}>Edit</MenuButton>
 * <Menu state={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const Menu = createComponent<MenuOptions>((props) => {
  const htmlProps = useMenu(props);
  return createElement("div", htmlProps);
});

export type MenuOptions<T extends As = "div"> = MenuListOptions<T> &
  Omit<HovercardOptions<T>, "state">;

export type MenuProps<T extends As = "div"> = Props<MenuOptions<T>>;
