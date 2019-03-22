import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_RadioOptions,
  unstable_RadioProps,
  useRadio
} from "../Radio/Radio";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuItemRadioOptions = unstable_RadioOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "values" | "update"> & {
    /** TODO: Description */
    name: string;
  };

export type unstable_MenuItemRadioProps = unstable_RadioProps;

export function useMenuItemRadio(
  options: unstable_MenuItemRadioOptions,
  htmlProps: unstable_MenuItemRadioProps = {}
) {
  const currentValue = options.values[options.name];
  const setValue = (value: any) => options.update(options.name, value);

  htmlProps = mergeProps(
    {
      role: "menuitemradio",
      onKeyDown: event => {
        const { parent, hide, placement } = options;
        if (!parent || !hide || !placement) return;

        const [dir] = placement.split("-");
        const parentIsHorizontal = parent.orientation === "horizontal";

        const keyMap = {
          ArrowRight: parentIsHorizontal
            ? () => {
                parent.next();
                hide();
              }
            : dir === "left" && hide,
          ArrowLeft: parentIsHorizontal
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

  htmlProps = useRadio({ ...options, currentValue, setValue }, htmlProps);
  htmlProps = useHook("useMenuItemRadio", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_MenuItemRadioOptions> = [
  ...useRadio.keys,
  ...useMenuState.keys,
  "name"
];

useMenuItemRadio.keys = keys;

export const MenuItemRadio = unstable_createComponent(
  "input",
  useMenuItemRadio
);
