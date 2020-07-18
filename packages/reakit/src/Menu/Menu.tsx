import * as React from "react";
import { useWarning, warning } from "reakit-warning";
import { createHook } from "reakit-system/createHook";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { contains } from "reakit-utils/contains";
import { useForkRef } from "reakit-utils/useForkRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import { useUpdateEffect } from "reakit-utils/useUpdateEffect";
import {
  PopoverOptions,
  PopoverHTMLProps,
  usePopover,
} from "../Popover/Popover";
import { MenuBarOptions, MenuBarHTMLProps, useMenuBar } from "./MenuBar";
import { MenuStateReturn } from "./MenuState";
import { MenuContext, MenuContextType } from "./__utils/MenuContext";
import { MENU_KEYS } from "./__keys";

export type MenuOptions = Omit<PopoverOptions, "hideOnEsc"> &
  Pick<MenuStateReturn, "placement"> &
  MenuBarOptions;

export type MenuHTMLProps = PopoverHTMLProps & MenuBarHTMLProps;

export type MenuProps = MenuOptions & MenuHTMLProps;

function usePlacementDir(placement?: string) {
  return React.useMemo(() => placement?.split("-")?.[0], [placement]);
}

export const useMenu = createHook<MenuOptions, MenuHTMLProps>({
  name: "Menu",
  compose: [useMenuBar, usePopover],
  keys: MENU_KEYS,

  useOptions(options) {
    const parent = React.useContext(MenuContext);
    const parentIsMenuBar = parent?.role === "menubar";

    return {
      unstable_autoFocusOnHide: !parentIsMenuBar,
      modal: false,
      ...options,
      unstable_autoFocusOnShow: false,
      // will be handled differently from usePopover/useDialog
      hideOnEsc: false,
    };
  },

  useProps(options, { ref: htmlRef, onKeyDown: htmlOnKeyDown, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
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

    useUpdateEffect(() => {
      if (hasParent) return;
      if (!options.visible) return;
      const self = ref.current;
      if (!self) {
        warning(
          true,
          "Can't focus the menu element because `ref` wasn't passed to the component",
          "See https://reakit.io/docs/menu"
        );
        return;
      }
      if (hasFocusWithin(self)) return;
      self.focus();
    }, [options.visible, hasParent]);

    const onKeyDown = React.useMemo(
      () =>
        createOnKeyDown({
          onKeyDown: onKeyDownRef,
          stopPropagation: (event) => {
            // On Esc, only stop propagation if there's no parent menu.
            // Otherwise, pressing Esc should close all menus
            if (hasParent) {
              return event.key !== "Escape";
            }
            return event.key === "Escape";
          },
          keyMap: ({ currentTarget, target }) => {
            const { hide } = options;
            const close = hide && (() => hide());
            if (hasParent && contains(currentTarget, target as Element)) {
              // Moves to the next menu button in a horizontal menu bar or
              // close the menu if it's a sub menu
              const ArrowRight =
                ancestorIsHorizontal && dir !== "left"
                  ? next && (() => next())
                  : dir === "left" && close;
              const ArrowLeft =
                ancestorIsHorizontal && dir !== "right"
                  ? previous && (() => previous())
                  : dir === "right" && close;
              return { Escape: close, ArrowRight, ArrowLeft };
            }
            return { Escape: close };
          },
        }),
      [hasParent, ancestorIsHorizontal, next, previous, dir, options.hide]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      role: "menu",
      onKeyDown,
      ...htmlProps,
    };
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
