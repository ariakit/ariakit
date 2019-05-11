import * as React from "react";
import {
  TabbableOptions,
  TabbableHTMLProps,
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
  Pick<Partial<CheckboxStateReturn>, "state" | "setState"> & {
    /**
     * Checkbox's value is going to be used when multiple checkboxes share the
     * same state. Checking a checkbox with value will add it to the state
     * array.
     */
    value?: any;
    /**
     * Checkbox's checked state. If present, it's used instead of `state`.
     */
    checked?: boolean;
  };

export type CheckboxHTMLProps = TabbableHTMLProps &
  React.InputHTMLAttributes<any>;

export type CheckboxProps = CheckboxOptions & CheckboxHTMLProps;

const defaultClickKeys = [" "];

export const useCheckbox = unstable_createHook<
  CheckboxOptions,
  CheckboxHTMLProps
>({
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
        ? Boolean(options.state)
        : ((options.state || []) as any[]).indexOf(options.value) !== -1;

    React.useEffect(() => {
      if (!ref.current) {
        warning(
          options.state === "indeterminate",
          "Can't set indeterminate state because either `ref` wasn't passed to component or the component wasn't rendered. See https://reakit.io/docs/checkbox",
          "Checkbox"
        );
        return;
      }

      if (options.state === "indeterminate") {
        ref.current.indeterminate = true;
      } else if (ref.current.indeterminate) {
        ref.current.indeterminate = false;
      }
    }, [options.state]);

    const onChange = React.useCallback(
      (event: React.SyntheticEvent) => {
        if (options.disabled) return;

        if (htmlOnChange) {
          htmlOnChange(event);
        }

        if (!options.setState) return;

        if (isBoolean) {
          options.setState(!checked);
        } else {
          const array: any[] = Array.isArray(options.state)
            ? options.state
            : [];
          const index = array.indexOf(options.value);
          if (index === -1) {
            options.setState([...array, options.value]);
          } else {
            options.setState(removeIndexFromArray(array, index));
          }
        }
      },
      [
        htmlOnChange,
        options.disabled,
        options.setState,
        options.state,
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
        "aria-checked": options.state === "indeterminate" ? "mixed" : checked,
        value: options.value,
        role: "checkbox",
        type: "checkbox",
        onChange,
        onClick
      } as CheckboxHTMLProps,
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
