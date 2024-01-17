import type { ElementType, MutableRefObject, RefObject } from "react";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { fireEvent } from "@ariakit/core/utils/events";
import { hasFocusWithin } from "@ariakit/core/utils/focus";
import { invariant, isFalsyBooleanCallback } from "@ariakit/core/utils/misc";
import { createDialogComponent } from "../dialog/dialog.js";
import type { HovercardOptions } from "../hovercard/hovercard.jsx";
import { useHovercard } from "../hovercard/hovercard.jsx";
import { useMergeRefs } from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createElement, createHook, forwardRef } from "../utils/system.jsx";
import type { Props } from "../utils/types.js";
import { useMenuProviderContext } from "./menu-context.js";
import type { MenuListOptions } from "./menu-list.jsx";
import { useMenuList } from "./menu-list.jsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
export const useMenu = createHook<TagName, MenuOptions>(function useMenu({
  store,
  modal: modalProp = false,
  portal = !!modalProp,
  hideOnEscape = true,
  autoFocusOnShow = true,
  hideOnHoverOutside,
  alwaysVisible,
  ...props
}) {
  const context = useMenuProviderContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "Menu must receive a `store` prop or be wrapped in a MenuProvider component.",
  );

  const ref = useRef<HTMLType>(null);

  const parentMenu = store.parent;
  const parentMenubar = store.menubar;
  const hasParentMenu = !!parentMenu;
  const parentIsMenubar = !!parentMenubar && !hasParentMenu;

  props = {
    ...props,
    ref: useMergeRefs(ref, props.ref),
  };

  // The aria-labelledby prop on MenuList defaults to the MenuButton's id. On
  // Dialog/Popover/Hovercard/Menu, we need to consider MenuHeading as well
  // and it should take precedence. That's why we need to destructure this
  // prop here and check if aria-labelledby is set later.
  const { "aria-labelledby": ariaLabelledBy, ...menuListProps } = useMenuList({
    store,
    alwaysVisible,
    ...props,
  });

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
      if (prevInitialFocusRef?.current?.isConnected) return prevInitialFocusRef;
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
            [...items].reverse().find((item) => !item.disabled && item.element)
              ?.element || null;
          break;
        default:
          ref.current = baseElement;
      }
      return ref;
    });
    return () => {
      cleaning = true;
    };
  }, [store, autoFocusOnShowState, initialFocus, items, baseElement]);

  // If it's a submenu, it shouldn't behave like a modal dialog.
  const modal = hasParentMenu ? false : modalProp;

  const mayAutoFocusOnShow = !!autoFocusOnShow;
  // When the `autoFocusOnShow` prop is set to `true` (default), we'll only
  // move focus to the menu when there's an initialFocusRef set or the menu is
  // modal. Otherwise, users would have to manually call
  // store.setAutoFocusOnShow(true) every time they want to open the menu.
  // This differs from the usual dialog behavior that would automatically
  // focus on the dialog container when no initialFocusRef is set.
  const canAutoFocusOnShow =
    !!initialFocusRef || !!props.initialFocus || !!modal;

  const contentElement = useStoreState(
    store.combobox || store,
    "contentElement",
  );
  const parentContentElement = useStoreState(
    parentMenu?.combobox || parentMenu,
    "contentElement",
  );

  // This ensures that, when the menu is nested in a non-menu wrapper, the tab
  // order will be preserved from the parent content element rather than from
  // the anchor element. This is because the preserveTabOrderAnchor feature
  // will use aria-owns to fix the tab order on screen readers. The parent
  // content element may have a role that does not allow this menu's role as a
  // child. By passing the parent content element as the tab order anchor, the
  // aria-owns element will be added as a sibling instead. TODO: Test this.
  const preserveTabOrderAnchor = useMemo(() => {
    if (!parentContentElement) return;
    if (!contentElement) return;
    const role = contentElement.getAttribute("role");
    const parentRole = parentContentElement.getAttribute("role");
    const parentIsMenuOrMenubar =
      parentRole === "menu" || parentRole === "menubar";
    if (parentIsMenuOrMenubar && role === "menu") return;
    return parentContentElement;
  }, [contentElement, parentContentElement]);

  if (preserveTabOrderAnchor !== undefined) {
    props = {
      preserveTabOrderAnchor,
      ...props,
    };
  }

  props = useHovercard({
    store,
    alwaysVisible,
    initialFocus: initialFocusRef,
    autoFocusOnShow: mayAutoFocusOnShow
      ? canAutoFocusOnShow && autoFocusOnShow
      : autoFocusOnShowState || !!modal,
    ...props,
    hideOnEscape(event) {
      if (isFalsyBooleanCallback(hideOnEscape, event)) return false;
      store?.hideAll();
      return true;
    },
    hideOnHoverOutside(event) {
      const disclosureElement = store?.getState().disclosureElement;
      const getHideOnHoverOutside = () => {
        if (typeof hideOnHoverOutside === "function") {
          return hideOnHoverOutside(event);
        }
        if (hideOnHoverOutside != null) return hideOnHoverOutside;
        // Hide the menu when hovering outside if it's a submenu in a dropdown
        // menu or if it's a menu in a menubar and the menu button doesn't
        // have focus.
        if (hasParentMenu) return true;
        if (!parentIsMenubar) return false;
        if (!disclosureElement) return true;
        if (hasFocusWithin(disclosureElement)) return false;
        return true;
      };
      if (!getHideOnHoverOutside()) return false;
      if (event.defaultPrevented) return true;
      if (!hasParentMenu) return true;
      if (!disclosureElement) return true;
      // This can be tested by hovering over a menu item (that's also a menu
      // button), waiting for the menu to open, and then moving towards the
      // menu, but stopping before reaching it. Then, move the mouse to the
      // other direction. The menu should close, but since we've already left
      // the menu button, the mouseout and therefore the blurOnHoverEnd
      // behavior won't be fired. That's why we need to manually re-fire it
      // here when the menu is closed by hovering away.
      fireEvent(disclosureElement, "mouseout", event);
      if (!hasFocusWithin(disclosureElement)) return true;
      // When the focus is determined by the aria-activedescendant attribute
      // (virtual focus), the mouseout event above won't update the state
      // synchronously. That is, the hasFocusWithin function above (which also
      // takes into account aria-activedescendant) will be true even though
      // the mouseout event has blurred the menu button.
      requestAnimationFrame(() => {
        if (hasFocusWithin(disclosureElement)) return;
        store?.hide();
      });
      return false;
    },
    modal,
    portal,
    backdrop: hasParentMenu ? false : props.backdrop,
  });

  props = {
    "aria-labelledby": ariaLabelledBy,
    ...props,
  };

  return props;
});

/**
 * Renders a dropdown menu element that's controlled by a
 * [`MenuButton`](https://ariakit.org/reference/menu-button) component.
 *
 * This component uses the primitive
 * [`MenuList`](https://ariakit.org/reference/menu-list) component under the
 * hood. It renders a popover and automatically focuses on items when the menu
 * is shown.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {3-6}
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const Menu = createDialogComponent(
  forwardRef(function Menu(props: MenuProps) {
    const htmlProps = useMenu(props);
    return createElement(TagName, htmlProps);
  }),
  useMenuProviderContext,
);

export interface MenuOptions<T extends ElementType = TagName>
  extends MenuListOptions<T>,
    Omit<HovercardOptions<T>, "store"> {}

export type MenuProps<T extends ElementType = TagName> = Props<
  T,
  MenuOptions<T>
>;
