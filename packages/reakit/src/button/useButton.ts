import { mergeProps } from "../utils/mergeProps";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_UseBoxOptions,
  unstable_UseBoxProps,
  useBox
} from "../box/useBox";

export type unstable_UseButtonOptions = unstable_UseBoxOptions;

export type unstable_UseButtonProps = unstable_UseBoxProps;

export function useButton(
  options: unstable_UseButtonOptions = {},
  htmlProps: unstable_UseButtonProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "button",
      tabIndex: 0,
      onKeyPress: e => {
        if (e.target instanceof HTMLButtonElement) return;
        if (e.charCode === 32 || e.charCode === 13) {
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
