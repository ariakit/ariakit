import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { removeIndexFromArray } from "reakit-utils/removeIndexFromArray";
import { Omit } from "reakit-utils/types";
import { createHook } from "reakit-system/createHook";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { CheckboxStateReturn, useCheckboxState } from "./CheckboxState";
import { useIndeterminateState } from "./__utils/useIndeterminateState";
import { useDelayedEvent } from "./__utils/useDelayedEvent";

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
  compose: useTabbable,
  useState: useCheckboxState,
  keys: ["value", "checked"],

  useProps(
    options,
    { ref: htmlRef, onChange: htmlOnChange, onClick: htmlOnClick, ...htmlProps }
  ) {
    const ref = React.useRef<HTMLInputElement>(null);
    const checked = getChecked(options);
    const setDelayedEvent = useDelayedEvent(htmlOnChange);

    useIndeterminateState(ref, options);

    const onChange = React.useCallback(
      (event: React.SyntheticEvent) => {
        const { state, value, setState, disabled } = options;

        if (disabled) return;

        if (htmlOnChange) {
          setDelayedEvent(event);
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
