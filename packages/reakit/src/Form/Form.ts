import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";

export type unstable_FormOptions = BoxOptions &
  Pick<unstable_FormStateReturn<any>, "submit">;

export type unstable_FormHTMLProps = BoxHTMLProps &
  React.FormHTMLAttributes<any>;

export type unstable_FormProps = unstable_FormOptions & unstable_FormHTMLProps;

export function unstable_useForm(
  options: unstable_FormOptions,
  htmlProps: unstable_FormHTMLProps = {}
) {
  options = unstable_useOptions("Form", options, htmlProps);

  htmlProps = mergeProps(
    {
      role: "form",
      noValidate: true,
      onSubmit: event => {
        event.preventDefault();
        options.submit();
      }
    } as unstable_FormHTMLProps,
    htmlProps
  );

  htmlProps = unstable_useProps("Form", options, htmlProps);
  htmlProps = useBox(options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_FormStateReturn<any> & unstable_FormOptions> = [
  ...useBox.__keys,
  ...unstable_useFormState.__keys
];

unstable_useForm.__keys = keys;

export const unstable_Form = unstable_createComponent({
  as: "form",
  useHook: unstable_useForm
});
