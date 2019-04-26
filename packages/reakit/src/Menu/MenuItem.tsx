import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { RoverOptions, RoverProps, useRover } from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { useMenuState, MenuStateReturn } from "./MenuState";

export type MenuItemOptions = RoverOptions &
  Pick<Partial<MenuStateReturn>, "hide" | "placement"> &
  Pick<MenuStateReturn, "next" | "previous" | "move">;

export type MenuItemProps = RoverProps;

export function useMenuItem(
  options: MenuItemOptions,
  htmlProps: MenuItemProps = {}
) {
  const ref = React.useRef<HTMLElement>(null);
  options = unstable_useOptions("MenuItem", options, htmlProps);

  htmlProps = mergeProps(
    {
      ref,
      role: "menuitem",
      onMouseOver: () => {
        if (options.orientation !== "horizontal" && ref.current) {
          ref.current.focus();
        }
      },
      onMouseOut: () => {
        if (ref.current) {
          ref.current.blur();
          const menu = ref.current.closest(
            "[role=menu],[role=menubar]"
          ) as HTMLElement;
          if (menu) {
            const nestedMenu = menu.querySelector(
              "[role=menu][aria-hidden=false],[role=menubar][aria-hidden=false]"
            );
            if (!nestedMenu) {
              options.move(null);
              menu.focus();
            }
          }
        }
      }
    } as MenuItemProps,
    htmlProps
  );

  htmlProps = unstable_useProps("MenuItem", options, htmlProps);
  htmlProps = useRover(options, htmlProps);

  return htmlProps;
}

const keys: Keys<MenuStateReturn & MenuItemOptions> = [
  ...useRover.__keys,
  ...useMenuState.__keys
];

useMenuItem.__keys = keys;

export const MenuItem = unstable_createComponent({
  as: "button",
  useHook: useMenuItem
});
