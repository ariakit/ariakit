import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
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
        onMouseOver: htmlOnMouseOver,
        ...htmlProps
      }
    ) {
      const parent = React.useContext(MenuContext);
      const ref = React.useRef<HTMLElement>(null);
      // This avoids race condition between focus and click.
      // On some browsers, focus is triggered right before click.
      // So we use it to disable toggling.
      const [hasShownOnFocus, setHasShownOnFocus] = React.useState(false);
      const [dir] = options.placement.split("-");
      const hasParent = Boolean(parent);
      const parentIsMenuBar = parent && parent.role === "menubar";

      const onKeyDown = React.useMemo(
        () =>
          createOnKeyDown({
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
          dir,
          hasParent,
          options.show,
          options.hide,
          options.first,
          options.last
        ]
      );

      const onFocus = React.useCallback(() => {
        if (parentIsMenuBar) {
          setHasShownOnFocus(true);
          options.show();
        }
      }, [parentIsMenuBar, options.show]);

      // Restores hasShownOnFocus
      React.useEffect(() => {
        if (!hasShownOnFocus) return undefined;
        const id = setTimeout(() => setHasShownOnFocus(false), 200);
        return () => clearTimeout(id);
      }, [hasShownOnFocus]);

      const onMouseOver = React.useCallback(
        (event: MouseEvent) => {
          // MenuButton's don't do anything on mouse over when they aren't
          // cointained within a Menu/MenuBar
          if (!parent) return;

          const self = event.currentTarget as HTMLElement;

          if (parentIsMenuBar) {
            // if MenuButton is an item inside a MenuBar, it'll only open
            // if there's already another sibling expanded MenuButton
            const subjacentOpenMenu =
              parent.ref.current &&
              parent.ref.current.querySelector("[aria-expanded='true']");
            if (subjacentOpenMenu) {
              self.focus();
            }
          } else {
            // If it's in a Menu, open after a short delay
            // TODO: Make the delay a prop?
            setTimeout(() => {
              if (self.contains(document.activeElement)) {
                options.show();
                if (document.activeElement !== self) {
                  self.focus();
                }
              }
            }, 200);
          }
        },
        [parent, parentIsMenuBar, options.show]
      );

      // If disclosure is rendered as a menu bar item, it's toggable
      // That is, you can click on the expanded disclosure to close its menu
      // But, if disclosure has been focused, it may be result of a mouse down
      // In this case, toggling it would make it close right away on click
      // Then we check if it has been shown on focus. If so, we don't toggle
      const onClick = React.useCallback(() => {
        if (hasParent && (!parentIsMenuBar || hasShownOnFocus)) {
          options.show();
        } else {
          options.toggle();
        }
      }, [
        hasParent,
        parentIsMenuBar,
        hasShownOnFocus,
        options.show,
        options.toggle
      ]);

      return {
        ref: useForkRef(ref, htmlRef),
        "aria-haspopup": "menu",
        onClick: useAllCallbacks(onClick, htmlOnClick),
        onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
        onFocus: useAllCallbacks(onFocus, htmlOnFocus),
        onMouseOver: useAllCallbacks(onMouseOver, htmlOnMouseOver),
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
