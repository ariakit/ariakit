import * as React from "react";
import { As, PropsWithAs, ArrayValue, Omit } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import {
  unstable_CheckboxOptions,
  unstable_CheckboxProps,
  useCheckbox
} from "../Checkbox/Checkbox";
import { removeItemFromArray } from "../__utils/removeItemFromArray";
import { DeepPath, DeepPathValue } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getLabelId } from "./__utils/getLabelId";
import { unstable_FormStateReturn, useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { formatInputName } from "./__utils/formatInputName";
import { getMessageId } from "./__utils/getMessageId";
import { shouldShowError } from "./__utils/shouldShowError";

export type unstable_FormCheckboxOptions<V, P extends DeepPath<V, P>> = Omit<
  unstable_CheckboxOptions,
  "value" | "update"
> &
  Partial<unstable_FormStateReturn<V>> &
  Pick<
    unstable_FormStateReturn<V>,
    "values" | "update" | "blur" | "touched" | "errors"
  > & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    value?: ArrayValue<DeepPathValue<V, P>>;
  };

export type unstable_FormCheckboxProps = unstable_CheckboxProps &
  React.InputHTMLAttributes<any>;

export function useFormCheckbox<V, P extends DeepPath<V, P>>(
  options: unstable_FormCheckboxOptions<V, P>,
  htmlProps: unstable_FormCheckboxProps = {}
) {
  const isBoolean = typeof options.value === "undefined";
  const checked = isBoolean
    ? Boolean(unstable_getIn(options.values, options.name))
    : unstable_getIn(options.values, options.name, [] as any[]).indexOf(
        options.value
      ) !== -1;

  const update = () => {
    if (isBoolean) {
      options.update(options.name, !checked as any);
    } else {
      options.update(options.name, value => {
        const arrayVal: any[] = Array.isArray(value) ? value : [];
        if (checked) {
          return removeItemFromArray(arrayVal, options.value) as typeof value;
        }
        return [...arrayVal, options.value] as typeof value;
      });
    }
  };

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
    { ...options, update, checked, toggle: update },
    htmlProps
  );
  htmlProps = useHook("useFormCheckbox", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormCheckboxOptions<any, any>> = [
  ...useCheckbox.keys,
  ...useFormState.keys,
  "name",
  "value"
];

useFormCheckbox.keys = keys;

export const FormCheckbox = (unstable_createComponent(
  "input",
  useFormCheckbox
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormCheckboxOptions<V, P>, T>
) => JSX.Element;
