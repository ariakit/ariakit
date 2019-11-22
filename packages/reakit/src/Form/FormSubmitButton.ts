import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { ButtonOptions, ButtonHTMLProps, useButton } from "../Button/Button";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { getFirstInvalidInput } from "./__utils/getFirstInvalidInput";

export type unstable_FormSubmitButtonOptions = ButtonOptions &
  Pick<Partial<unstable_FormStateReturn<any>>, "submitting"> &
  Pick<unstable_FormStateReturn<any>, "baseId" | "submit">;

export type unstable_FormSubmitButtonHTMLProps = ButtonHTMLProps;

export type unstable_FormSubmitButtonProps = unstable_FormSubmitButtonOptions &
  unstable_FormSubmitButtonHTMLProps;

export const unstable_useFormSubmitButton = createHook<
  unstable_FormSubmitButtonOptions,
  unstable_FormSubmitButtonHTMLProps
>({
  name: "FormSubmitButton",
  compose: useButton,
  useState: unstable_useFormState,

  useOptions(options) {
    return { disabled: options.submitting, ...options };
  },

  useProps(options, { onClick: htmlOnClick, ...htmlProps }) {
    const onClick = React.useCallback(() => {
      window.requestAnimationFrame(() => {
        const input = getFirstInvalidInput(options.baseId);
        if (input) {
          input.focus();
          if ("select" in input) {
            input.select();
          }
        }
      });
    }, [options.baseId]);

    return {
      type: "submit",
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps
    };
  }
});

export const unstable_FormSubmitButton = createComponent({
  as: "button",
  useHook: unstable_useFormSubmitButton
});
