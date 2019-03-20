import {
  unstable_ButtonOptions,
  unstable_ButtonProps,
  useButton
} from "../Button/Button";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { ArrayValue, As, PropsWithAs } from "../__utils/types";
import { unstable_FormStateReturn, useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { formatInputName } from "./__utils/formatInputName";
import { getInputId } from "./__utils/getInputId";
import { getPushButtonId } from "./__utils/getPushButtonId";
import { DeepPath, DeepPathValue } from "./__utils/types";

export type unstable_FormPushButtonOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_ButtonOptions &
  Partial<unstable_FormStateReturn<V>> &
  Pick<unstable_FormStateReturn<V>, "values" | "push"> & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    value: ArrayValue<DeepPathValue<V, P>>;
  };

export type unstable_FormPushButtonProps = unstable_ButtonProps;

export function useFormPushButton<V, P extends DeepPath<V, P>>(
  options: unstable_FormPushButtonOptions<V, P>,
  htmlProps: unstable_FormPushButtonProps = {}
) {
  htmlProps = mergeProps(
    {
      id: getPushButtonId(options.name, options.baseId),
      onClick: () => {
        options.push(options.name, options.value);
        const { length } = unstable_getIn(options.values, options.name, []);

        if (!options.baseId) return;

        const inputId = getInputId(
          `${formatInputName(options.name, "-")}-${length}`,
          options.baseId
        );
        if (!inputId) return;

        window.requestAnimationFrame(() => {
          const selector = `[id^="${inputId}"]`;
          const input = document.querySelector<HTMLElement>(selector);
          if (input) {
            input.focus();
          }
        });
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useButton(options, htmlProps);
  htmlProps = useHook("useFormPushButton", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormPushButtonOptions<any, any>> = [
  ...useButton.keys,
  ...useFormState.keys,
  "name",
  "value"
];

useFormPushButton.keys = keys;

export const FormPushButton = (unstable_createComponent(
  "button",
  useFormPushButton
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "button">(
  props: PropsWithAs<unstable_FormPushButtonOptions<V, P>, T>
) => JSX.Element;
