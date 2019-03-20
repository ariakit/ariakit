import * as React from "react";
import { As, PropsWithAs } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { DeepPath } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getMessageId } from "./__utils/getMessageId";
import { getLabelId } from "./__utils/getLabelId";
import { shouldShowError } from "./__utils/shouldShowError";
import { formatInputName } from "./__utils/formatInputName";
import { unstable_getIn } from "./utils/getIn";
import { unstable_FormStateReturn, useFormState } from "./FormState";

export type unstable_FormInputOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<V>> &
  Pick<
    unstable_FormStateReturn<V>,
    "values" | "touched" | "errors" | "update" | "blur"
  > & {
    /** TODO: Description */
    name: P;
  };

export type unstable_FormInputProps = unstable_BoxProps &
  React.InputHTMLAttributes<any>;

export function useFormInput<V, P extends DeepPath<V, P>>(
  options: unstable_FormInputOptions<V, P>,
  htmlProps: unstable_FormInputProps = {}
) {
  htmlProps = mergeProps(
    {
      id: getInputId(options.name, options.baseId),
      name: formatInputName(options.name),
      value: unstable_getIn(options.values, options.name),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        options.update(options.name, e.target.value as any),
      onBlur: () => options.blur(options.name),
      "aria-describedby": getMessageId(options.name, options.baseId),
      "aria-labelledby": getLabelId(options.name, options.baseId),
      "aria-invalid": shouldShowError(options, options.name)
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useFormInput", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormInputOptions<any, any>> = [
  ...useBox.keys,
  ...useFormState.keys,
  "name"
];

useFormInput.keys = keys;

export const FormInput = (unstable_createComponent(
  "input",
  useFormInput
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormInputOptions<V, P>, T>
) => JSX.Element;
