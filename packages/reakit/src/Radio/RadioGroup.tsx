import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { warning } from "reakit-utils/warning";
import {
  unstable_CompositeOptions,
  unstable_CompositeHTMLProps,
  unstable_useComposite
} from "../Composite/Composite";
import { useRadioState } from "./RadioState";

export type RadioGroupOptions = unstable_CompositeOptions;

export type RadioGroupHTMLProps = unstable_CompositeHTMLProps &
  React.FieldsetHTMLAttributes<any>;

export type RadioGroupProps = RadioGroupOptions & RadioGroupHTMLProps;

const useRadioGroup = createHook<RadioGroupOptions, RadioGroupHTMLProps>({
  name: "RadioGroup",
  compose: unstable_useComposite,
  useState: useRadioState,

  useProps(_, htmlProps) {
    return { role: "radiogroup", ...htmlProps };
  }
});

export const RadioGroup = createComponent({
  as: "div",
  useHook: useRadioGroup,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "[reakit/RadioGroup]",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/radio"
    );
    return useCreateElement(type, props, children);
  }
});
