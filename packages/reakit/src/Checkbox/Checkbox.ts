import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { removeIndexFromArray } from "reakit-utils/removeIndexFromArray";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  ClickableOptions,
  ClickableHTMLProps,
  useClickable
} from "../Clickable/Clickable";
import { CheckboxStateReturn, useCheckboxState } from "./CheckboxState";
import { useIndeterminateState } from "./__utils/useIndeterminateState";

export type CheckboxOptions = ClickableOptions &
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

export type CheckboxHTMLProps = ClickableHTMLProps &
  React.InputHTMLAttributes<any>;

export type CheckboxProps = CheckboxOptions & CheckboxHTMLProps;

function getChecked(options: CheckboxOptions) {
  const isBoolean = typeof options.value === "undefined";
  if (typeof options.checked !== "undefined") {
    return options.checked;
  }
  if (isBoolean) {
    return Boolean(options.state);
  }
  const state = Array.isArray(options.state) ? options.state : [];
  return state.indexOf(options.value) !== -1;
}

export const useCheckbox = createHook<CheckboxOptions, CheckboxHTMLProps>({
  name: "Checkbox",
  compose: useClickable,
  useState: useCheckboxState,
  keys: ["value", "checked"],

  useOptions(
    { unstable_clickOnEnter = false, ...options },
    { value, checked }
  ) {
    return {
      unstable_clickOnEnter,
      value,
      checked,
      ...options
    };
  },

  useProps(
    options,
    { ref: htmlRef, onChange: htmlOnChange, onClick: htmlOnClick, ...htmlProps }
  ) {
    const ref = React.useRef<HTMLInputElement>(null);
    const checked = getChecked(options);

    useIndeterminateState(ref, options);

    const onChange = React.useCallback(
      (event: React.SyntheticEvent) => {
        const { state, value, setState, disabled } = options;
        const self = event.currentTarget as HTMLElement;

        if (disabled) return;

        if (htmlOnChange) {
          // If component is NOT rendered as a native input, it will not have
          // the `checked` property. So we assign it for consistency
          if (self.tagName !== "INPUT") {
            // @ts-ignore
            self.checked = !self.checked;
          }
          htmlOnChange(event);
        }

        if (!setState) return;

        const isBoolean = typeof value === "undefined";

        if (isBoolean) {
          setState(!checked);
        } else {
          const array = Array.isArray(state) ? state : [];
          const index = array.indexOf(value);
          if (index === -1) {
            setState([...array, value]);
          } else {
            setState(removeIndexFromArray(array, index));
          }
        }
      },
      [
        htmlOnChange,
        checked,
        options.disabled,
        options.setState,
        options.state,
        options.value
      ]
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        const self = event.currentTarget as HTMLElement;
        if (self.tagName === "INPUT") return;
        onChange(event);
      },
      [onChange]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      checked,
      "aria-checked": options.state === "indeterminate" ? "mixed" : checked,
      value: options.value,
      role: "checkbox",
      type: "checkbox",
      onChange,
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps
    };
  }
});

export const Checkbox = createComponent({
  as: "input",
  useHook: useCheckbox
});
