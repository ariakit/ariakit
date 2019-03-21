import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import {
  useCheckboxState,
  unstable_CheckboxStateReturn
} from "./CheckboxState";

export type unstable_CheckboxOptions = unstable_BoxOptions &
  Partial<unstable_CheckboxStateReturn> & {
    /** TODO: Description */
    tabIndex?: number;
    /** TODO: Description */
    disabled?: boolean;
    /** TODO: Description */
    onClick?: React.MouseEventHandler;
    /** TODO: Description */
    focusable?: boolean;
    /** TODO: Descriptions */
    value?: any;
    /** TODO: Descriptions */
    checked?: boolean;
  };

export type unstable_CheckboxProps = unstable_BoxProps &
  React.InputHTMLAttributes<any>;

function isNativeCheckbox(element: EventTarget) {
  return element instanceof HTMLInputElement && element.type === "checkbox";
}

export function useCheckbox(
  { tabIndex = 0, ...options }: unstable_CheckboxOptions = {},
  htmlProps: unstable_CheckboxProps = {}
) {
  const allOptions = { tabIndex, ...options };
  const reallyDisabled = options.disabled && !options.focusable;
  const ref = React.useRef<HTMLInputElement>(null);
  const isBoolean = typeof options.value === "undefined";
  const checked =
    options.checked ||
    (isBoolean
      ? options.state === 1
      : ((options.state || []) as any[]).indexOf(options.value) !== -1);

  React.useEffect(() => {
    if (ref.current && options.state === 2) {
      ref.current.indeterminate = true;
    }
  }, [options.state]);

  htmlProps = mergeProps(
    {
      ref,
      checked,
      "aria-checked": checked,
      value: options.value,
      role: "checkbox",
      type: "checkbox",
      disabled: reallyDisabled,
      tabIndex: reallyDisabled ? undefined : tabIndex,
      "aria-disabled": options.disabled,
      onClick: event => {
        if (options.disabled) {
          event.stopPropagation();
          event.preventDefault();
          return;
        }
        if (!isNativeCheckbox(event.target) && options.toggle) {
          options.toggle(options.value);
        }
        if (options.onClick) {
          options.onClick(event);
        }
      },
      onChange: () => {
        if (options.disabled || !options.toggle) return;
        options.toggle(options.value);
      },
      onKeyDown: event => {
        if (isNativeCheckbox(event.target)) return;
        if (event.key === " ") {
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
  htmlProps = useHook("useCheckbox", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_CheckboxOptions> = [
  ...useBox.keys,
  ...useCheckboxState.keys,
  "tabIndex",
  "disabled",
  "onClick",
  "focusable",
  "value",
  "checked"
];

useCheckbox.keys = keys;

export const Checkbox = unstable_createComponent("input", useCheckbox);
