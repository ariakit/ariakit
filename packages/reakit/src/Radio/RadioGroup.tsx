import * as React from "react";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { warning } from "../__utils/warning";
import { Keys } from "../__utils/types";
import { useRadioState, RadioStateReturn } from "./RadioState";

export type RadioGroupOptions = BoxOptions;

export type RadioGroupProps = BoxProps & React.FieldsetHTMLAttributes<any>;

export function useRadioGroup(
  options: RadioGroupOptions = {},
  htmlProps: RadioGroupProps = {}
) {
  options = unstable_useOptions("useRadioGroup", options, htmlProps);
  htmlProps = mergeProps(
    {
      role: "radiogroup"
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useRadioGroup", options, htmlProps);
  return htmlProps;
}

const keys: Keys<RadioStateReturn & RadioGroupOptions> = [
  ...useBox.__keys,
  ...useRadioState.__keys
];

useRadioGroup.__keys = keys;

export const RadioGroup = unstable_createComponent({
  as: "fieldset",
  useHook: useRadioGroup,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-15`,
      "RadioGroup"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
