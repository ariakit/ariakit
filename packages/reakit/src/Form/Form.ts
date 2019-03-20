import * as React from "react";

import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";

import { unstable_FormStateReturn, useFormState } from "./FormState";

export type unstable_FormOptions = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<any>> &
  Pick<unstable_FormStateReturn<any>, "submit">;

export type unstable_FormProps = unstable_BoxProps &
  React.FormHTMLAttributes<any>;

export function useForm(
  options: unstable_FormOptions,
  htmlProps: unstable_FormProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "form",
      noValidate: true,
      onSubmit: e => {
        e.preventDefault();
        options.submit();
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useForm", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormOptions> = [
  ...useBox.keys,
  ...useFormState.keys
];

useForm.keys = keys;

export const Form = unstable_createComponent("form", useForm);
