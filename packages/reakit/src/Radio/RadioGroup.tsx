import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { warning } from "reakit-utils/warning";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { useRadioState } from "./RadioState";

export type RadioGroupOptions = BoxOptions;

export type RadioGroupHTMLProps = BoxHTMLProps &
  React.FieldsetHTMLAttributes<any>;

export type RadioGroupProps = RadioGroupOptions & RadioGroupHTMLProps;

const useRadioGroup = createHook<RadioGroupOptions, RadioGroupHTMLProps>({
  name: "RadioGroup",
  compose: useBox,
  useState: useRadioState,

  useProps(_, htmlProps) {
    return { role: "radiogroup", ...htmlProps };
  }
});

export const RadioGroup = createComponent({
  as: "fieldset",
  useHook: useRadioGroup,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "RadioGroup",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/radio"
    );
    return useCreateElement(type, props, children);
  }
});
