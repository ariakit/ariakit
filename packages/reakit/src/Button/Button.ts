import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import {
  unstable_TabbableOptions,
  unstable_TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";

export type unstable_ButtonOptions = unstable_TabbableOptions;

export type unstable_ButtonProps = unstable_TabbableProps &
  React.ButtonHTMLAttributes<any>;

export function useButton(
  { clickKeys = ["Enter", " "], ...options }: unstable_ButtonOptions = {},
  htmlProps: unstable_ButtonProps = {}
) {
  const allOptions = { clickKeys, ...options };

  htmlProps = mergeProps(
    {
      role: "button",
      type: "button"
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useTabbable(allOptions, htmlProps);
  htmlProps = useHook("useButton", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ButtonOptions> = [...useTabbable.keys];

useButton.keys = keys;

export const Button = unstable_createComponent("button", useButton);
