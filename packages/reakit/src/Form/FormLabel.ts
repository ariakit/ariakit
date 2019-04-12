import * as React from "react";
import { As, PropsWithAs, Keys } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { DeepPath } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getLabelId } from "./__utils/getLabelId";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";

export type unstable_FormLabelOptions<
  V,
  P extends DeepPath<V, P>
> = BoxOptions &
  Pick<unstable_FormStateReturn<V>, "baseId" | "values"> & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    label?: any;
  };

export type unstable_FormLabelProps = BoxProps & React.LabelHTMLAttributes<any>;

export function unstable_useFormLabel<V, P extends DeepPath<V, P>>(
  options: unstable_FormLabelOptions<V, P>,
  htmlProps: unstable_FormLabelProps = {}
) {
  options = unstable_useOptions("useFormLabel", options, htmlProps);

  htmlProps = mergeProps(
    {
      children: options.label,
      id: getLabelId(options.name, options.baseId),
      htmlFor: getInputId(options.name, options.baseId)
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useFormLabel", options, htmlProps);
  return htmlProps;
}

const keys: Keys<
  unstable_FormStateReturn<any> & unstable_FormLabelOptions<any, any>
> = [...useBox.__keys, ...unstable_useFormState.__keys, "name", "label"];

unstable_useFormLabel.__keys = keys;

export const unstable_FormLabel = (unstable_createComponent({
  as: "label",
  useHook: unstable_useFormLabel
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "label">(
  props: PropsWithAs<unstable_FormLabelOptions<V, P>, T>
) => JSX.Element;
