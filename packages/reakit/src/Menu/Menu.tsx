import * as React from "react";

import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { useHook } from "../system/useHook";
import { Portal } from "../Portal/Portal";
import {
  unstable_PopoverOptions,
  unstable_PopoverProps,
  usePopover
} from "../Popover/Popover";

import {
  unstable_StaticMenuOptions,
  unstable_StaticMenuProps,
  useStaticMenu
} from "./StaticMenu";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuOptions = unstable_PopoverOptions &
  unstable_StaticMenuOptions &
  Partial<unstable_MenuStateReturn>;

export type unstable_MenuProps = unstable_PopoverProps &
  unstable_StaticMenuProps;

export function useMenu(
  options: unstable_MenuOptions,
  htmlProps: unstable_MenuProps = {}
) {
  const allOptions = {
    autoFocusOnShow:
      !options.parent || options.parent.orientation !== "horizontal",
    ...options
  };

  htmlProps = mergeProps({ role: "menu" } as typeof htmlProps, htmlProps);
  htmlProps = useStaticMenu(allOptions, htmlProps);
  htmlProps = usePopover(allOptions, htmlProps);
  htmlProps = useHook("useMenu", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_MenuOptions> = [
  ...usePopover.keys,
  ...useStaticMenu.keys,
  ...useMenuState.keys
];

useMenu.keys = keys;

export const Menu = unstable_createComponent(
  "div",
  useMenu,
  (type, props, children) => {
    warning(
      props["aria-label"] || props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-13`,
      "Menu"
    );

    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
