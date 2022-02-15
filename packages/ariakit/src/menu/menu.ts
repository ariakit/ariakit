import { KeyboardEvent, useCallback, useState } from "react";
import { hasFocusWithin } from "ariakit-utils/focus";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
} from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { HovercardOptions, useHovercard } from "../hovercard/hovercard";
import { MenuBarContext, useParentMenu } from "./__utils";
import { MenuListOptions, useMenuList } from "./menu-list";

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
  ({ state, hideOnEscape = true, autoFocusOnShow = true, ...props }) => {
    const parentMenu = useParentMenu();
    const parentMenuBar = useStore(MenuBarContext, []);
    const hasParentMenu = !!parentMenu;
    const parentIsMenuBar = !!parentMenuBar && !hasParentMenu;
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    const portalRef = useForkRef(setPortalNode, props.portalRef);
    const domReady = !props.portal || portalNode;

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
      autoFocusOnShow: autoFocusOnShow && !!domReady,
    });

    props = useHovercard({
      state,
      autoFocusOnShow: false,
      ...props,
      hideOnHoverOutside: (event) => {
        // TODO: Call props.hideOnHoverOutside
        if (hasParentMenu) return true;
        if (!parentIsMenuBar) return false;
        if (hasFocusWithin(state.disclosureRef.current)) return false;
        return true;
      },
      portalRef,
      // If it's a sub menu, it should behave like a modal dialog, nor display a
      // backdrop.
      modal: hasParentMenu ? false : props.modal,
      backdrop: hasParentMenu ? false : props.backdrop,
      // If it's a sub menu, hide on esc will be handled differently. That is,
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
