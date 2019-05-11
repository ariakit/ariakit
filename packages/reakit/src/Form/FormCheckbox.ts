import * as React from "react";
import { As, PropsWithAs, ArrayValue, Omit, Keys } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  CheckboxOptions,
  CheckboxHTMLProps,
  useCheckbox
} from "../Checkbox/Checkbox";
import { TabbableOptions } from "../Tabbable/Tabbable";
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
  "value" | "state" | "setState"
> &
  Pick<
    unstable_FormStateReturn<V>,
    "baseId" | "values" | "update" | "blur" | "touched" | "errors"
  > & {
    /**
     * Checkbox's name as in form values.
     */
    name: P;
    /**
     * Checkbox's value is going to be used when multiple checkboxes share the
     * same state. Checking a checkbox with value will add it to the state
     * array.
     */
    value?: ArrayValue<DeepPathValue<V, P>>;
  };

export type unstable_FormCheckboxHTMLProps = CheckboxHTMLProps &
  React.InputHTMLAttributes<any>;

export type unstable_FormCheckboxProps<
  V,
  P extends DeepPath<V, P>
> = unstable_FormCheckboxOptions<V, P> & unstable_FormCheckboxHTMLProps;

export function unstable_useFormCheckbox<V, P extends DeepPath<V, P>>(
  options: unstable_FormCheckboxOptions<V, P>,
  htmlProps: unstable_FormCheckboxHTMLProps = {}
) {
  options = unstable_useOptions("FormCheckbox", options, htmlProps);

  const isBoolean = typeof options.value === "undefined";
  const state = unstable_getIn(options.values, options.name);
  const setState = (value: DeepPathValue<V, P>) =>
    options.update(options.name, value);

  htmlProps = mergeProps(
    {
      "aria-invalid": shouldShowError(options, options.name),
      name: formatInputName(options.name),
      onBlur: () => options.blur(options.name)
    } as unstable_FormCheckboxHTMLProps,
    isBoolean
      ? ({
          id: getInputId(options.name, options.baseId),
          "aria-describedby": getMessageId(options.name, options.baseId),
          "aria-labelledby": getLabelId(options.name, options.baseId)
        } as unstable_FormCheckboxHTMLProps)
      : {},
    htmlProps
  );

  htmlProps = unstable_useProps("FormCheckbox", options, htmlProps);
  htmlProps = useCheckbox(
    {
      ...options,
      state: state as any,
      setState: setState as any
    },
    htmlProps
  );
  return htmlProps;
}

const keys: Keys<
  TabbableOptions &
    CheckboxOptions &
    unstable_FormStateReturn<any> &
    unstable_FormCheckboxOptions<any, any>
> = [...useCheckbox.__keys, ...unstable_useFormState.__keys, "name", "value"];

unstable_useFormCheckbox.__keys = keys;

export const unstable_FormCheckbox = (unstable_createComponent({
  as: "input",
  useHook: unstable_useFormCheckbox
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormCheckboxOptions<V, P>, T>
) => JSX.Element;
