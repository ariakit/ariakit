import * as React from "react";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import { As, PropsWithAs, Keys } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { DeepPath } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getMessageId } from "./__utils/getMessageId";
import { getLabelId } from "./__utils/getLabelId";
import { shouldShowError } from "./__utils/shouldShowError";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";

export type unstable_FormGroupOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<V>> &
  Pick<unstable_FormStateReturn<V>, "baseId" | "touched" | "errors"> & {
    /** TODO: Description */
    name: P;
  };

export type unstable_FormGroupProps = unstable_BoxProps &
  React.FieldsetHTMLAttributes<any>;

export function unstable_useFormGroup<V, P extends DeepPath<V, P>>(
  options: unstable_FormGroupOptions<V, P>,
  htmlProps: unstable_FormGroupProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "group",
      id: getInputId(options.name, options.baseId),
      "aria-describedby": getMessageId(options.name, options.baseId),
      "aria-labelledby": getLabelId(options.name, options.baseId),
      "aria-invalid": shouldShowError(options, options.name)
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useFormGroup", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_FormGroupOptions<any, any>> = [
  ...useBox.__keys,
  ...unstable_useFormState.__keys,
  "name"
];

unstable_useFormGroup.__keys = keys;

export const unstable_FormGroup = (unstable_createComponent({
  as: "fieldset",
  useHook: unstable_useFormGroup
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "fieldset">(
  props: PropsWithAs<unstable_FormGroupOptions<V, P>, T>
) => JSX.Element;
