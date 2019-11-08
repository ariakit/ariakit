import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { RoverOptions, RoverHTMLProps, useRover } from "../Rover/Rover";
import { useRadioState, RadioStateReturn } from "./RadioState";

export type RadioOptions = RoverOptions &
  Pick<Partial<RadioStateReturn>, "state" | "setState"> & {
    /**
     * Same as the `value` attribute.
     */
    value: any;
    /**
     * Same as the `checked` attribute.
     */
    checked?: boolean;
  };

export type RadioHTMLProps = RoverHTMLProps & React.InputHTMLAttributes<any>;

export type RadioProps = RadioOptions & RadioHTMLProps;

export const useRadio = createHook<RadioOptions, RadioHTMLProps>({
  name: "Radio",
  compose: useRover,
  useState: useRadioState,
  keys: ["value", "checked"],

  useOptions({ unstable_clickOnEnter = false, ...options }) {
    return {
      unstable_clickOnEnter,
      ...options
    };
  },

  useProps(
    options,
    { onChange: htmlOnChange, onClick: htmlOnClick, ...htmlProps }
  ) {
    const checked =
      typeof options.checked !== "undefined"
        ? options.checked
        : options.state === options.value;

    const onChange = React.useCallback(
      (event: React.ChangeEvent) => {
        if (htmlOnChange) {
          htmlOnChange(event);
        }
        if (options.disabled || !options.setState) return;
        options.setState(options.value);
      },
      [htmlOnChange, options.disabled, options.setState, options.value]
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        if (event.target instanceof HTMLInputElement) return;
        onChange(event as any);
      },
      [onChange]
    );

    return {
      checked,
      "aria-checked": checked,
      value: options.value,
      role: "radio",
      type: "radio",
      onChange,
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps
    };
  }
});

export const Radio = createComponent({
  as: "input",
  useHook: useRadio
});
