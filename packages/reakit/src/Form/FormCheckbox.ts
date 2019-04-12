import * as React from "react";
import { As, PropsWithAs, ArrayValue, Omit, Keys } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  CheckboxOptions,
  CheckboxProps,
  useCheckbox
} from "../Checkbox/Checkbox";
import { DeepPath, DeepPathValue } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getLabelId } from "./__utils/getLabelId";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { formatInputName } from "./__utils/formatInputName";
import { getMessageId } from "./__utils/getMessageId";
import { shouldShowError } from "./__utils/shouldShowError";

export type unstable_FormCheckboxOptions<V, P extends DeepPath<V, P>> = Omit<
  CheckboxOptions,
  "value"
> &
  Pick<
    unstable_FormStateReturn<V>,
    "baseId" | "values" | "update" | "blur" | "touched" | "errors"
  > & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    value?: ArrayValue<DeepPathValue<V, P>>;
  };

export type unstable_FormCheckboxProps = CheckboxProps &
  React.InputHTMLAttributes<any>;

export function unstable_useFormCheckbox<V, P extends DeepPath<V, P>>(
  options: unstable_FormCheckboxOptions<V, P>,
  htmlProps: unstable_FormCheckboxProps = {}
) {
  options = unstable_useOptions("useFormCheckbox", options, htmlProps);

  const isBoolean = typeof options.value === "undefined";
  const currentValue = unstable_getIn(options.values, options.name);
  const setValue = (value: DeepPathValue<V, P>) =>
    options.update(options.name, value);

  htmlProps = mergeProps(
    {
      "aria-invalid": shouldShowError(options, options.name),
      name: formatInputName(options.name),
      onBlur: () => options.blur(options.name)
    } as typeof htmlProps,
    isBoolean
      ? ({
          id: getInputId(options.name, options.baseId),
          "aria-describedby": getMessageId(options.name, options.baseId),
          "aria-labelledby": getLabelId(options.name, options.baseId)
        } as typeof htmlProps)
      : {},
    htmlProps
  );

  htmlProps = useCheckbox(
    {
      ...options,
      currentValue: currentValue as any,
      setValue: setValue as any
    },
    htmlProps
  );
  htmlProps = unstable_useProps("useFormCheckbox", options, htmlProps);
  return htmlProps;
}

const keys: Keys<
  unstable_FormStateReturn<any> & unstable_FormCheckboxOptions<any, any>
> = [...useCheckbox.__keys, ...unstable_useFormState.__keys, "name", "value"];

unstable_useFormCheckbox.__keys = keys;

export const unstable_FormCheckbox = (unstable_createComponent({
  as: "input",
  useHook: unstable_useFormCheckbox
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormCheckboxOptions<V, P>, T>
) => JSX.Element;
