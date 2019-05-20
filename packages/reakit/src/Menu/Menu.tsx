import * as React from "react";
import { warning } from "../__utils/warning";
import { Omit } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import {
  PopoverOptions,
  PopoverHTMLProps,
  usePopover
} from "../Popover/Popover";
import { createOnKeyDown } from "../__utils/createOnKeyDown";
import { unstable_createHook } from "../utils/createHook";
import { mergeRefs } from "../__utils/mergeRefs";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
import {
  StaticMenuOptions,
  StaticMenuHTMLProps,
  useStaticMenu
} from "./StaticMenu";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext, MenuContextType } from "./__utils/MenuContext";

export type MenuOptions = Omit<
  PopoverOptions,
  "modal" | "unstable_portal" | "unstable_orphan" | "hideOnEsc"
> &
  Pick<MenuStateReturn, "placement"> &
  Pick<Partial<MenuStateReturn>, "first" | "last"> &
  StaticMenuOptions;

export type MenuHTMLProps = PopoverHTMLProps & StaticMenuHTMLProps;

export type MenuProps = MenuOptions & MenuHTMLProps;

export const useMenu = unstable_createHook<MenuOptions, MenuHTMLProps>({
  name: "Menu",
  compose: [useStaticMenu, usePopover],
  useState: useMenuState,

  propsAreEqual(prev, next) {
    if (prev.visible === false && next.visible === false) {
      return true;
    }
    return null;
  },

  useOptions(options) {
    const parent = React.useContext(MenuContext);
    const parentIsHorizontal = parent && parent.orientation === "horizontal";

    return {
      unstable_autoFocusOnShow: !parent,
      unstable_autoFocusOnHide: !parentIsHorizontal,
      ...options
    };
  },

  useProps(options, { ref: htmlRef, onKeyDown: htmlOnKeyDown, ...htmlProps }) {
    const parent = React.useContext(MenuContext);
    const ref = React.useRef<HTMLElement>(null);

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
            warning(
              !ref.current,
              "Can't detect arrow keys because `ref` wasn't passed to component. See https://reakit.io/docs/menu",
              "Menu"
            );
            const targetIsMenu = event.target === ref.current;
            return {
              Escape: options.hide,
              ArrowUp: targetIsMenu && !isHorizontal && options.last,
              ArrowRight: targetIsMenu && !isVertical && options.first,
              ArrowDown: targetIsMenu && !isHorizontal && options.first,
              ArrowLeft: targetIsMenu && !isVertical && options.last,
              Home: targetIsMenu && options.first,
              End: targetIsMenu && options.last,
              PageUp: targetIsMenu && options.first,
              PageDown: targetIsMenu && options.last
            };
          }
        }),
      [parent, options.hide, options.last, options.first]
    );

    const parentBindings = React.useMemo(
      () =>
        createOnKeyDown({
          stopPropagation: true,
          shouldKeyDown: event => {
            return Boolean(
              parent &&
                ref.current &&
                ref.current.contains(event.target as Element)
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
      ref: mergeRefs(ref, htmlRef),
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

export const Menu = unstable_createComponent({
  as: "div",
  useHook: useMenu,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "You should provide either `aria-label` or `aria-labelledby` props. See https://reakit.io/docs/menu",
      "Menu"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
