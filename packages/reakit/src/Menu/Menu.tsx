import * as React from "react";
import { useWarning } from "reakit-warning";
import { createHook } from "reakit-system/createHook";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { contains } from "reakit-utils/contains";
import {
  PopoverOptions,
  PopoverHTMLProps,
  usePopover,
} from "../Popover/Popover";
import { MenuBarOptions, MenuBarHTMLProps, useMenuBar } from "./MenuBar";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext, MenuContextType } from "./__utils/MenuContext";

export type MenuOptions = Omit<PopoverOptions, "hideOnEsc"> &
  Pick<MenuStateReturn, "placement"> &
  MenuBarOptions;

export type MenuHTMLProps = PopoverHTMLProps & MenuBarHTMLProps;

export type MenuProps = MenuOptions & MenuHTMLProps;

function usePlacementDir(placement?: string) {
  const array = React.useMemo(() => placement?.split("-"), [placement]);
  return array?.[0];
}

export const useMenu = createHook<MenuOptions, MenuHTMLProps>({
  name: "Menu",
  compose: [useMenuBar, usePopover],
  useState: useMenuState,

  useOptions(options) {
    const parent = React.useContext(MenuContext);
    const parentIsMenuBar = parent?.role === "menubar";

    return {
      unstable_autoFocusOnShow: !parent,
      unstable_autoFocusOnHide: !parentIsMenuBar,
      modal: false,
      ...options,
      // will be handled differently from usePopover/useDialog
      hideOnEsc: false,
    };
  },

  useProps(options, { onKeyDown: htmlOnKeyDown, ...htmlProps }) {
    const onKeyDownRef = useLiveRef(htmlOnKeyDown);
    const parent = React.useContext(MenuContext);
    const hasParent = !!parent;
    let ancestorMenuBar: MenuContextType | undefined | null = parent;

    while (ancestorMenuBar && ancestorMenuBar.role !== "menubar") {
      ancestorMenuBar = ancestorMenuBar.parent;
    }

    const { next, previous, orientation } = ancestorMenuBar || {};
    const ancestorIsHorizontal = orientation === "horizontal";
    const dir = usePlacementDir(options.placement);

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: onKeyDownRef,
          stopPropagation: (event) => {
            // On Esc, only stop propagation if there's no parent menu.
            // Otherwise, pressing Esc should close all menus
            return event.key !== "Escape" && hasParent;
          },
          keyMap: ({ currentTarget, target }) => {
            const { hide } = options;
            const Escape = hide && (() => hide());
            if (hasParent && contains(currentTarget, target as Element)) {
              // Moves to the next menu button in a horizontal menu bar or
              // close the menu if it's a sub menu
              const ArrowRight =
                ancestorIsHorizontal && dir !== "left"
                  ? next && (() => next())
                  : dir === "left" && hide && (() => hide());
              const ArrowLeft =
                ancestorIsHorizontal && dir !== "right"
                  ? previous && (() => previous())
                  : dir === "right" && hide && (() => hide());
              return { Escape, ArrowRight, ArrowLeft };
            }
            return { Escape };
          },
        }),
      [hasParent, ancestorIsHorizontal, next, previous, dir, options.hide]
    );

    return { role: "menu", onKeyDown, ...htmlProps };
  },
});

export const Menu = createComponent({
  as: "div",
  useHook: useMenu,
  useCreateElement: (type, props, children) => {
    useWarning(
      !props["aria-label"] && !props["aria-labelledby"],
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/menu"
    );
    return useCreateElement(type, props, children);
  },
});
