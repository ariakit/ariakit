import type { KeyboardEvent, MutableRefObject, RefObject } from "react";
import { createRef, useEffect, useRef, useState } from "react";
import { hasFocusWithin } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { HovercardOptions } from "../hovercard/hovercard.js";
import { useHovercard } from "../hovercard/hovercard.js";
import { useBooleanEvent, useEvent, useMergeRefs } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useMenuProviderContext } from "./menu-context.js";
import type { MenuListOptions } from "./menu-list.js";
import { useMenuList } from "./menu-list.js";

/**
 * Returns props to create a `Menu` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenu({ store });
 * <MenuButton store={store}>Edit</MenuButton>
 * <Role {...props}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Role>
 * ```
 */
export const useMenu = createHook<MenuOptions>(
  ({
    store,
    hideOnEscape = true,
    autoFocusOnShow = true,
    hideOnHoverOutside,
    alwaysVisible,
    ...props
  }) => {
    const context = useMenuProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Menu must receive a `store` prop or be wrapped in a MenuProvider component.",
    );

    const ref = useRef<HTMLDivElement>(null);

    const parentMenu = store.parent;
    const parentMenuBar = store.menubar;
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
        return store?.hide();
      }
    });

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onKeyDown,
    };

    // The aria-labelledby prop on MenuList defaults to the MenuButton's id. On
    // Dialog/Popover/Hovercard/Menu, we need to consider MenuHeading as well
    // and it should take precedence. That's why we need to destructure this
    // prop here and check if aria-labelledby is set later.
    const { "aria-labelledby": ariaLabelledBy, ...menuListProps } = useMenuList(
      { store, alwaysVisible, ...props },
    );

    props = menuListProps;

    const [initialFocusRef, setInitialFocusRef] =
      useState<RefObject<HTMLElement>>();

    const autoFocusOnShowState = store.useState("autoFocusOnShow");
    const initialFocus = store.useState("initialFocus");
    const baseElement = store.useState("baseElement");
    const items = store.useState("renderedItems");

    // Sets the initial focus ref.
    useEffect(() => {
      let cleaning = false;
      setInitialFocusRef((prevInitialFocusRef) => {
        if (cleaning) return;
        // TODO: Fix
        if (!autoFocusOnShowState) return;
        if (prevInitialFocusRef?.current?.isConnected)
          return prevInitialFocusRef;
        const ref = createRef() as MutableRefObject<HTMLElement | null>;
        switch (initialFocus) {
          // TODO: Refactor
          case "first":
            ref.current =
              items.find((item) => !item.disabled && item.element)?.element ||
              null;
            break;
          case "last":
            ref.current =
              [...items]
                .reverse()
                .find((item) => !item.disabled && item.element)?.element ||
              null;
            break;
          default:
            ref.current = baseElement;
        }
        if (!ref.current) return;
        return ref;
      });
      return () => {
        cleaning = true;
      };
    }, [store, autoFocusOnShowState, initialFocus, items, baseElement]);

    const mayAutoFocusOnShow = !!autoFocusOnShow;
    // When the `autoFocusOnShow` prop is set to `true` (default), we'll only
    // move focus to the menu when there's an initialFocusRef set or the menu is
    // modal. Otherwise, users would have to manually call
    // store.setAutoFocusOnShow(true) every time they want to open the menu.
    // This differs from the usual dialog behavior that would automatically
    // focus on the dialog container when no initialFocusRef is set.
    const canAutoFocusOnShow =
      !!initialFocusRef || !!props.initialFocus || !!props.modal;

    props = useHovercard({
      store,
      alwaysVisible,
      initialFocus: initialFocusRef,
      autoFocusOnShow: mayAutoFocusOnShow
        ? canAutoFocusOnShow && autoFocusOnShow
        : autoFocusOnShowState || !!props.modal,
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
        const disclosure = store?.getState().disclosureElement;
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
  },
);

/**
 * Renders a dropdown menu element.
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
export const Menu = createComponent<MenuOptions>((props) => {
  const htmlProps = useMenu(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Menu.displayName = "Menu";
}

export interface MenuOptions<T extends As = "div">
  extends MenuListOptions<T>,
    Omit<HovercardOptions<T>, "store"> {}

export type MenuProps<T extends As = "div"> = Props<MenuOptions<T>>;
