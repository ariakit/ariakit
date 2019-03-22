import * as React from "react";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { warning } from "../__utils/warning";
import { unstable_RadioStateReturn } from "./RadioState";

export type unstable_RadioGroupOptions = unstable_BoxOptions &
  Partial<unstable_RadioStateReturn>;

export type unstable_RadioGroupProps = unstable_BoxProps &
  React.FieldsetHTMLAttributes<any>;

export function useRadioGroup(
  options: unstable_RadioGroupOptions = {},
  htmlProps: unstable_RadioGroupProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "radiogroup"
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useRadioGroup", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_RadioGroupOptions> = [...useBox.keys];

useRadioGroup.keys = keys;

export const RadioGroup = unstable_createComponent(
  "fieldset",
  useRadioGroup,
  (type, props, children) => {
    warning(
      props["aria-label"] || props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-15`,
      "RadioGroup"
    );
    return unstable_useCreateElement(type, props, children);
  }
);
