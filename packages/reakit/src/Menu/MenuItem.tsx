import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { RoverOptions, RoverProps, useRover } from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext, MenuContextType } from "./__utils/MenuContext";

export type MenuItemOptions = RoverOptions &
  Pick<Partial<MenuStateReturn>, "hide" | "placement"> &
  Pick<MenuStateReturn, "unstable_next" | "unstable_previous">;

export type MenuItemProps = RoverProps;

export function useMenuItem(
  options: MenuItemOptions,
  { children, onKeyDown, ...htmlProps }: MenuItemProps = {}
) {
  const parent = React.useContext(MenuContext);
  const ref = React.useRef<HTMLElement>(null);
  options = unstable_useOptions("useMenuItem", options, htmlProps);

  const providerValue = React.useMemo(
    () => ({
      orientation: options.orientation,
      unstable_next: options.unstable_next,
      unstable_previous: options.unstable_previous,
      parent
    }),
    [
      options.orientation,
      options.unstable_next,
      options.unstable_previous,
      parent
    ]
  );

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
    } as MenuItemProps,
    htmlProps
  );

  htmlProps = useRover(options, htmlProps);
  htmlProps = unstable_useProps("useMenuItem", options, htmlProps);

  return {
    ...htmlProps,
    children:
      typeof children === "function"
        ? (props: typeof htmlProps) => (
            <MenuContext.Provider value={providerValue}>
              {children(props)}
            </MenuContext.Provider>
          )
        : children
  };
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
