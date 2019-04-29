import * as React from "react";
import {
  TabbableOptions,
  TabbableProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { removeIndexFromArray } from "../__utils/removeIndexFromArray";
import { Omit } from "../__utils/types";
import { warning } from "../__utils/warning";
import { unstable_createHook } from "../utils/createHook";
import { CheckboxStateReturn, useCheckboxState } from "./CheckboxState";

export type CheckboxOptions = Omit<TabbableOptions, "unstable_clickKeys"> &
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

const defaultClickKeys = [" "];

export const useCheckbox = unstable_createHook<CheckboxOptions, CheckboxProps>({
  name: "Checkbox",
  compose: useTabbable,
  useState: useCheckboxState,
  keys: ["value", "checked"],

  useProps(options, { onChange: htmlOnChange, ...htmlProps }) {
    const ref = React.useRef<HTMLInputElement>(null);
    const isBoolean = typeof options.value === "undefined";
    const checked =
      typeof options.checked !== "undefined"
        ? options.checked
        : isBoolean
        ? Boolean(options.currentValue)
        : ((options.currentValue || []) as any[]).indexOf(options.value) !== -1;

    React.useEffect(() => {
      if (!ref.current) {
        warning(
          options.currentValue === "indeterminate",
          "Can't set indeterminate state because either `ref` wasn't passed to component or the component wasn't rendered. See https://reakit.io/docs/checkbox",
          "Checkbox"
        );
        return;
      }

      if (options.currentValue === "indeterminate") {
        ref.current.indeterminate = true;
      } else if (ref.current.indeterminate) {
        ref.current.indeterminate = false;
      }
    }, [options.currentValue]);

    const onChange = React.useCallback(
      (event: React.SyntheticEvent) => {
        if (options.disabled) return;

        if (htmlOnChange) {
          htmlOnChange(event);
        }

        if (!options.setValue) return;

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
      },
      [
        htmlOnChange,
        options.disabled,
        options.setValue,
        options.currentValue,
        options.value
      ]
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        if (event.target instanceof HTMLInputElement) return;
        onChange(event);
      },
      [onChange]
    );

    return mergeProps(
      {
        ref,
        checked,
        "aria-checked":
          options.currentValue === "indeterminate" ? "mixed" : checked,
        value: options.value,
        role: "checkbox",
        type: "checkbox",
        onChange,
        onClick
      } as CheckboxProps,
      htmlProps
    );
  },

  useCompose(options, htmlProps) {
    return useTabbable(
      { ...options, unstable_clickKeys: defaultClickKeys },
      htmlProps
    );
  }
});

export const Checkbox = unstable_createComponent({
  as: "input",
  useHook: useCheckbox
});
