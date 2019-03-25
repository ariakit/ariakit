import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { Keys } from "../__utils/types";
import {
  unstable_useRadioState,
  unstable_RadioStateReturn
} from "./RadioState";

export type unstable_RadioOptions = unstable_RoverOptions &
  Partial<unstable_RadioStateReturn> & {
    /**
     * Same as the `value` attribute.
     */
    value: any;
    /**
     * Same as the `checked` attribute.
     */
    checked?: boolean;
  };

export type unstable_RadioProps = unstable_RoverProps &
  React.InputHTMLAttributes<any>;

export function unstable_useRadio(
  options: unstable_RadioOptions,
  htmlProps: unstable_RadioProps = {}
) {
  const checked =
    typeof options.checked !== "undefined"
      ? options.checked
      : options.currentValue === options.value;

  htmlProps = mergeProps(
    {
      checked,
      "aria-checked": checked,
      value: options.value,
      role: "radio",
      type: "radio",
      onClick: event => {
        if (event.target instanceof HTMLInputElement) return;
        htmlProps.onChange!(event);
      },
      onChange: () => {
        if (options.disabled || !options.setValue) return;
        options.setValue(options.value);
      }
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useRover(options, htmlProps);
  htmlProps = useHook("useRadio", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_RadioOptions> = [
  ...useRover.__keys,
  ...unstable_useRadioState.__keys,
  "value",
  "checked"
];

unstable_useRadio.__keys = keys;

export const unstable_Radio = unstable_createComponent({
  as: "input",
  useHook: unstable_useRadio
});
