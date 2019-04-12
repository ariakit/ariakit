import * as React from "react";
import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { useShortcuts } from "./__utils/useShortcuts";
import { MenuStateReturn, useMenuState } from "./MenuState";

export type StaticMenuOptions = BoxOptions &
  Pick<Partial<MenuStateReturn>, "orientation"> &
  Pick<MenuStateReturn, "unstable_stops" | "unstable_move">;

export type StaticMenuProps = BoxProps;

export function useStaticMenu(
  options: StaticMenuOptions,
  htmlProps: StaticMenuProps = {}
) {
  const ref = React.useRef<HTMLElement>(null);
  options = unstable_useOptions("useStaticMenu", options, htmlProps);

  const onKeyDown = useShortcuts(options);

  htmlProps = mergeProps(
    {
      ref,
      role: options.orientation === "horizontal" ? "menubar" : "menu",
      "aria-orientation": options.orientation,
      onMouseOver: event => {
        const target = event.target as HTMLElement;
        if (target === ref.current) {
          options.unstable_move(null);
          target.focus();
        }
      },
      onKeyDown
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useStaticMenu", options, htmlProps);
  return htmlProps;
}

const keys: Keys<MenuStateReturn & StaticMenuOptions> = [
  ...useBox.__keys,
  ...useMenuState.__keys
];

useStaticMenu.__keys = keys;

export const StaticMenu = unstable_createComponent({
  as: "div",
  useHook: useStaticMenu,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] &&
        !props["aria-labelledby"] &&
        props.role !== "menubar",
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-13`,
      "Menu"
    );

    return unstable_useCreateElement(type, props, children);
  }
});
