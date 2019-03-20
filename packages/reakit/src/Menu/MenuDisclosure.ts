import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_PopoverDisclosureOptions,
  unstable_PopoverDisclosureProps,
  usePopoverDisclosure
} from "../Popover/PopoverDisclosure";

import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuDisclosureOptions = unstable_PopoverDisclosureOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "placement" | "show" | "last">;

export type unstable_MenuDisclosureProps = unstable_PopoverDisclosureProps;

export function useMenuDisclosure(
  options: unstable_MenuDisclosureOptions,
  htmlProps: unstable_MenuDisclosureProps = {}
) {
  const [dir] = options.placement.split("-");

  htmlProps = mergeProps(
    {
      "aria-haspopup": "menu",
      onKeyDown: e => {
        const keyMap = {
          ArrowUp: dir === "top" || dir === "bottom" ? options.last : false,
          ArrowRight: dir === "right" && options.first,
          ArrowDown: dir === "bottom" || dir === "top" ? options.first : false,
          ArrowLeft: dir === "left" && options.first
        };
        if (e.key in keyMap) {
          const key = e.key as keyof typeof keyMap;
          const action = keyMap[key];
          if (typeof action === "function") {
            e.preventDefault();
            options.show();
            action();
          }
        }
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = usePopoverDisclosure(options, htmlProps);
  htmlProps = useHook("useMenuDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_MenuDisclosureOptions> = [
  ...usePopoverDisclosure.keys,
  ...useMenuState.keys
];

useMenuDisclosure.keys = keys;

export const MenuDisclosure = unstable_createComponent(
  "button",
  useMenuDisclosure
);
