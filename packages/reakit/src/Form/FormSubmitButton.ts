import {
  unstable_ButtonOptions,
  unstable_ButtonProps,
  useButton
} from "../Button/Button";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_FormStateReturn, useFormState } from "./FormState";
import { getFirstInvalidInput } from "./__utils/getFirstInvalidInput";

export type unstable_FormSubmitButtonOptions = unstable_ButtonOptions &
  Partial<unstable_FormStateReturn<any>> &
  Pick<unstable_FormStateReturn<any>, "submit">;

export type unstable_FormSubmitButtonProps = unstable_ButtonProps;

export function useFormSubmitButton(
  options: unstable_FormSubmitButtonOptions,
  htmlProps: unstable_FormSubmitButtonProps = {}
) {
  htmlProps = mergeProps(
    {
      type: "submit",
      disabled: options.submitting,
      onClick: () => {
        window.requestAnimationFrame(() => {
          if (!options.baseId) return;
          const input = getFirstInvalidInput(options.baseId);
          if (input) {
            input.select();
            input.focus();
          }
        });
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useButton(options, htmlProps);
  htmlProps = useHook("useFormSubmitButton", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormSubmitButtonOptions> = [
  ...useButton.keys,
  ...useFormState.keys
];

useFormSubmitButton.keys = keys;

export const FormSubmitButton = unstable_createComponent(
  "button",
  useFormSubmitButton
);
