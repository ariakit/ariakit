import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";
import { MenuContext, MenuContextType } from "./__utils/MenuContext";

export type unstable_MenuItemOptions = unstable_RoverOptions &
  unstable_MenuStateReturn;

export type unstable_MenuItemProps = unstable_RoverProps;

export function useMenuItem(
  options: unstable_MenuItemOptions,
  { children, onKeyDown, ...htmlProps }: unstable_MenuItemProps = {}
) {
  const parent = React.useContext(MenuContext);
  const ref = React.useRef<HTMLElement>(null);
  options = unstable_useOptions("useMenuItem", options, htmlProps);

  htmlProps = mergeProps(
    {
      ref,
      role: "menuitem",
      onMouseOver: () => {
        if (options.orientation !== "horizontal" && ref.current) {
          ref.current.focus();
        }
      },
      onKeyDown: event => {
        const { hide, placement } = options;
        if (!parent || !hide || !placement) return;

        let horizontalParent: MenuContextType | undefined | null = parent;

        while (
          horizontalParent &&
          horizontalParent.orientation !== "horizontal"
        ) {
          horizontalParent = horizontalParent.parent;
        }

        const [dir] = placement.split("-");

        const keyMap = {
          ArrowRight:
            horizontalParent && dir !== "left"
              ? () => {
                  hide();
                  horizontalParent!.unstable_next();
                }
              : dir === "left" && hide,
          ArrowLeft:
            horizontalParent && dir !== "right"
              ? () => {
                  hide();
                  horizontalParent!.unstable_previous();
                }
              : dir === "right" && hide
        };

        if (event.key in keyMap) {
          const key = event.key as keyof typeof keyMap;
          const action = keyMap[key];
          if (typeof action === "function") {
            event.preventDefault();
            action();
            // Prevent onKeyDown from being called twice for the same keys.
            return;
          }
        }

        if (onKeyDown) {
          onKeyDown(event);
        }
      }
    } as unstable_MenuItemProps,
    htmlProps
  );

  htmlProps = useRover(options, htmlProps);
  htmlProps = unstable_useProps("useMenuItem", options, htmlProps);

  return {
    ...htmlProps,
    children:
      typeof children === "function"
        ? (props: typeof htmlProps) => (
            <MenuContext.Provider value={{ ...options, parent }}>
              {children(props)}
            </MenuContext.Provider>
          )
        : children
  };
}

const keys: Keys<unstable_MenuItemOptions> = [
  ...useRover.__keys,
  ...useMenuState.__keys
];

useMenuItem.__keys = keys;

export const MenuItem = unstable_createComponent({
  as: "button",
  useHook: useMenuItem
});
