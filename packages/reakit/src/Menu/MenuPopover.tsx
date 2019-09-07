import * as React from "react";
import { warning } from "reakit-utils/warning";
import { Omit } from "reakit-utils/types";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createOnKeyDown } from "reakit-utils/createOnKeyDown";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  PopoverOptions,
  PopoverHTMLProps,
  usePopover
} from "../Popover/Popover";
import {
  StaticMenuOptions,
  StaticMenuHTMLProps,
  useStaticMenu
} from "./__Menu";
import {
  useMenuPopoverState,
  MenuPopoverStateReturn
} from "./MenuPopoverState";
import { MenuContext, MenuContextType } from "./__utils/MenuContext";

export type MenuPopoverOptions = Omit<
  PopoverOptions,
  "modal" | "unstable_portal" | "unstable_orphan" | "hideOnEsc"
> &
  Pick<MenuPopoverStateReturn, "placement"> &
  Pick<Partial<MenuPopoverStateReturn>, "first" | "last"> &
  StaticMenuOptions;

export type MenuPopoverHTMLProps = PopoverHTMLProps & StaticMenuHTMLProps;

export type MenuPopoverProps = MenuPopoverOptions & MenuPopoverHTMLProps;

export const useMenuPopover = createHook<
  MenuPopoverOptions,
  MenuPopoverHTMLProps
>({
  name: "MenuPopover",
  compose: [useStaticMenu, usePopover],
  useState: useMenuPopoverState,

  useOptions(options) {
    const parent = React.useContext(MenuContext);
    const parentIsHorizontal = parent && parent.orientation === "horizontal";

    return {
      unstable_autoFocusOnShow: !parent,
      unstable_autoFocusOnHide: !parentIsHorizontal,
      ...options
    };
  },

  useProps(options, { onKeyDown: htmlOnKeyDown, ...htmlProps }) {
    const parent = React.useContext(MenuContext);
    const isHorizontal = options.orientation === "horizontal";
    const isVertical = options.orientation === "vertical";
    let horizontalParent: MenuContextType | undefined | null = parent;

    while (horizontalParent && horizontalParent.orientation !== "horizontal") {
      horizontalParent = horizontalParent.parent;
    }

    const [dir] = options.placement.split("-");

    const rovingBindings = React.useMemo(
      () =>
        createOnKeyDown({
          stopPropagation: event => {
            // On Esc, only stop propagation if there's no parent menu
            // Otherwise, pressing Esc should close all menus
            if (event.key === "Escape" && parent) return false;
            return true;
          },
          keyMap: event => {
            const targetIsMenuPopover = event.target === event.currentTarget;
            return {
              Escape: options.hide,
              ArrowUp: targetIsMenuPopover && !isHorizontal && options.last,
              ArrowRight: targetIsMenuPopover && !isVertical && options.first,
              ArrowDown: targetIsMenuPopover && !isHorizontal && options.first,
              ArrowLeft: targetIsMenuPopover && !isVertical && options.last,
              Home: targetIsMenuPopover && options.first,
              End: targetIsMenuPopover && options.last,
              PageUp: targetIsMenuPopover && options.first,
              PageDown: targetIsMenuPopover && options.last
            };
          }
        }),
      [
        Boolean(parent),
        isHorizontal,
        isVertical,
        options.hide,
        options.last,
        options.first
      ]
    );

    const parentBindings = React.useMemo(
      () =>
        createOnKeyDown({
          stopPropagation: true,
          shouldKeyDown: event => {
            return Boolean(
              // https://github.com/facebook/react/issues/11387
              parent && event.currentTarget.contains(event.target as Element)
            );
          },
          keyMap: parent
            ? {
                ArrowRight:
                  horizontalParent && dir !== "left"
                    ? horizontalParent.next
                    : dir === "left" && options.hide,
                ArrowLeft:
                  horizontalParent && dir !== "right"
                    ? horizontalParent.previous
                    : dir === "right" && options.hide
              }
            : {}
        }),
      [
        Boolean(parent),
        horizontalParent && horizontalParent.next,
        horizontalParent && horizontalParent.previous,
        dir,
        options.hide
      ]
    );

    return {
      role: "menu",
      onKeyDown: useAllCallbacks(rovingBindings, parentBindings, htmlOnKeyDown),
      ...htmlProps
    };
  },

  useCompose(options, htmlProps) {
    htmlProps = useStaticMenu(options, htmlProps);
    return usePopover(
      {
        ...options,
        modal: false,
        unstable_portal: false,
        unstable_orphan: false,
        hideOnEsc: false
      },
      htmlProps
    );
  }
});

export const MenuPopover = createComponent({
  as: "div",
  useHook: useMenuPopover,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "MenuPopover",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/menu"
    );
    return useCreateElement(type, props, children);
  }
});
