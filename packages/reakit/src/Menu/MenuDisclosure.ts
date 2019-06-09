import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { warning } from "reakit-utils/warning";
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

    // Restores hasShownOnFocus
    React.useEffect(() => {
      if (hasShownOnFocus) {
        setTimeout(() => setHasShownOnFocus(false), 200);
      }
    }, [hasShownOnFocus]);

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
              Enter: parent && first,
              " ": parent && first,
              ArrowUp: dir === "top" || dir === "bottom" ? options.last : false,
              ArrowRight: dir === "right" && first,
              ArrowDown: dir === "bottom" || dir === "top" ? first : false,
              ArrowLeft: dir === "left" && first
            };
          }
        }),
      [options.show, options.hide, options.first, options.last]
    );

    const onFocus = React.useCallback(() => {
      if (parent && parent.orientation === "horizontal") {
        setHasShownOnFocus(true);
        options.show();
      }
    }, [parent && parent.orientation, setHasShownOnFocus, options.show]);

    const onMouseOver = React.useCallback(() => {
      if (!parent) return;

      if (!ref.current) {
        warning(
          true,
          "MenuDisclosure",
          "Can't respond to mouse over on `MenuDisclosure` because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/menu"
        );
        return;
      }

      const parentIsHorizontal = parent.orientation === "horizontal";

      if (!parentIsHorizontal) {
        setTimeout(() => {
          if (ref.current && ref.current.contains(document.activeElement)) {
            options.show();
            ref.current.focus();
          }
        }, 200);
      } else {
        const parentMenu = ref.current.closest("[role=menu],[role=menubar]");
        const subjacentOpenMenu =
          parentMenu && parentMenu.querySelector("[role=menu]:not([hidden])");
        if (subjacentOpenMenu) {
          ref.current.focus();
        }
      }
    }, [parent && parent.orientation, options.show]);

    const onClick = React.useCallback(() => {
      if (parent && (parent.orientation !== "horizontal" || hasShownOnFocus)) {
        options.show();
      } else {
        options.toggle();
      }
    }, [
      parent && parent.orientation,
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
