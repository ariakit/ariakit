import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  TabbableOptions,
  TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { Keys } from "../__utils/types";

export type ButtonOptions = TabbableOptions;

export type ButtonProps = TabbableProps & React.ButtonHTMLAttributes<any>;

export function useButton(
  options: ButtonOptions = {},
  htmlProps: ButtonProps = {}
) {
  options = unstable_useOptions("Button", options, htmlProps);

  htmlProps = mergeProps(
    {
      role: "button",
      type: "button"
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = unstable_useProps("Button", options, htmlProps);
  htmlProps = useTabbable(options, htmlProps);
  return htmlProps;
}

const keys: Keys<ButtonOptions> = [...useTabbable.__keys];

useButton.__keys = keys;

export const Button = unstable_createComponent({
  as: "button",
  useHook: useButton
});
