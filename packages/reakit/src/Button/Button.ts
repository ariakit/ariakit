import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
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
  let _options: unstable_ButtonOptions = { unstable_clickKeys, ...options };
  _options = unstable_useOptions("useButton", _options, htmlProps);

  htmlProps = mergeProps(
    {
      role: "button",
      type: "button"
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useTabbable(_options, htmlProps);
  htmlProps = unstable_useProps("useButton", _options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_ButtonOptions> = [...useTabbable.__keys];

useButton.__keys = keys;

export const Button = unstable_createComponent({
  as: "button",
  useHook: useButton
});
