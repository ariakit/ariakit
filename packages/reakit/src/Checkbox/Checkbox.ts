import * as React from "react";
import { useHook } from "../system/useHook";
import {
  unstable_TabbableOptions,
  unstable_TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { removeIndexFromArray } from "../__utils/removeIndexFromArray";
import {
  unstable_CheckboxStateReturn,
  useCheckboxState
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
    typeof options.checked !== "undefined"
      ? options.checked
      : isBoolean
      ? Boolean(options.currentValue)
      : ((options.currentValue || []) as any[]).indexOf(options.value) !== -1;

  React.useEffect(() => {
    if (ref.current && options.currentValue === "indeterminate") {
      ref.current.indeterminate = true;
    }
  }, [options.currentValue]);

  htmlProps = mergeProps(
    {
      ref,
      checked,
      "aria-checked":
        options.currentValue === "indeterminate" ? "mixed" : checked,
      value: options.value,
      role: "checkbox",
      type: "checkbox",
      onClick: event => {
        if (event.target instanceof HTMLInputElement) return;
        htmlProps.onChange!(event);
      },
      onChange: () => {
        if (options.disabled || !options.setValue) return;
        if (isBoolean) {
          options.setValue(!checked);
        } else {
          const array: any[] = Array.isArray(options.currentValue)
            ? options.currentValue
            : [];
          const index = array.indexOf(options.value);
          if (index === -1) {
            options.setValue([...array, options.value]);
          } else {
            options.setValue(removeIndexFromArray(array, index));
          }
        }
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
