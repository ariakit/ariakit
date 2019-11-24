import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  unstable_IdGroupOptions,
  unstable_IdGroupHTMLProps,
  unstable_useIdGroup
} from "../Id/IdGroup";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";

export type unstable_FormOptions = unstable_IdGroupOptions &
  Pick<unstable_FormStateReturn<any>, "submit">;

export type unstable_FormHTMLProps = unstable_IdGroupHTMLProps &
  React.FormHTMLAttributes<any>;

export type unstable_FormProps = unstable_FormOptions & unstable_FormHTMLProps;

export const unstable_useForm = createHook<
  unstable_FormOptions,
  unstable_FormHTMLProps
>({
  name: "Form",
  compose: unstable_useIdGroup,
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

export const unstable_Form = createComponent({
  as: "form",
  useHook: unstable_useForm
});
