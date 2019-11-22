import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { As, PropsWithAs } from "reakit-utils/types";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { ButtonOptions, ButtonHTMLProps, useButton } from "../Button/Button";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { getInputId } from "./__utils/getInputId";
import { getPushButtonId } from "./__utils/getPushButtonId";
import { DeepPath } from "./__utils/types";

export type unstable_FormRemoveButtonOptions<
  V,
  P extends DeepPath<V, P>
> = ButtonOptions &
  Pick<unstable_FormStateReturn<V>, "baseId" | "values" | "remove"> & {
    /**
     * FormInput's name as in form values. This should point to array value.
     */
    name: P;
    /**
     * The index in `form.values[name]` that will be removed.
     */
    index: number;
  };

export type unstable_FormRemoveButtonHTMLProps = ButtonHTMLProps;

export type unstable_FormRemoveButtonProps<
  V,
  P extends DeepPath<V, P>
> = unstable_FormRemoveButtonOptions<V, P> & unstable_FormRemoveButtonHTMLProps;

export const unstable_useFormRemoveButton = createHook<
  unstable_FormRemoveButtonOptions<any, any>,
  unstable_FormRemoveButtonHTMLProps
>({
  name: "FormRemoveButton",
  compose: useButton,
  useState: unstable_useFormState,
  keys: ["name", "index"],

  useOptions(options, { name }) {
    return { name, ...options };
  },

  useProps(options, { onClick: htmlOnClick, ...htmlProps }) {
    const onClick = React.useCallback(() => {
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
          const input = document.querySelector<HTMLInputElement>(nextSelector);
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
    }, [options.remove, options.name, options.index, options.baseId]);

    return {
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps
    };
  }
}) as <V, P extends DeepPath<V, P>>(
  options: unstable_FormRemoveButtonOptions<V, P>,
  htmlProps?: unstable_FormRemoveButtonHTMLProps
) => unstable_FormRemoveButtonHTMLProps;

export const unstable_FormRemoveButton = (createComponent({
  as: "button",
  useHook: unstable_useFormRemoveButton
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "button">(
  props: PropsWithAs<unstable_FormRemoveButtonOptions<V, P>, T>
) => JSX.Element;
