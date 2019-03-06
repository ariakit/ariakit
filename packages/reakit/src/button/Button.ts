import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../box/Box";

export type unstable_ButtonOptions = unstable_BoxOptions;

export type unstable_ButtonProps = unstable_BoxProps;

export function useButton(
  options: unstable_ButtonOptions = {},
  htmlProps: unstable_ButtonProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "button",
      tabIndex: 0,
      onKeyPress: e => {
        if (e.target instanceof HTMLButtonElement) return;
        if (e.key === "Enter" || e.key === "Space") {
          e.preventDefault();
          e.target.dispatchEvent(
            new MouseEvent("click", {
              view: window,
              bubbles: true,
              cancelable: false
            })
          );
        }
      }
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useButton", options, htmlProps);
  return htmlProps;
}

useButton.keys = useBox.keys;

export const Button = unstable_createComponent("button", useButton);
