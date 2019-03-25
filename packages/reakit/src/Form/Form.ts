import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";

export type unstable_FormOptions = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<any>> &
  Pick<unstable_FormStateReturn<any>, "submit">;

export type unstable_FormProps = unstable_BoxProps &
  React.FormHTMLAttributes<any>;

export function unstable_useForm(
  options: unstable_FormOptions,
  htmlProps: unstable_FormProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "form",
      noValidate: true,
      onSubmit: event => {
        event.preventDefault();
        options.submit();
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useForm", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_FormOptions> = [
  ...useBox.__keys,
  ...unstable_useFormState.__keys
];

unstable_useForm.__keys = keys;

export const unstable_Form = unstable_createComponent({
  as: "form",
  useHook: unstable_useForm
});
