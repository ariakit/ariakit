import * as React from "react";
import { As, PropsWithAs } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { DeepPath } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getLabelId } from "./__utils/getLabelId";
import { unstable_FormStateReturn, useFormState } from "./FormState";

export type unstable_FormLabelOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<V>> & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    label?: any;
  };

export type unstable_FormLabelProps = unstable_BoxProps &
  React.LabelHTMLAttributes<any>;

export function useFormLabel<V, P extends DeepPath<V, P>>(
  options: unstable_FormLabelOptions<V, P>,
  htmlProps: unstable_FormLabelProps = {}
) {
  htmlProps = mergeProps(
    {
      children: options.label,
      id: getLabelId(options.name, options.baseId),
      htmlFor: getInputId(options.name, options.baseId)
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useFormLabel", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormLabelOptions<any, any>> = [
  ...useBox.keys,
  ...useFormState.keys,
  "name",
  "label"
];

useFormLabel.keys = keys;

export const FormLabel = (unstable_createComponent(
  "label",
  useFormLabel
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "label">(
  props: PropsWithAs<unstable_FormLabelOptions<V, P>, T>
) => JSX.Element;
