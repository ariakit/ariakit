import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_createHook } from "../utils/createHook";

export type ButtonOptions = TabbableOptions;

export type ButtonHTMLProps = TabbableHTMLProps &
  React.ButtonHTMLAttributes<any>;

export type ButtonProps = ButtonOptions & ButtonHTMLProps;

export const useButton = unstable_createHook<ButtonOptions, ButtonHTMLProps>({
  name: "Button",
  compose: useTabbable,

  useProps(_, htmlProps) {
    return mergeProps(
      {
        role: "button",
        type: "button"
      } as ButtonHTMLProps,
      htmlProps
    );
  }
});

export const Button = unstable_createComponent({
  as: "button",
  useHook: useButton
});
