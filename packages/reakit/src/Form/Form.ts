import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";

export type unstable_FormOptions = BoxOptions &
  Pick<unstable_FormStateReturn<any>, "submit">;

export type unstable_FormHTMLProps = BoxHTMLProps &
  React.FormHTMLAttributes<any>;

export type unstable_FormProps = unstable_FormOptions & unstable_FormHTMLProps;

export const unstable_useForm = unstable_createHook<
  unstable_FormOptions,
  unstable_FormHTMLProps
>({
  name: "Form",
  compose: useBox,
  useState: unstable_useFormState,

  useProps(options, { onSubmit: htmlOnSubmit, ...htmlProps }) {
    const onSubmit = React.useCallback(
      (event: React.FormEvent) => {
        event.preventDefault();
        options.submit();
      },
      [options.submit]
    );

    return {
      role: "form",
      noValidate: true,
      onSubmit: useAllCallbacks(onSubmit, htmlOnSubmit),
      ...htmlProps
    };
  }
});

export const unstable_Form = unstable_createComponent({
  as: "form",
  useHook: unstable_useForm
});
