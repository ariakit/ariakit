import * as React from "react";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import { As, PropsWithAs } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { DeepPath } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getMessageId } from "./__utils/getMessageId";
import { getLabelId } from "./__utils/getLabelId";
import { shouldShowError } from "./__utils/shouldShowError";
import { unstable_FormStateReturn, useFormState } from "./FormState";

export type unstable_FormGroupOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<V>> &
  Pick<unstable_FormStateReturn<V>, "touched" | "errors"> & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    radio?: boolean;
  };

export type unstable_FormGroupProps = unstable_BoxProps &
  React.FieldsetHTMLAttributes<any>;

export function useFormGroup<V, P extends DeepPath<V, P>>(
  options: unstable_FormGroupOptions<V, P>,
  htmlProps: unstable_FormGroupProps = {}
) {
  htmlProps = mergeProps(
    {
      role: options.radio ? "radiogroup" : "group",
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

const keys: Array<keyof unstable_FormGroupOptions<any, any>> = [
  ...useBox.keys,
  ...useFormState.keys,
  "name",
  "radio"
];

useFormGroup.keys = keys;

export const FormGroup = (unstable_createComponent(
  "fieldset",
  useFormGroup
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "fieldset">(
  props: PropsWithAs<unstable_FormGroupOptions<V, P>, T>
) => JSX.Element;
