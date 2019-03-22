import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import {
  unstable_RoverOptions,
  unstable_RoverProps,
  useRover
} from "../Rover/Rover";
import { useRadioState, unstable_RadioStateReturn } from "./RadioState";

export type unstable_RadioOptions = unstable_RoverOptions &
  Partial<unstable_RadioStateReturn> & {
    /** TODO: Descriptions */
    value: any;
    /** TODO: Descriptions */
    checked?: boolean;
  };

export type unstable_RadioProps = unstable_RoverProps &
  React.InputHTMLAttributes<any>;

// It should be Rover
export function useRadio(
  options: unstable_RadioOptions,
  htmlProps: unstable_RadioProps = {}
) {
  const checked = options.checked || options.currentValue === options.value;

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

const keys: Array<keyof unstable_RadioOptions> = [
  ...useRover.keys,
  ...useRadioState.keys,
  "value",
  "checked"
];

useRadio.keys = keys;

export const Radio = unstable_createComponent("input", useRadio);
