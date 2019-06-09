import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { removeIndexFromArray } from "reakit-utils/removeIndexFromArray";
import { Omit } from "reakit-utils/types";
import { warning } from "reakit-utils/warning";
import { createHook } from "reakit-system/createHook";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";
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

export const useCheckbox = createHook<CheckboxOptions, CheckboxHTMLProps>({
  name: "Checkbox",
  compose: useTabbable,
  useState: useCheckboxState,
  keys: ["value", "checked"],

  useProps(
    options,
    { ref: htmlRef, onChange: htmlOnChange, onClick: htmlOnClick, ...htmlProps }
  ) {
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
          "Checkbox",
          "Can't set indeterminate state because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/checkbox"
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

    return {
      ref: mergeRefs(ref, htmlRef),
      checked,
      "aria-checked": options.state === "indeterminate" ? "mixed" : checked,
      value: options.value,
      role: "checkbox",
      type: "checkbox",
      onChange,
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps
    };
  },

  useCompose(options, htmlProps) {
    return useTabbable(
      { ...options, unstable_clickKeys: defaultClickKeys },
      htmlProps
    );
  }
});

export const Checkbox = createComponent({
  as: "input",
  useHook: useCheckbox
});
