import {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { BasePlacement } from "@popperjs/core";
import { getPopupRole } from "ariakit-utils/dom";
import { useEventCallback, useForkRef } from "ariakit-utils/hooks";
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
import { MenuBarContext, useParentMenu } from "./__utils";
import { MenuState } from "./menu-state";

function hasExpandedMenuButton(
  items: MenuState["items"],
  currentElement?: Element
) {
  return items
    .filter((item) => item.ref.current !== currentElement)
    .some((item) => item.ref.current?.getAttribute("aria-expanded") === "true");
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
  ({ state, focusable, accessibleWhenDisabled, ...props }) => {
    const ref = useRef<HTMLElement>(null);
    const parentMenu = useParentMenu(["items", "move"]);
    const parentMenuBar = useStore(MenuBarContext, ["items", "move"]);
    const hasParentMenu = !!parentMenu;
    const parentIsMenuBar = !!parentMenuBar && !hasParentMenu;
    const disabled = props.disabled || props["aria-disabled"];

    useEffect(() => {
      // state.disclosureRef.current = ref.current;
    });

    const onMouseMoveCaptureProp = useEventCallback(props.onMouseMoveCapture);

    const onMouseMoveCapture = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onMouseMoveCaptureProp(event);
        if (event.defaultPrevented) return;
        if (disabled) return;
        if (parentIsMenuBar && hasExpandedMenuButton(parentMenuBar.items)) {
          // event.currentTarget.focus();
        }
        if (hasParentMenu) {
          // event.currentTarget.focus();
          state.setActiveId(null);
        }
      },
      [
        onMouseMoveCaptureProp,
        disabled,
        hasParentMenu,
        parentMenuBar,
        parentIsMenuBar,
      ]
    );

    const onFocusProp = useEventCallback(props.onFocus);

    const onFocus = useCallback(
      (event: FocusEvent<HTMLButtonElement>) => {
        onFocusProp(event);
        if (event.defaultPrevented) return;
        if (disabled) return;
        // When the menu button is focused, we'll only show its menu if it's in
        // a menu bar
        if (!parentMenuBar) return;
        if (!parentIsMenuBar) return;
        // and there's already another expanded menu button.
        if (hasExpandedMenuButton(parentMenuBar.items, event.currentTarget)) {
          state.show();
        }
      },
      [onFocusProp, disabled, parentMenuBar, parentIsMenuBar, state.show]
    );

    const onKeyDownProp = useEventCallback(props.onKeyDown);
    const dir = state.placement.split("-")[0] as BasePlacement;

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        const keyMap = {
          ArrowDown: dir === "bottom" || dir === "top" ? "first" : false,
          ArrowUp: dir === "bottom" || dir === "top" ? "last" : false,
          ArrowRight: dir === "right" ? "first" : false,
          ArrowLeft: dir === "left" ? "first" : false,
        } as const;
        const initialFocus = keyMap[event.key as keyof typeof keyMap];
        if (initialFocus) {
          event.preventDefault();
          state.show();
          state.setAutoFocusOnShow(true);
          state.setInitialFocus(initialFocus);
        }
      },
      [
        onKeyDownProp,
        dir,
        state.show,
        state.setAutoFocusOnShow,
        state.setInitialFocus,
      ]
    );

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        // if (state.mounted) return;
        // if (!parentIsMenuBar) {
        state.setAutoFocusOnShow(true);
        state.setInitialFocus(event.detail ? "container" : "first");
        // }
        if (hasParentMenu && !parentIsMenuBar) {
          state.show();
        }
      },
      [
        onClickProp,
        state.mounted,
        parentIsMenuBar,
        state.setAutoFocusOnShow,
        state.setInitialFocus,
        hasParentMenu,
        state.show,
      ]
    );

    if (hasParentMenu) {
      // On Safari, VO+Space triggers a click twice on native button elements
      // with role menuitem (https://bugs.webkit.org/show_bug.cgi?id=228318).
      // So, if the menu button is rendered within a menu, we need to render it
      // as another element.
      props = { as: "div", ...props };
    }

    props = {
      "aria-haspopup": getPopupRole(state.contentElement, "menu"),
      ...props,
      ref: useForkRef(ref, props.ref),
      onMouseMoveCapture,
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
        // TODO: Call props.showOnHover
        if (
          hasParentMenu ||
          (parentIsMenuBar && hasExpandedMenuButton(parentMenuBar.items))
        ) {
          return true;
        }
        return false;
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
