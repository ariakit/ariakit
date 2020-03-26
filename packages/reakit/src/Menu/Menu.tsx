import * as React from "react";
import { warning } from "reakit-utils/warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { createHook } from "reakit-system/createHook";
import {
  PopoverOptions,
  PopoverHTMLProps,
  usePopover
} from "../Popover/Popover";
import { MenuBarOptions, MenuBarHTMLProps, useMenuBar } from "./MenuBar";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext, MenuContextType } from "./__utils/MenuContext";

export type MenuOptions = Omit<PopoverOptions, "hideOnEsc"> &
  Pick<MenuStateReturn, "placement"> &
  MenuBarOptions;

export type MenuHTMLProps = PopoverHTMLProps & MenuBarHTMLProps;

export type MenuProps = MenuOptions & MenuHTMLProps;

export const useMenu = createHook<MenuOptions, MenuHTMLProps>({
  name: "Menu",
  compose: [usePopover, useMenuBar],
  useState: useMenuState,

  useOptions(options) {
    const parent = React.useContext(MenuContext);
    const parentIsMenuBar = parent && parent.role === "menubar";

    return {
      unstable_autoFocusOnShow: !parent,
      unstable_autoFocusOnHide: !parentIsMenuBar,
      modal: false,
      ...options,
      // will be handled differently from usePopover/useDialog
      hideOnEsc: false
    };
  },

  useProps(options, { onKeyDown: htmlOnKeyDown, ...htmlProps }) {
    const parent = React.useContext(MenuContext);
    const hasParent = Boolean(parent);
    let ancestorMenuBar: MenuContextType | undefined | null = parent;

    while (ancestorMenuBar && ancestorMenuBar.role !== "menubar") {
      ancestorMenuBar = ancestorMenuBar.parent;
    }

    const { next, previous, orientation } = ancestorMenuBar || {};
    const ancestorIsHorizontal = orientation === "horizontal";
    const [dir] = (options.placement || "").split("-");

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: htmlOnKeyDown,
          stopPropagation: event => {
            return event.key !== "Escape";
          },
          keyMap: event => {
            const Escape = options.hide;
            if (
              hasParent &&
              event.currentTarget.contains(event.target as Element)
            ) {
              const ArrowRight =
                ancestorIsHorizontal && dir !== "left"
                  ? next && (() => next())
                  : dir === "left" && options.hide;
              const ArrowLeft =
                ancestorIsHorizontal && dir !== "right"
                  ? previous && (() => previous())
                  : dir === "right" && options.hide;
              return {
                Escape: options.hide,
                ArrowRight,
                ArrowLeft
              };
            }
            return { Escape };
          }
        }),
      [hasParent, ancestorIsHorizontal, next, previous, dir, options.hide]
    );

    return { role: "menu", onKeyDown, ...htmlProps };
  }
});

export const Menu = createComponent({
  as: "div",
  useHook: useMenu,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "[reakit/Menu]",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/menu"
    );
    return useCreateElement(type, props, children);
  }
});
