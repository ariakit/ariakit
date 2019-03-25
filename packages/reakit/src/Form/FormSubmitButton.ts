import {
  unstable_ButtonOptions,
  unstable_ButtonProps,
  useButton
} from "../Button/Button";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { Keys } from "../__utils/types";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { getFirstInvalidInput } from "./__utils/getFirstInvalidInput";

export type unstable_FormSubmitButtonOptions = unstable_ButtonOptions &
  Partial<unstable_FormStateReturn<any>> &
  Pick<unstable_FormStateReturn<any>, "baseId" | "submit">;

export type unstable_FormSubmitButtonProps = unstable_ButtonProps;

export function unstable_useFormSubmitButton(
  options: unstable_FormSubmitButtonOptions,
  htmlProps: unstable_FormSubmitButtonProps = {}
) {
  htmlProps = mergeProps(
    {
      type: "submit",
      disabled: options.submitting,
      onClick: () => {
        window.requestAnimationFrame(() => {
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

const keys: Keys<unstable_FormSubmitButtonOptions> = [
  ...useButton.__keys,
  ...unstable_useFormState.__keys
];

unstable_useFormSubmitButton.__keys = keys;

export const unstable_FormSubmitButton = unstable_createComponent({
  as: "button",
  useHook: unstable_useFormSubmitButton
});
