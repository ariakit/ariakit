import { useStoreState } from "@ariakit/react-store";
import {
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import {
  fireEvent,
  hasFocusWithin,
  invariant,
  isFalsyBooleanCallback,
} from "@ariakit/utils";
import type { ElementType, MutableRefObject } from "react";
import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { createDialogComponent } from "../dialog/dialog.tsx";
import { isCapturedDisclosure } from "../dialog/utils/__captured-disclosures.ts";
import type { HovercardOptions } from "../hovercard/hovercard.tsx";
import { useHovercard } from "../hovercard/hovercard.tsx";
import { useMenuProviderContext } from "./menu-context.tsx";
import type { MenuListOptions } from "./menu-list.tsx";
import { useMenuList } from "./menu-list.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `Menu` component.
 * @see https://ariakit.com/components/menu
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
  portal = modalProp,
  hideOnEscape = true,
  autoFocusOnShow = true,
  hideOnHoverOutside,
  alwaysVisible,
  getPersistentElements,
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
  // If it's a submenu, it shouldn't behave like a modal dialog.
  const modal = hasParentMenu ? false : modalProp;

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
    useState<MutableRefObject<HTMLElement | null>>();

  // Resolve the initial focus element inside a selector so the component
  // re-renders only when the resolved element changes, not whenever
  // `renderedItems` gets a new array identity. Returning `undefined` means
  // auto focus on show is disabled.
  const initialFocusElement = useStoreState(
    store,
    ["autoFocusOnShow", "initialFocus", "renderedItems", "compositeElement"],
    (state) => {
      if (!state.autoFocusOnShow) return;
      const isEnabled = (item: (typeof state.renderedItems)[number]) =>
        !item.disabled && !!item.element;
      switch (state.initialFocus) {
        case "first":
          return state.renderedItems.find(isEnabled)?.element || null;
        case "last":
          for (let i = state.renderedItems.length - 1; i >= 0; i -= 1) {
            const item = state.renderedItems[i];
            if (item && isEnabled(item)) {
              return item.element;
            }
          }
          return null;
        default:
          return state.compositeElement;
      }
    },
  );

  // Sets the initial focus ref.
  useEffect(() => {
    let cleaning = false;
    setInitialFocusRef((prevInitialFocusRef) => {
      if (cleaning) return;
      if (modal && prevInitialFocusRef?.current?.isConnected) {
        return prevInitialFocusRef;
      }
      if (initialFocusElement === undefined) return;
      if (
        initialFocusElement &&
        initialFocusElement === prevInitialFocusRef?.current
      ) {
        return prevInitialFocusRef;
      }
      const ref = createRef() as MutableRefObject<HTMLElement | null>;
      ref.current = initialFocusElement;
      return ref;
    });
    return () => {
      cleaning = true;
    };
  }, [modal, initialFocusElement]);

  // When the `autoFocusOnShow` prop is set to `true` (default), we'll only
  // move focus to the menu when there's an initialFocusRef set or the menu is
  // modal. Otherwise, users would have to manually call
  // store.setAutoFocusOnShow(true) every time they want to open the menu.
  // This differs from the usual dialog behavior that would automatically
  // focus on the dialog container when no initialFocusRef is set.
  const canAutoFocusOnShow = !!initialFocusRef || !!props.initialFocus || modal;
  const autoFocusOnShowProp =
    autoFocusOnShow === false ? false : canAutoFocusOnShow && autoFocusOnShow;

  // Hovercard restores focus to its positioning anchor by default. Menus use
  // their disclosure as the focus target when a separate MenuAnchor exists.
  const finalFocusElement = useStoreState(
    store,
    ["disclosureElement", "anchorElement"],
    (state) => state.disclosureElement || state.anchorElement,
  );

  // Modal menus keep their menu button in the modal context so that it stays
  // out of the `inert` subtree. Chromium refuses to read an `inert` element as
  // the menu's `aria-labelledby` target, and the button doubles as the way out
  // of the menu. https://github.com/ariakit/ariakit/issues/4270
  // The button has to be an element the application named, since a disclosure
  // the dialog captured only happened to have focus and can't be assumed to
  // close the menu. It also has to be connected, mirroring the dialog's own
  // definition of a named disclosure, and live outside the menu, otherwise the
  // menu would become an ancestor of one of its own persistent elements, which
  // the dialog reads as a nested dialog.
  const persistentDisclosure = useStoreState(
    store,
    ["disclosureElement", "contentElement"],
    (state) => {
      const { disclosureElement, contentElement } = state;
      if (!disclosureElement?.isConnected) return null;
      if (isCapturedDisclosure(disclosureElement)) return null;
      if (contentElement?.contains(disclosureElement)) return null;
      return disclosureElement;
    },
  );

  const contentElement = useStoreState(
    store.combobox || store,
    "contentElement",
  );
  const parentContentElement = useStoreState(
    parentMenu?.combobox || parentMenu,
    "contentElement",
  );

  // Anchor preserved tab order to the parent content so `aria-owns` is emitted
  // as a sibling when that parent's role cannot contain this menu role.
  // TODO: Add coverage for the aria-owns sibling path.
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
    autoFocusOnShow: autoFocusOnShowProp,
    finalFocus: finalFocusElement,
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
      // Re-fire mouseout when hover-away closes after the pointer already left
      // the button; otherwise `blurOnHoverEnd` never runs.
      fireEvent(disclosureElement, "mouseout", event);
      if (!hasFocusWithin(disclosureElement)) return true;
      // Virtual focus updates asynchronously, so the synthetic mouseout may
      // leave `hasFocusWithin` temporarily true.
      requestAnimationFrame(() => {
        if (hasFocusWithin(disclosureElement)) return;
        store?.hide();
      });
      return false;
    },
    getPersistentElements() {
      const elements = getPersistentElements?.() || [];
      if (!modal) return elements;
      if (!persistentDisclosure) return elements;
      return [...elements, persistentDisclosure];
    },
    // The menu button is already in the modal context and already closes the
    // menu, so a second dismiss affordance would be redundant. Menus without
    // one keep the dialog's, which renders next to the menu. The dialog
    // ignores this for non-modal menus, which never get one anyway.
    unstable_hiddenDismiss: !persistentDisclosure,
    // The dialog collects persistent elements from an effect that doesn't
    // otherwise depend on the disclosure, so swapping one connected disclosure
    // for another would leave the old one in the modal context and the new one
    // inert. Refresh the tree whenever the element changes. Only modal menus
    // contribute the disclosure, so leave the non-modal marking pass alone.
    // https://github.com/ariakit/ariakit/pull/7303#discussion_r3884581660
    unstable_treeSnapshotKey: modal ? persistentDisclosure : null,
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
 * [`MenuButton`](https://ariakit.com/reference/menu-button) component.
 *
 * This component uses the primitive
 * [`MenuList`](https://ariakit.com/reference/menu-list) component under the
 * hood. It renders a popover and automatically focuses on items when the menu
 * is shown.
 * @see https://ariakit.com/components/menu
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
  extends MenuListOptions<T>, Omit<HovercardOptions<T>, "store"> {
  /**
   * Determines whether the menu is modal. Modal menus have distinct states and
   * behaviors:
   * - The [`portal`](https://ariakit.com/reference/menu#portal) and
   *   [`preventBodyScroll`](https://ariakit.com/reference/menu#preventbodyscroll)
   *   props are set to `true`. They can still be manually set to `false`.
   * - When using the [`Heading`](https://ariakit.com/reference/heading) or
   *   [`MenuHeading`](https://ariakit.com/reference/menu-heading) components
   *   within the menu, their level will be reset so they start with `h1`.
   * - The [`MenuButton`](https://ariakit.com/reference/menu-button) component,
   *   or any other element assigned with
   *   [`setDisclosureElement`](https://ariakit.com/reference/use-menu-store#setdisclosureelement),
   *   is part of the modal context, so it can still label the menu and close
   *   it, and no visually hidden dismiss button is rendered for it. Menus
   *   opened without such an element, such as context menus, get one next to
   *   the menu, never inside it, where the ARIA menu pattern doesn't allow a
   *   `button`. If the element doesn't close the menu, because
   *   [`toggleOnClick`](https://ariakit.com/reference/menu-button#toggleonclick)
   *   is `false` or because it only shows the menu, render your own dismiss
   *   control as a menu item, composing
   *   [`MenuItem`](https://ariakit.com/reference/menu-item) with
   *   [`MenuDismiss`](https://ariakit.com/reference/menu-dismiss), so that
   *   assistive technology can still leave the menu.
   * - When the menu is open, the element tree outside of both the menu and its
   *   menu button will be inert.
   *
   * Live examples:
   * - [Context menu](https://ariakit.com/examples/menu-context-menu)
   * @default false
   */
  modal?: boolean;
}

export type MenuProps<T extends ElementType = TagName> = Props<
  T,
  MenuOptions<T>
>;
