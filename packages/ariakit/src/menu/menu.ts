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
  ({
    state,
    hideOnEscape = true,
    autoFocusOnShow = true,
    hideOnHoverOutside,
    ...props
  }) => {
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

    // The aria-labelledby prop on MenuList defaults to the MenuButton's id. On
    // Dialog/Popover/Hovercard/Menu, we need to consider MenuHeading as well
    // and it should take precedence. That's why we need to destructure this
    // prop here and check if aria-labelledby is set later.
    const { "aria-labelledby": ariaLabelledBy, ...menuListProps } = useMenuList(
      {
        state,
        ...props,
      }
    );

    props = menuListProps;

    const [initialFocusRef, setInitialFocusRef] =
      useState<RefObject<HTMLElement>>();

    // Sets the initial focus ref.
    useEffect(() => {
      let cleaning = false;
      setInitialFocusRef((prevInitialFocusRef) => {
        if (cleaning) return;
        if (!state.autoFocusOnShow) return;
        if (prevInitialFocusRef) return prevInitialFocusRef;
        switch (state.initialFocus) {
          case "first":
            return getItemRefById(state.items, state.first());
          case "last":
            return getItemRefById(state.items, state.last());
          default:
            return state.baseRef;
        }
      });
      return () => {
        cleaning = true;
      };
    }, [
      state.autoFocusOnShow,
      state.initialFocus,
      state.items,
      state.first,
      state.last,
      state.baseRef,
    ]);

    const mayAutoFocusOnShow = !!autoFocusOnShow;
    // When the `autoFocusOnShow` prop is set to `true` (default), we'll only
    // move focus to the menu when there's an initialFocusRef set or the menu is
    // modal. Otherwise, users would have to manually call
    // state.setAutoFocusOnShow(true) every time they want to open the menu.
    // This differs from the usual dialog behavior that would automatically
    // focus on the dialog container when no initialFocusRef is set.
    const canAutoFocusOnShow =
      !!initialFocusRef || !!props.initialFocusRef || !!props.modal;

    props = useHovercard({
      state,
      initialFocusRef,
      autoFocusOnShow: mayAutoFocusOnShow
        ? canAutoFocusOnShow && autoFocusOnShow
        : state.autoFocusOnShow || !!props.modal,
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

    props = {
      "aria-labelledby": ariaLabelledBy,
      ...props,
    };

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

if (process.env.NODE_ENV !== "production") {
  Menu.displayName = "Menu";
}

export type MenuOptions<T extends As = "div"> = MenuListOptions<T> &
  Omit<HovercardOptions<T>, "state">;

export type MenuProps<T extends As = "div"> = Props<MenuOptions<T>>;
