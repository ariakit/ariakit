import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import {
  unstable_TabbableOptions,
  unstable_TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { Keys } from "../__utils/types";

export type unstable_ButtonOptions = unstable_TabbableOptions;

export type unstable_ButtonProps = unstable_TabbableProps &
  React.ButtonHTMLAttributes<any>;

export function useButton(
  {
    unstable_clickKeys = ["Enter", " "],
    ...options
  }: unstable_ButtonOptions = {},
  htmlProps: unstable_ButtonProps = {}
) {
  const allOptions: unstable_ButtonOptions = { unstable_clickKeys, ...options };

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

const keys: Keys<unstable_ButtonOptions> = [...useTabbable.__keys];

useButton.__keys = keys;

export const Button = unstable_createComponent({
  as: "button",
  useHook: useButton
});
