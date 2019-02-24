import * as React from "react";
import { useHook } from "../theme/_useHook";
import { mergeProps } from "../utils/mergeProps";
import { useBox, UseBoxOptions, UseBoxProps } from "../box/useBox";

export type UseButtonOptions = UseBoxOptions;

export type UseButtonProps = UseBoxProps & React.ButtonHTMLAttributes<any>;

export function useButton(
  options: UseButtonOptions = {},
  props: UseButtonProps = {}
) {
  props = mergeProps(
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
    } as typeof props,
    props
  );
  props = useBox(options, props);
  props = useHook("useButton", options, props);
  return props;
}

useButton.keys = useBox.keys;
