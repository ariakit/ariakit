import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { warning } from "reakit-utils/warning";
import { createHook } from "reakit-system/createHook";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { RoverOptions, RoverHTMLProps, useRover } from "../Rover/Rover";
import { isTouchDevice } from "./__utils/isTouchDevice";
import { useMenuState, MenuStateReturn } from "./MenuState";

export type MenuItemOptions = RoverOptions &
  Pick<Partial<MenuStateReturn>, "visible" | "hide" | "placement"> &
  Pick<MenuStateReturn, "next" | "previous" | "move">;

export type MenuItemHTMLProps = RoverHTMLProps;

export type MenuItemProps = MenuItemOptions & MenuItemHTMLProps;

export const useMenuItem = createHook<MenuItemOptions, MenuItemHTMLProps>({
  name: "MenuItem",
  compose: useRover,
  useState: useMenuState,

  useProps(
    options,
    {
      ref: htmlRef,
      onMouseOver: htmlOnMouseOver,
      onMouseOut: htmlOnMouseOut,
      ...htmlProps
    }
  ) {
    const ref = React.useRef<HTMLElement>(null);

    const onMouseOver = React.useCallback(() => {
      if (options.orientation !== "horizontal" && !isTouchDevice()) {
        if (!ref.current) {
          warning(
            true,
            "MenuItem",
            "Can't respond to mouse over on `MenuItem` because `ref` wasn't passed to component.",
            "See https://reakit.io/docs/menu"
          );
          return;
        }
        ref.current.focus();
      }
    }, [options.orientation]);

    const onMouseOut = React.useCallback(() => {
      if (ref.current) {
        // Ignores disclosure
        if (
          !ref.current.hasAttribute("aria-controls") ||
          ref.current.getAttribute("aria-expanded") !== "true"
        ) {
          ref.current.blur();
        }
        const menu = ref.current.closest(
          "[role=menu],[role=menubar]"
        ) as HTMLElement;
        if (menu) {
          const nestedMenu = menu.querySelector(
            "[role=menu]:not([hidden]),[role=menubar]:not([hidden])"
          );
          if (!nestedMenu && !isTouchDevice()) {
            options.move(null);
            menu.focus();
          }
        }
      }
    }, [options.move]);

    return {
      ref: mergeRefs(ref, htmlRef),
      role: "menuitem",
      onMouseOver: useAllCallbacks(onMouseOver, htmlOnMouseOver),
      onMouseOut: useAllCallbacks(onMouseOut, htmlOnMouseOut),
      ...htmlProps
    };
  }
});

export const MenuItem = createComponent({
  as: "button",
  useHook: useMenuItem
});
