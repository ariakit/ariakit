import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { createHook } from "reakit-system/createHook";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  PopoverDisclosureOptions,
  PopoverDisclosureHTMLProps,
  usePopoverDisclosure
} from "../Popover/PopoverDisclosure";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext } from "./__utils/MenuContext";

export type MenuDisclosureOptions = PopoverDisclosureOptions &
  Pick<Partial<MenuStateReturn>, "hide"> &
  Pick<MenuStateReturn, "show" | "placement" | "first" | "last">;

export type MenuDisclosureHTMLProps = PopoverDisclosureHTMLProps;

export type MenuDisclosureProps = MenuDisclosureOptions &
  MenuDisclosureHTMLProps;

const noop = () => {};

export const useMenuDisclosure = createHook<
  MenuDisclosureOptions,
  MenuDisclosureHTMLProps
>({
  name: "MenuDisclosure",
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
              ArrowUp: dir === "top" || dir === "bottom" ? options.last : false,
              ArrowRight: dir === "right" && first,
              ArrowDown: dir === "bottom" || dir === "top" ? first : false,
              ArrowLeft: dir === "left" && first
            };
          }
        }),
      [dir, hasParent, options.show, options.hide, options.first, options.last]
    );

    const onFocus = React.useCallback(() => {
      if (parentIsMenuBar) {
        setHasShownOnFocus(true);
        options.show();
      }
    }, [parentIsMenuBar, setHasShownOnFocus, options.show]);

    // Restores hasShownOnFocus
    React.useEffect(() => {
      if (hasShownOnFocus) {
        setTimeout(() => setHasShownOnFocus(false), 200);
      }
    }, [hasShownOnFocus]);

    const onMouseOver = React.useCallback(
      (event: MouseEvent) => {
        // MenuDisclosure's don't do anything on mouse over when they aren't
        // cointained within a Menu/MenuBar
        if (!parent) return;

        const disclosure = event.currentTarget as HTMLElement;

        if (parentIsMenuBar) {
          // if MenuDisclosure is an item inside a MenuBar, it'll only open
          // if there's already another sibling expanded MenuDisclosure
          const subjacentOpenMenu =
            parent.ref.current &&
            parent.ref.current.querySelector("[aria-expanded='true']");
          if (subjacentOpenMenu) {
            disclosure.focus();
          }
        } else {
          // If it's in a Menu, open after a short delay
          // TODO: Make the delay a prop?
          setTimeout(() => {
            if (disclosure.contains(document.activeElement)) {
              options.show();
              if (document.activeElement !== disclosure) {
                disclosure.focus();
              }
            }
          }, 200);
        }
      },
      [parent, parentIsMenuBar, options.show]
    );

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
      ref: mergeRefs(ref, htmlRef),
      "aria-haspopup": "menu",
      onClick: useAllCallbacks(onClick, htmlOnClick),
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      onFocus: useAllCallbacks(onFocus, htmlOnFocus),
      onMouseOver: useAllCallbacks(onMouseOver, htmlOnMouseOver),
      ...htmlProps
    };
  },

  useCompose(options, htmlProps) {
    // Toggling is handled by MenuDisclosure
    return usePopoverDisclosure({ ...options, toggle: noop }, htmlProps);
  }
});

export const MenuDisclosure = createComponent({
  as: "button",
  useHook: useMenuDisclosure
});
