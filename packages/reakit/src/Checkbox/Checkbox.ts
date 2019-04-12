import * as React from "react";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  TabbableOptions,
  TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { removeIndexFromArray } from "../__utils/removeIndexFromArray";
import { Keys } from "../__utils/types";
import { CheckboxStateReturn, useCheckboxState } from "./CheckboxState";

export type CheckboxOptions = TabbableOptions &
  Pick<Partial<CheckboxStateReturn>, "currentValue" | "setValue"> & {
    /**
     * Checkbox's value is going to be used when multiple checkboxes share the
     * same state. Checking a checkbox with value will add it to the state
     * array.
     */
    value?: any;
    /**
     * Checkbox's checked state. If present, it's used instead of currentValue.
     */
    checked?: boolean;
  };

export type CheckboxProps = TabbableProps & React.InputHTMLAttributes<any>;

export function useCheckbox(
  options: CheckboxOptions = {},
  htmlProps: CheckboxProps = {}
) {
  options = unstable_useOptions("useCheckbox", options, htmlProps);

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
  htmlProps = unstable_useProps("useCheckbox", options, htmlProps);
  return htmlProps;
}

const keys: Keys<CheckboxOptions> = [
  ...useTabbable.__keys,
  ...useCheckboxState.__keys,
  "value",
  "checked"
];

useCheckbox.__keys = keys;

export const Checkbox = unstable_createComponent({
  as: "input",
  useHook: useCheckbox
});
