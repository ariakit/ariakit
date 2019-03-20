import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";

export type unstable_ButtonOptions = unstable_BoxOptions & {
  /** TODO: Description */
  tabIndex?: number;
  /** TODO: Description */
  disabled?: boolean;
  /** TODO: Description */
  onClick?: React.MouseEventHandler;
  /** TODO: Description */
  focusable?: boolean;
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
  const reallyDisabled = options.disabled && !options.focusable;

  htmlProps = mergeProps(
    {
      role: "button",
      disabled: reallyDisabled,
      tabIndex: reallyDisabled ? undefined : tabIndex,
      "aria-disabled": options.disabled,
      onClick: event => {
        if (options.disabled) {
          event.stopPropagation();
          event.preventDefault();
        } else if (options.onClick) {
          options.onClick(event);
        }
      },
      onKeyDown: event => {
        if (isNativeButton(event.target)) return;
        if (options.disabled) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.target.dispatchEvent(
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
  htmlProps = useHook("useButton", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ButtonOptions> = [
  ...useBox.keys,
  "tabIndex",
  "disabled",
  "onClick",
  "focusable"
];

useButton.keys = keys;

export const Button = unstable_createComponent("button", useButton);
