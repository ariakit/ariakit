import { KeyboardEvent, RefObject, useEffect, useState } from "react";
import { hasFocusWithin } from "ariakit-utils/focus";
import { useBooleanEvent, useEvent } from "ariakit-utils/hooks";
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

function getItemRefById(items: MenuState["renderedItems"], id?: null | string) {
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

    const onKeyDownProp = props.onKeyDown;
    const hideOnEscapeProp = useBooleanEvent(hideOnEscape);

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        if (!hideOnEscapeProp(event)) return;
        if (!hasParentMenu) {
          // On Esc, only stop propagation if there's no parent menu. Otherwise,
          // pressing Esc should close all menus
          event.stopPropagation();
        }
        return state.hide();
      }
    });

    props = {
      ...props,
      onKeyDown,
    };

    props = useMenuList({
      state,
      ...props,
    });

    const [initialFocusRef, setInitialFocusRef] =
      useState<RefObject<HTMLElement>>();

    // Sets the initial focus ref.
    useEffect(() => {
      setInitialFocusRef((prevInitialFocusRef) => {
        if (!state.autoFocusOnShow) return undefined;
        if (prevInitialFocusRef) return prevInitialFocusRef;
        switch (state.initialFocus) {
          case "first":
            return getItemRefById(state.renderedItems, state.first());
          case "last":
            return getItemRefById(state.renderedItems, state.last());
          default:
            return state.baseRef;
        }
      });
    }, [
      state.autoFocusOnShow,
      state.initialFocus,
      state.renderedItems,
      state.first,
      state.last,
      state.baseRef,
    ]);

    props = useHovercard({
      state,
      initialFocusRef,
      autoFocusOnShow: state.autoFocusOnShow || !!props.modal,
      ...props,
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
