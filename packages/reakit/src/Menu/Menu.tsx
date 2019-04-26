import * as React from "react";
import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { Keys, Omit } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { PopoverOptions, PopoverProps, usePopover } from "../Popover/Popover";
import { createOnKeyDown } from "../__utils/createOnKeyDown";
import {
  StaticMenuOptions,
  StaticMenuProps,
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

export type MenuProps = PopoverProps & StaticMenuProps;

export function useMenu(options: MenuOptions, htmlProps: MenuProps = {}) {
  const parent = React.useContext(MenuContext);
  const parentIsHorizontal = parent && parent.orientation === "horizontal";
  const ref = React.useRef<HTMLElement>(null);

  let _options: MenuOptions = {
    unstable_autoFocusOnShow: !parent,
    unstable_autoFocusOnHide: !parentIsHorizontal,
    ...options
  };

  _options = unstable_useOptions("Menu", _options, htmlProps);

  const isHorizontal = _options.orientation === "horizontal";
  const isVertical = _options.orientation === "vertical";

  let horizontalParent: MenuContextType | undefined | null = parent;

  while (horizontalParent && horizontalParent.orientation !== "horizontal") {
    horizontalParent = horizontalParent.parent;
  }

  const [dir] = _options.placement.split("-");

  const rovingBindings = createOnKeyDown({
    stopPropagation: event => {
      // On Esc, only stop propagation if there's no parent menu
      // Otherwise, pressing Esc should close all menus
      if (event.key === "Escape" && parent) return false;
      return true;
    },
    keyMap: event => {
      const targetIsMenu = event.target === ref.current;
      return {
        Escape: _options.hide,
        ArrowUp: targetIsMenu && !isHorizontal && _options.last,
        ArrowRight: targetIsMenu && !isVertical && _options.first,
        ArrowDown: targetIsMenu && !isHorizontal && _options.first,
        ArrowLeft: targetIsMenu && !isVertical && _options.last,
        Home: targetIsMenu && _options.first,
        End: targetIsMenu && _options.last,
        PageUp: targetIsMenu && _options.first,
        PageDown: targetIsMenu && _options.last
      };
    }
  });

  const parentBindings = createOnKeyDown({
    stopPropagation: true,
    keyMap: parent
      ? {
          ArrowRight:
            horizontalParent && dir !== "left"
              ? horizontalParent.next
              : dir === "left" && _options.hide,
          ArrowLeft:
            horizontalParent && dir !== "right"
              ? horizontalParent.previous
              : dir === "right" && _options.hide
        }
      : {}
  });

  htmlProps = mergeProps(
    {
      ref,
      role: "menu",
      onKeyDown: event => {
        rovingBindings(event);
        parentBindings(event);
      }
    } as MenuProps,
    htmlProps
  );

  htmlProps = unstable_useProps("Menu", _options, htmlProps);
  htmlProps = useStaticMenu(_options, htmlProps);
  htmlProps = usePopover(
    {
      ..._options,
      modal: false,
      unstable_portal: false,
      unstable_orphan: false,
      hideOnEsc: false
    },
    htmlProps
  );
  return htmlProps;
}

const keys: Keys<MenuStateReturn & PopoverOptions & MenuOptions> = [
  ...usePopover.__keys,
  ...useStaticMenu.__keys,
  ...useMenuState.__keys
];

useMenu.__keys = keys;

export const Menu = unstable_createComponent({
  as: "div",
  useHook: useMenu,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-13`,
      "Menu"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
