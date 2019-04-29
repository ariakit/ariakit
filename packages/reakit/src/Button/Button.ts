import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import {
  TabbableOptions,
  TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_createHook } from "../utils/createHook";

export type ButtonOptions = TabbableOptions;

export type ButtonProps = TabbableProps & React.ButtonHTMLAttributes<any>;

export const useButton = unstable_createHook<ButtonOptions, ButtonProps>({
  name: "Button",
  compose: useTabbable,

  useProps(_, htmlProps) {
    return mergeProps(
      {
        role: "button",
        type: "button"
      } as ButtonProps,
      htmlProps
    );
  }
});

export const Button = unstable_createComponent({
  as: "button",
  useHook: useButton
});
