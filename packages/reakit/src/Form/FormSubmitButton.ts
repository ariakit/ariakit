import { ButtonOptions, ButtonProps, useButton } from "../Button/Button";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { Keys } from "../__utils/types";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { getFirstInvalidInput } from "./__utils/getFirstInvalidInput";

export type unstable_FormSubmitButtonOptions = ButtonOptions &
  Pick<Partial<unstable_FormStateReturn<any>>, "submitting"> &
  Pick<unstable_FormStateReturn<any>, "baseId" | "submit">;

export type unstable_FormSubmitButtonProps = ButtonProps;

export function unstable_useFormSubmitButton(
  options: unstable_FormSubmitButtonOptions,
  htmlProps: unstable_FormSubmitButtonProps = {}
) {
  options = unstable_useOptions("useFormSubmitButton", options, htmlProps);

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
  htmlProps = unstable_useProps("useFormSubmitButton", options, htmlProps);
  return htmlProps;
}

const keys: Keys<
  unstable_FormStateReturn<any> & unstable_FormSubmitButtonOptions
> = [...useButton.__keys, ...unstable_useFormState.__keys];

unstable_useFormSubmitButton.__keys = keys;

export const unstable_FormSubmitButton = unstable_createComponent({
  as: "button",
  useHook: unstable_useFormSubmitButton
});
