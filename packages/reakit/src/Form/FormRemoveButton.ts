import {
  unstable_ButtonOptions,
  unstable_ButtonProps,
  useButton
} from "../Button/Button";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { As, PropsWithAs } from "../__utils/types";
import { unstable_FormStateReturn, useFormState } from "./FormState";
import { getInputId } from "./__utils/getInputId";
import { getPushButtonId } from "./__utils/getPushButtonId";
import { DeepPath } from "./__utils/types";

export type unstable_FormRemoveButtonOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_ButtonOptions &
  Partial<unstable_FormStateReturn<V>> &
  Pick<unstable_FormStateReturn<V>, "values" | "remove"> & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    index: number;
  };

export type unstable_FormRemoveButtonProps = unstable_ButtonProps;

export function useFormRemoveButton<V, P extends DeepPath<V, P>>(
  options: unstable_FormRemoveButtonOptions<V, P>,
  htmlProps: unstable_FormRemoveButtonProps = {}
) {
  htmlProps = mergeProps(
    {
      onClick: () => {
        options.remove(options.name, options.index);

        const inputId = getInputId(options.name, options.baseId);
        if (!inputId) return;

        window.requestAnimationFrame(() => {
          const selector = `[id^="${inputId}-"]`;
          const inputs = document.querySelectorAll<HTMLInputElement>(selector);

          if (inputs.length) {
            const inputsArray = Array.from(inputs);
            const nextIdx = inputsArray.reduce((final, input) => {
              const match = input.id.match(new RegExp(`${inputId}-([0-9]+)`));
              if (!match) return final;
              const [, idx] = match;
              if (Number(idx) > final && options.index >= final) {
                return Number(idx);
              }
              return final;
            }, 0);
            const nextSelector = `[id^="${inputId}-${nextIdx}"]`;
            const input = document.querySelector<HTMLInputElement>(
              nextSelector
            );
            if (input) {
              input.focus();
              return;
            }
          }
          const pushButtonId = getPushButtonId(options.name, options.baseId);
          if (pushButtonId) {
            const pushButton = document.getElementById(pushButtonId);
            if (pushButton) {
              pushButton.focus();
            }
          }
        });
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useButton(options, htmlProps);
  htmlProps = useHook("useFormRemoveButton", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormRemoveButtonOptions<any, any>> = [
  ...useButton.keys,
  ...useFormState.keys,
  "name",
  "index"
];

useFormRemoveButton.keys = keys;

export const FormRemoveButton = (unstable_createComponent(
  "button",
  useFormRemoveButton
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "button">(
  props: PropsWithAs<unstable_FormRemoveButtonOptions<V, P>, T>
) => JSX.Element;
