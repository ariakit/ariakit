import * as React from "react";
import { ButtonOptions, ButtonHTMLProps, useButton } from "../Button/Button";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_createHook } from "../utils/createHook";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { getFirstInvalidInput } from "./__utils/getFirstInvalidInput";

export type unstable_FormSubmitButtonOptions = ButtonOptions &
  Pick<Partial<unstable_FormStateReturn<any>>, "submitting"> &
  Pick<unstable_FormStateReturn<any>, "baseId" | "submit">;

export type unstable_FormSubmitButtonHTMLProps = ButtonHTMLProps;

export type unstable_FormSubmitButtonProps = unstable_FormSubmitButtonOptions &
  unstable_FormSubmitButtonHTMLProps;

export const unstable_useFormSubmitButton = unstable_createHook<
  unstable_FormSubmitButtonOptions,
  unstable_FormSubmitButtonHTMLProps
>({
  name: "FormSubmitButton",
  compose: useButton,
  useState: unstable_useFormState,

  useProps(options, { onClick: htmlOnClick, ...htmlProps }) {
    const onClick = React.useCallback(() => {
      window.requestAnimationFrame(() => {
        const input = getFirstInvalidInput(options.baseId);
        if (input) {
          input.select();
          input.focus();
        }
      });
    }, [options.baseId]);

    return {
      type: "submit",
      disabled: options.submitting,
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps
    };
  }
});

export const unstable_FormSubmitButton = unstable_createComponent({
  as: "button",
  useHook: unstable_useFormSubmitButton
});
