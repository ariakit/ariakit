import * as React from "react";
import { createHook } from "reakit-system/createHook";
import { createComponent } from "reakit-system/createComponent";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { useLiveRef } from "reakit-utils/useLiveRef";
import {
  PopoverDisclosureOptions,
  PopoverDisclosureHTMLProps,
  usePopoverDisclosure,
} from "../Popover/PopoverDisclosure";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext } from "./__utils/MenuContext";
import { findVisibleSubmenu } from "./__utils/findVisibleSubmenu";

export type MenuButtonOptions = PopoverDisclosureOptions &
  Pick<Partial<MenuStateReturn>, "hide"> &
  Pick<MenuStateReturn, "show" | "placement" | "first" | "last">;

export type MenuButtonHTMLProps = PopoverDisclosureHTMLProps;

export type MenuButtonProps = MenuButtonOptions & MenuButtonHTMLProps;

const noop = () => {};

export const useMenuButton = createHook<MenuButtonOptions, MenuButtonHTMLProps>(
  {
    name: "MenuButton",
    compose: usePopoverDisclosure,
    useState: useMenuState,

    useProps(
      options,
      {
        ref: htmlRef,
        onClick: htmlOnClick,
        onKeyDown: htmlOnKeyDown,
        onFocus: htmlOnFocus,
        onMouseEnter: htmlOnMouseEnter,
        onMouseDown: htmlOnMouseDown,
        ...htmlProps
      }
    ) {
      const parent = React.useContext(MenuContext);
      const ref = React.useRef<HTMLElement>(null);
      const hasPressedMouse = React.useRef(false);
      const [dir] = options.placement.split("-");
      const hasParent = !!parent;
      const parentIsMenuBar = parent?.role === "menubar";
      const disabled = options.disabled || htmlProps["aria-disabled"];
      const onClickRef = useLiveRef(htmlOnClick);
      const onKeyDownRef = useLiveRef(htmlOnKeyDown);
      const onFocusRef = useLiveRef(htmlOnFocus);
      const onMouseEnterRef = useLiveRef(htmlOnMouseEnter);
      const onMouseDownRef = useLiveRef(htmlOnMouseDown);

      const onKeyDown = React.useMemo(
        () =>
          createOnKeyDown({
            onKeyDown: onKeyDownRef,
            // Doesn't prevent default on Escape, otherwise we can't close
            // dialogs when MenuButton is focused
            preventDefault: (event) => event.key !== "Escape",
            stopPropagation: (event) => event.key !== "Escape",
            shouldKeyDown: (event) => event.key === "Escape" || !disabled,
            onKey: () => options.show(),
            keyMap: () => {
              // prevents scroll jump
              const first = options.first && (() => setTimeout(options.first));
              const hide = options.hide && (() => options.hide?.());
              const last = options.last && (() => options.last());
              return {
                Escape: hide,
                Enter: hasParent && first,
                " ": hasParent && first,
                ArrowUp: dir === "top" || dir === "bottom" ? last : false,
                ArrowRight: dir === "right" && first,
                ArrowDown: dir === "bottom" || dir === "top" ? first : false,
                ArrowLeft: dir === "left" && first,
              };
            },
          }),
        [
          disabled,
          dir,
          hasParent,
          options.show,
          options.hide,
          options.first,
          options.last,
        ]
      );

      const onMouseEnter = React.useCallback(
        (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
          onMouseEnterRef.current?.(event);
          if (event.defaultPrevented) return;
          // MenuButton's don't do anything on mouse over when they aren't
          // cointained within a Menu/MenuBar
          if (!parent) return;
          const self = event.currentTarget;
          if (parentIsMenuBar) {
            // if MenuButton is an item inside a MenuBar, it'll only open
            // if there's already another sibling expanded MenuButton
            if (findVisibleSubmenu(parent.children)) {
              self.focus();
            }
          } else {
            // If it's in a Menu, open after a short delay
            // TODO: Make the delay a prop?
            setTimeout(() => {
              if (hasFocusWithin(self)) {
                options.show?.();
              }
            }, 200);
          }
        },
        [parent, parentIsMenuBar, options.show]
      );

      const onMouseDown = React.useCallback((event: React.MouseEvent) => {
        // When in menu bar, the menu button can be activated either by focus
        // or click, but we don't want both to trigger sequentially.
        // Otherwise, onClick would toggle (hide) the menu right after it got
        // shown on focus.
        hasPressedMouse.current = true;
        onMouseDownRef.current?.(event);
      }, []);

      const onFocus = React.useCallback(
        (event: React.FocusEvent) => {
          onFocusRef.current?.(event);
          if (event.defaultPrevented) return;
          if (disabled) return;
          if (parentIsMenuBar && !hasPressedMouse.current) {
            options.show?.();
          }
        },
        [parentIsMenuBar, options.show, disabled]
      );

      // If disclosure is rendered as a menu bar item, it's toggable
      // That is, you can click on the expanded disclosure to close its menu.
      const onClick = React.useCallback(
        (event: React.MouseEvent) => {
          onClickRef.current?.(event);
          if (event.defaultPrevented) return;
          if (hasParent && !parentIsMenuBar) {
            options.show?.();
          } else {
            options.toggle?.();
          }
          hasPressedMouse.current = false;
        },
        [hasParent, parentIsMenuBar, options.show, options.toggle]
      );

      return {
        ref: useForkRef(ref, htmlRef),
        "aria-haspopup": "menu",
        onKeyDown,
        onMouseEnter,
        onMouseDown,
        onFocus,
        onClick,
        ...htmlProps,
      };
    },

    useComposeOptions(options) {
      return {
        ...options,
        // Toggling is handled by MenuButton
        toggle: noop,
      };
    },
  }
);

export const MenuButton = createComponent({
  as: "button",
  memo: true,
  useHook: useMenuButton,
});
