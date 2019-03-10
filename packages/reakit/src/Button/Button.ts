import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";

export type unstable_ButtonOptions = unstable_BoxOptions & {
  /** TODO: Description */
  disabled?: boolean;
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
  options: unstable_ButtonOptions = {},
  htmlProps: unstable_ButtonProps = {}
) {
  const { onClick, tabIndex = 0, ...otherHTMLProps } = htmlProps;

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
        } else if (onClick) {
          onClick(e);
        }
      },
      onKeyPress: e => {
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
    otherHTMLProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useButton", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_ButtonOptions> = [...useBox.keys, "disabled"];

useButton.keys = keys;

export const Button = unstable_createComponent("button", useButton);
