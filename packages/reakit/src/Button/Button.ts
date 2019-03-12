import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";

export type unstable_ButtonOptions = unstable_BoxOptions & {
  /** TODO: Description */
  tabIndex?: number;
  /** TODO: Description */
  disabled?: boolean;
  /** TODO: Description */
  onClick?: React.MouseEventHandler;
};

export type unstable_ButtonProps = unstable_BoxProps &
  React.ButtonHTMLAttributes<any>;

function isNativeButton(element: EventTarget) {
  if (element instanceof HTMLButtonElement) return true;
  if (
    element instanceof HTMLInputElement &&
    ["button", "submit", "reset"].indexOf(element.type) >= 0
  ) {
    return true;
  }
  return false;
}

export function useButton(
  { tabIndex = 0, ...options }: unstable_ButtonOptions = {},
  htmlProps: unstable_ButtonProps = {}
) {
  const allOptions = { tabIndex, ...options };

  htmlProps = mergeProps(
    {
      role: "button",
      disabled: options.disabled,
      tabIndex: options.disabled ? undefined : tabIndex,
      "aria-disabled": options.disabled,
      onClick: e => {
        if (options.disabled) {
          e.stopPropagation();
          e.preventDefault();
        } else if (options.onClick) {
          options.onClick(e);
        }
      },
      onKeyPress: e => {
        // No need to check options.disabled
        // KeyPress isn't invoked without focus
        // Focus isn't invoked without tabIndex
        if (isNativeButton(e.target)) return;

        if (e.key === "Enter" || e.key === " ") {
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

  htmlProps = useBox(allOptions, htmlProps);
  htmlProps = unstable_useHook("useButton", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ButtonOptions> = [
  ...useBox.keys,
  "tabIndex",
  "disabled",
  "onClick"
];

useButton.keys = keys;

export const Button = unstable_createComponent("button", useButton);
