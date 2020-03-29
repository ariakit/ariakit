import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import {
  PopoverDisclosureOptions,
  PopoverDisclosureHTMLProps,
  usePopoverDisclosure
} from "../Popover/PopoverDisclosure";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext } from "./__utils/MenuContext";

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
      const hasParent = Boolean(parent);
      const parentIsMenuBar = parent && parent.role === "menubar";

      const onKeyDown = React.useMemo(
        () =>
          createOnKeyDown({
            onKeyDown: htmlOnKeyDown,
            stopPropagation: event => event.key !== "Escape",
            onKey: options.show,
            keyMap: () => {
              // prevents scroll jump
              const first = () => setTimeout(options.first);
              return {
                Escape: options.hide,
                Enter: hasParent && first,
                " ": hasParent && first,
                ArrowUp:
                  dir === "top" || dir === "bottom" ? options.last : false,
                ArrowRight: dir === "right" && first,
                ArrowDown: dir === "bottom" || dir === "top" ? first : false,
                ArrowLeft: dir === "left" && first
              };
            }
          }),
        [
          htmlOnKeyDown,
          dir,
          hasParent,
          options.show,
          options.hide,
          options.first,
          options.last
        ]
      );

      const onMouseEnter = React.useCallback(
        (event: MouseEvent) => {
          // MenuButton's don't do anything on mouse over when they aren't
          // cointained within a Menu/MenuBar
          if (!parent) return;

          const self = event.currentTarget as HTMLElement;

          if (parentIsMenuBar) {
            // if MenuButton is an item inside a MenuBar, it'll only open
            // if there's already another sibling expanded MenuButton
            const subjacentOpenMenu = parent.ref.current?.querySelector(
              "[aria-expanded='true']"
            );
            if (subjacentOpenMenu) {
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

      const onMouseDown = React.useCallback(() => {
        // When in menu bar, the menu button can be activated either by focus
        // or click, but we don't want both to trigger sequentially.
        // Otherwise, onClick would toggle (hide) the menu right after it got
        // shown on focus.
        hasPressedMouse.current = true;
      }, []);

      const onFocus = React.useCallback(() => {
        if (parentIsMenuBar && !hasPressedMouse.current) {
          options.show?.();
        }
      }, [parentIsMenuBar, options.show]);

      // If disclosure is rendered as a menu bar item, it's toggable
      // That is, you can click on the expanded disclosure to close its menu.
      const onClick = React.useCallback(() => {
        if (hasParent && !parentIsMenuBar) {
          options.show?.();
        } else {
          options.toggle?.();
        }
        hasPressedMouse.current = false;
      }, [hasParent, parentIsMenuBar, options.show, options.toggle]);

      return {
        ref: useForkRef(ref, htmlRef),
        "aria-haspopup": "menu",
        onKeyDown,
        onMouseEnter: useAllCallbacks(onMouseEnter, htmlOnMouseEnter),
        onMouseDown: useAllCallbacks(onMouseDown, htmlOnMouseDown),
        onFocus: useAllCallbacks(onFocus, htmlOnFocus),
        onClick: useAllCallbacks(onClick, htmlOnClick),
        ...htmlProps
      };
    },

    useComposeOptions(options) {
      return {
        ...options,
        // Toggling is handled by MenuButton
        toggle: noop
      };
    }
  }
);

export const MenuButton = createComponent({
  as: "button",
  useHook: useMenuButton
});
