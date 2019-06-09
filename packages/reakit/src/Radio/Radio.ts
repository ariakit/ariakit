import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { Omit } from "reakit-utils/types";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { RoverOptions, RoverHTMLProps, useRover } from "../Rover/Rover";
import { useRadioState, RadioStateReturn } from "./RadioState";

export type RadioOptions = Omit<RoverOptions, "unstable_clickKeys"> &
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

const defaultClickKeys = [" "];

export const useRadio = createHook<RadioOptions, RadioHTMLProps>({
  name: "Radio",
  compose: useRover,
  useState: useRadioState,
  keys: ["value", "checked"],

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
  },

  useCompose(options, htmlProps) {
    return useRover(
      { ...options, unstable_clickKeys: defaultClickKeys },
      htmlProps
    );
  }
});

export const Radio = createComponent({
  as: "input",
  useHook: useRadio
});
