import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { RoverOptions, RoverProps, useRover } from "../Rover/Rover";
import { Keys } from "../__utils/types";
import { useRadioState, RadioStateReturn } from "./RadioState";

export type RadioOptions = RoverOptions &
  Pick<Partial<RadioStateReturn>, "currentValue" | "setValue"> & {
    /**
     * Same as the `value` attribute.
     */
    value: any;
    /**
     * Same as the `checked` attribute.
     */
    checked?: boolean;
  };

export type RadioProps = RoverProps & React.InputHTMLAttributes<any>;

export function useRadio(options: RadioOptions, htmlProps: RadioProps = {}) {
  options = unstable_useOptions("useRadio", options, htmlProps);

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
  htmlProps = unstable_useProps("useRadio", options, htmlProps);
  return htmlProps;
}

const keys: Keys<RadioStateReturn & RadioOptions> = [
  ...useRover.__keys,
  ...useRadioState.__keys,
  "value",
  "checked"
];

useRadio.__keys = keys;

export const Radio = unstable_createComponent({
  as: "input",
  useHook: useRadio
});
