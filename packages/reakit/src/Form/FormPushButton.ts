import { ButtonOptions, ButtonProps, useButton } from "../Button/Button";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { ArrayValue, As, PropsWithAs, Keys } from "../__utils/types";
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
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    value: ArrayValue<DeepPathValue<V, P>>;
  };

export type unstable_FormPushButtonProps = ButtonProps;

export function unstable_useFormPushButton<V, P extends DeepPath<V, P>>(
  options: unstable_FormPushButtonOptions<V, P>,
  htmlProps: unstable_FormPushButtonProps = {}
) {
  options = unstable_useOptions("useFormPushButton", options, htmlProps);

  htmlProps = mergeProps(
    {
      id: getPushButtonId(options.name, options.baseId),
      onClick: () => {
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
      }
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useButton(options, htmlProps);
  htmlProps = unstable_useProps("useFormPushButton", options, htmlProps);
  return htmlProps;
}

const keys: Keys<
  unstable_FormStateReturn<any> & unstable_FormPushButtonOptions<any, any>
> = [...useButton.__keys, ...unstable_useFormState.__keys, "name", "value"];

unstable_useFormPushButton.__keys = keys;

export const unstable_FormPushButton = (unstable_createComponent({
  as: "button",
  useHook: unstable_useFormPushButton
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "button">(
  props: PropsWithAs<unstable_FormPushButtonOptions<V, P>, T>
) => JSX.Element;
