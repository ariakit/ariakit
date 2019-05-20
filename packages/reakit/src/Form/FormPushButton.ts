import * as React from "react";
import { ButtonOptions, ButtonHTMLProps, useButton } from "../Button/Button";
import { unstable_createComponent } from "../utils/createComponent";
import { ArrayValue, As, PropsWithAs } from "../__utils/types";
import { unstable_createHook } from "../utils/createHook";
import { useAllCallbacks } from "../__utils/useAllCallbacks";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { formatInputName } from "./__utils/formatInputName";
import { getInputId } from "./__utils/getInputId";
import { getPushButtonId } from "./__utils/getPushButtonId";
import { DeepPath, DeepPathValue } from "./__utils/types";

export type unstable_FormPushButtonOptions<
  V,
  P extends DeepPath<V, P>
> = ButtonOptions &
  Pick<unstable_FormStateReturn<V>, "baseId" | "values" | "push"> & {
    /**
     * FormInput's name as in form values. This should point to array value.
     */
    name: P;
    /**
     * The value that is going to be pushed to `form.values[name]`.
     */
    value: ArrayValue<DeepPathValue<V, P>>;
  };

export type unstable_FormPushButtonHTMLProps = ButtonHTMLProps;

export type unstable_FormPushButtonProps<
  V,
  P extends DeepPath<V, P>
> = unstable_FormPushButtonOptions<V, P> & unstable_FormPushButtonHTMLProps;

export const unstable_useFormPushButton = unstable_createHook<
  unstable_FormPushButtonOptions<any, any>,
  unstable_FormPushButtonHTMLProps
>({
  name: "FormPushButton",
  compose: useButton,
  useState: unstable_useFormState,
  keys: ["name", "value"],

  useProps(options, { onClick: htmlOnClick, ...htmlProps }) {
    const onClick = React.useCallback(() => {
      options.push(options.name, options.value);
      const { length } = unstable_getIn(options.values, options.name, []);
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
    }, [
      options.push,
      options.name,
      options.value,
      options.values,
      options.baseId
    ]);

    return {
      id: getPushButtonId(options.name, options.baseId),
      onClick: useAllCallbacks(onClick, htmlOnClick),
      ...htmlProps
    };
  }
}) as <V, P extends DeepPath<V, P>>(
  options: unstable_FormPushButtonOptions<V, P>,
  htmlProps?: unstable_FormPushButtonHTMLProps
) => unstable_FormPushButtonHTMLProps;

export const unstable_FormPushButton = (unstable_createComponent({
  as: "button",
  useHook: unstable_useFormPushButton
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "button">(
  props: PropsWithAs<unstable_FormPushButtonOptions<V, P>, T>
) => JSX.Element;
