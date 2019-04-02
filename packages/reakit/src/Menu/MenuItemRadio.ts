import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  unstable_RadioOptions,
  unstable_RadioProps,
  unstable_useRadio
} from "../Radio/Radio";
import { Keys } from "../__utils/types";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuItemRadioOptions = unstable_RadioOptions &
  Partial<unstable_MenuStateReturn> &
  Pick<unstable_MenuStateReturn, "unstable_values" | "unstable_update"> & {
    /** TODO: Description */
    name: string;
  };

export type unstable_MenuItemRadioProps = unstable_RadioProps;

export function unstable_useMenuItemRadio(
  options: unstable_MenuItemRadioOptions,
  htmlProps: unstable_MenuItemRadioProps = {}
) {
  options = unstable_useOptions("useMenuItemRadio", options, htmlProps);

  const currentValue = options.unstable_values[options.name];
  const setValue = (value: any) => options.unstable_update(options.name, value);

  htmlProps = mergeProps(
    {
      role: "menuitemradio",
      onKeyDown: event => {
        const { unstable_parent: parent, hide, placement } = options;
        if (!parent || !hide || !placement) return;

        const [dir] = placement.split("-");
        const parentIsHorizontal = parent.orientation === "horizontal";

        const keyMap = {
          ArrowRight: parentIsHorizontal
            ? () => {
                parent.unstable_next();
                hide();
              }
            : dir === "left" && hide,
          ArrowLeft: parentIsHorizontal
            ? () => {
                parent.unstable_previous();
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

  htmlProps = unstable_useRadio(
    { ...options, currentValue, setValue },
    htmlProps
  );
  htmlProps = unstable_useProps("useMenuItemRadio", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_MenuItemRadioOptions> = [
  ...unstable_useRadio.__keys,
  ...useMenuState.__keys,
  "name"
];

unstable_useMenuItemRadio.__keys = keys;

export const unstable_MenuItemRadio = unstable_createComponent({
  as: "input",
  useHook: unstable_useMenuItemRadio
});
