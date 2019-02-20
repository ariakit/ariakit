import * as React from "react";
import { useHook } from "../theme";
import { UseBoxOptions, UseBoxProps, useBox } from "../box";
import { mergeProps } from "../utils";

export type UseButtonOptions = UseBoxOptions;

export type UseButtonProps = UseBoxProps & React.ButtonHTMLAttributes<any>;

export function useButton(
  options: UseButtonOptions = {},
  props: UseButtonProps = {}
) {
  props = mergeProps<typeof props>(
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
    },
    props
  );
  props = useBox(options, props);
  return useHook("useButton", options, props);
}

export default useButton;
