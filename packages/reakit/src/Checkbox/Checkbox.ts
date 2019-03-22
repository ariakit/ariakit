import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import {
  unstable_TabbableOptions,
  unstable_TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import {
  useCheckboxState,
  unstable_CheckboxStateReturn
} from "./CheckboxState";

export type unstable_CheckboxOptions = unstable_TabbableOptions &
  Partial<unstable_CheckboxStateReturn> & {
    /** TODO: Descriptions */
    value?: any;
    /** TODO: Descriptions */
    checked?: boolean;
  };

export type unstable_CheckboxProps = unstable_TabbableProps &
  React.InputHTMLAttributes<any>;

export function useCheckbox(
  options: unstable_CheckboxOptions = {},
  htmlProps: unstable_CheckboxProps = {}
) {
  const ref = React.useRef<HTMLInputElement>(null);
  const isBoolean = typeof options.value === "undefined";
  const checked =
    options.checked ||
    (isBoolean
      ? options.currentValue === 1
      : ((options.currentValue || []) as any[]).indexOf(options.value) !== -1);

  React.useEffect(() => {
    if (ref.current && options.currentValue === 2) {
      ref.current.indeterminate = true;
    }
  }, [options.currentValue]);

  htmlProps = mergeProps(
    {
      ref,
      checked,
      "aria-checked": options.currentValue === 2 ? "mixed" : checked,
      value: options.value,
      role: "checkbox",
      type: "checkbox",
      onClick: event => {
        if (event.target instanceof HTMLInputElement) return;
        htmlProps.onChange!(event);
      },
      onChange: () => {
        if (options.disabled || !options.toggle) return;
        options.toggle(options.value);
      }
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useTabbable(options, htmlProps);
  htmlProps = useHook("useCheckbox", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_CheckboxOptions> = [
  ...useTabbable.keys,
  ...useCheckboxState.keys,
  "value",
  "checked"
];

useCheckbox.keys = keys;

export const Checkbox = unstable_createComponent("input", useCheckbox);
