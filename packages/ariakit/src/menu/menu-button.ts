import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
} from "react";
import { getPopupRole } from "ariakit-utils/dom";
import { useEvent, useForkRef, useId } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeTypeaheadOptions,
  useCompositeTypeahead,
} from "../composite/composite-typeahead";
import {
  HovercardAnchorOptions,
  useHovercardAnchor,
} from "../hovercard/hovercard-anchor";
import {
  PopoverDisclosureOptions,
  usePopoverDisclosure,
} from "../popover/popover-disclosure";
import { MenuBarContext, MenuContext, hasExpandedMenuButton } from "./__utils";
import { MenuState } from "./menu-state";

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
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu button that triggers a dropdown menu.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const props = useMenuButton({ state });
 * <Role {...props}>Edit</Role>
 * <Menu state={state}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const useMenuButton = createHook<MenuButtonOptions>(
  ({ state, focusable, accessibleWhenDisabled, showOnHover, ...props }) => {
    const ref = useRef<HTMLElement>(null);
    const parentMenu = useStore(MenuContext, ["items", "move"]);
    const parentMenuBar = useStore(MenuBarContext, ["items", "move"]);
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
      state.disclosureRef.current = ref.current;
    });

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLButtonElement>) => {
      onFocusProp?.(event as any);
      if (disabled) return;
      if (event.defaultPrevented) return;
      // Reset the autoFocusOnShow state so we can focus the menu button while
      // the menu is open and press arrow keys to move focus to the menu items.
      state.setAutoFocusOnShow(false);
      // We need to unset the active menu item so no menu item appears active
      // while the menu button is focused.
      state.setActiveId(null);
      // When the menu button is focused, we'll only show its menu if it's in a
      // menu bar
      if (!parentMenuBar) return;
      if (!parentIsMenuBar) return;
      // and there's already another expanded menu button.
      if (hasExpandedMenuButton(parentMenuBar.items, event.currentTarget)) {
        state.show();
      }
    });

    const dir = state.placement.split("-")[0] as BasePlacement;

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDownProp?.(event as any);
      if (disabled) return;
      if (event.defaultPrevented) return;
      const initialFocus = getInitialFocus(event, dir);
      if (initialFocus) {
        event.preventDefault();
        state.show();
        state.setAutoFocusOnShow(true);
        state.setInitialFocus(initialFocus);
      }
    });

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLButtonElement>) => {
      onClickProp?.(event as any);
      if (event.defaultPrevented) return;
      const isKeyboardClick = !event.detail;
      // When the menu button is clicked, if the menu is hidden or if it's a
      // keyboard click (enter or space),
      if (!state.open || isKeyboardClick) {
        // we'll only automatically focus on the menu if it's not a submenu
        // button, or if it's a keyboard click.
        if (!hasParentMenu || isKeyboardClick) {
          state.setAutoFocusOnShow(true);
        }
        state.setInitialFocus(isKeyboardClick ? "first" : "container");
      }
      // On submenu buttons, we can't hide the submenu by clicking on the menu
      // button again.
      if (hasParentMenu) {
        state.show();
      }
    });

    if (hasParentMenu) {
      // On Safari, VO+Space triggers a click twice on native button elements
      // with role menuitem (https://bugs.webkit.org/show_bug.cgi?id=228318).
      // So, if the menu button is rendered within a menu, we need to render it
      // as another element.
      props = { as: "div", ...props };
    }

    // We'll use this id to render the aria-labelledby attribute on the menu.
    const id = useId(props.id);

    props = {
      id,
      role: hasParentMenu || parentIsMenuBar ? "menuitem" : undefined,
      "aria-haspopup": getPopupRole(state.contentElement, "menu"),
      ...props,
      ref: useForkRef(ref, props.ref),
      onFocus,
      onKeyDown,
      onClick,
    };

    props = useHovercardAnchor({
      state,
      focusable,
      accessibleWhenDisabled,
      ...props,
      showOnHover: (event) => {
        if (typeof showOnHover === "function") return showOnHover(event);
        if (showOnHover != null) return showOnHover;
        if (hasParentMenu) return true;
        return parentIsMenuBar && hasExpandedMenuButton(parentMenuBar.items);
      },
    });

    props = usePopoverDisclosure({
      state,
      toggleOnClick: !hasParentMenu,
      focusable,
      accessibleWhenDisabled,
      ...props,
    });

    props = useCompositeTypeahead({
      state,
      typeahead: parentIsMenuBar,
      ...props,
    });

    return props;
  }
);

/**
 * A component that renders a menu button that triggers a dropdown menu.
 * Usually, this is rendered as a native `button` element, but if it's a submenu
 * button rendered as a menu item inside another menu, it'll be rendered as a
 * `div`.
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
export const MenuButton = createComponent<MenuButtonOptions>((props) => {
  const htmlProps = useMenuButton(props);
  return createElement("button", htmlProps);
});

export type MenuButtonOptions<T extends As = "button" | "div"> = Omit<
  HovercardAnchorOptions<T>,
  "state"
> &
  Omit<PopoverDisclosureOptions<T>, "state"> &
  Omit<CompositeTypeaheadOptions<T>, "state" | "typeahead"> & {
    /**
     * Object returned by the `useMenuState` hook.
     */
    state: MenuState;
    /**
     * Determines whether pressing a character key while focusing on the
     * `MenuButton` should move focus to the `MenuItem` starting with that
     * character. By default, it's `true` for menu buttons in a `MenuBar`, but
     * `false` for other menu buttons.
     */
    typeahead?: boolean;
  };

export type MenuButtonProps<T extends As = "button" | "div"> = Props<
  MenuButtonOptions<T>
>;
