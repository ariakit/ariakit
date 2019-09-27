import * as React from "react";
import { As, PropsWithAs } from "reakit-utils/types";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { DeepPath } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getLabelId } from "./__utils/getLabelId";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";

export type unstable_FormLabelOptions<
  V,
  P extends DeepPath<V, P>
> = BoxOptions &
  Pick<unstable_FormStateReturn<V>, "baseId" | "values"> & {
    /**
     * FormInput's name as in form values.
     */
    name: P;
    /**
     * Label can be passed as the `label` prop or `children`.
     */
    label?: any;
  };

export type unstable_FormLabelHTMLProps = BoxHTMLProps &
  React.LabelHTMLAttributes<any>;

export type unstable_FormLabelProps<
  V,
  P extends DeepPath<V, P>
> = unstable_FormLabelOptions<V, P> & unstable_FormLabelHTMLProps;

export const unstable_useFormLabel = createHook<
  unstable_FormLabelOptions<any, any>,
  unstable_FormLabelHTMLProps
>({
  name: "FormLabel",
  compose: useBox,
  useState: unstable_useFormState,
  keys: ["name", "label"],

  useProps(options, htmlProps) {
    return {
      children: options.label,
      id: getLabelId(options.name, options.baseId),
      htmlFor: getInputId(options.name, options.baseId),
      ...htmlProps
    };
  }
}) as <V, P extends DeepPath<V, P>>(
  options: unstable_FormLabelOptions<V, P>,
  htmlProps?: unstable_FormLabelHTMLProps
) => unstable_FormLabelHTMLProps;

export const unstable_FormLabel = (createComponent({
  as: "label",
  useHook: unstable_useFormLabel
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "label">(
  props: PropsWithAs<unstable_FormLabelOptions<V, P>, T>
) => JSX.Element;
