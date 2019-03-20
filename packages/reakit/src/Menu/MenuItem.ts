import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuItemOptions = unstable_RoverOptions &
  Partial<unstable_MenuStateReturn>;

export type unstable_MenuItemProps = unstable_RoverProps;

export function useMenuItem(
  { focusable = true, ...options }: unstable_MenuItemOptions,
  htmlProps: unstable_MenuItemProps = {}
) {
  const allOptions = { focusable, ...options };

  htmlProps = mergeProps(
    {
      role: "menuitem",
      onKeyDown: event => {
        const { parent, hide, placement } = options;
        if (!parent || !hide || !placement) return;

        const [dir] = placement.split("-");
        const target = event.target as Element;
        const parentIsHorizontal = parent.orientation === "horizontal";
        const isDisclosure = target.getAttribute("aria-haspopup") === "menu";

        const keyMap = {
          ArrowRight:
            parentIsHorizontal && !isDisclosure
              ? () => {
                  parent.next();
                  hide();
                }
              : dir === "left" && hide,
          ArrowLeft:
            parentIsHorizontal && !isDisclosure
              ? () => {
                  parent.previous();
                  hide();
                }
              : dir === "right" && hide
        };

        if (event.key in keyMap) {
          const key = event.key as keyof typeof keyMap;
          const action = keyMap[key];
          if (typeof action === "function") {
            event.preventDefault();
            action();
          }
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useRover(allOptions, htmlProps);
  htmlProps = useHook("useMenuItem", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_MenuItemOptions> = [
  ...useRover.keys,
  ...useMenuState.keys
];

useMenuItem.keys = keys;

export const MenuItem = unstable_createComponent("button", useMenuItem);
