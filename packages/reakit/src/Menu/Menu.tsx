import * as React from "react";
import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { Keys } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { PopoverOptions, PopoverProps, usePopover } from "../Popover/Popover";
import {
  StaticMenuOptions,
  StaticMenuProps,
  useStaticMenu
} from "./StaticMenu";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext } from "./__utils/MenuContext";

export type MenuOptions = PopoverOptions & StaticMenuOptions;

export type MenuProps = PopoverProps & StaticMenuProps;

export function useMenu(options: MenuOptions, htmlProps: MenuProps = {}) {
  const parent = React.useContext(MenuContext);
  const parentIsHorizontal = parent && parent.orientation === "horizontal";

  let _options: MenuOptions = {
    unstable_autoFocusOnShow: !parent,
    unstable_autoFocusOnHide: !parentIsHorizontal,
    ...options,
    modal: false,
    // We'll handle esc differently
    hideOnEsc: false
  };

  _options = unstable_useOptions("useMenu", _options, htmlProps);

  htmlProps = mergeProps(
    {
      role: "menu",
      onKeyDown: event => {
        if (event.key === "Escape" && _options.hide) {
          // Only stop propagtion if there's no parent menu
          // Otherwise, pressing Esc should close all menus
          if (!parent) {
            event.stopPropagation();
          }
          _options.hide();
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useStaticMenu(_options, htmlProps);
  htmlProps = usePopover(_options, htmlProps);
  htmlProps = unstable_useProps("useMenu", _options, htmlProps);
  return htmlProps;
}

const keys: Keys<MenuStateReturn & MenuOptions> = [
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
