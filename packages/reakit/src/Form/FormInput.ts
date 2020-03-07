import * as React from "react";
import { As, PropsWithAs } from "reakit-utils/types";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import {
  TabbableOptions,
  TabbableHTMLProps,
  useTabbable
} from "../Tabbable/Tabbable";
import { DeepPath } from "./__utils/types";
import { getInputId } from "./__utils/getInputId";
import { getMessageId } from "./__utils/getMessageId";
import { getLabelId } from "./__utils/getLabelId";
import { shouldShowError } from "./__utils/shouldShowError";
import { formatInputName } from "./__utils/formatInputName";
import { unstable_getIn } from "./utils/getIn";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";

export type unstable_FormInputOptions<
  V,
  P extends DeepPath<V, P>
> = TabbableOptions &
  Pick<
    unstable_FormStateReturn<V>,
    "baseId" | "values" | "touched" | "errors" | "update" | "blur"
  > & {
    /**
     * FormInput's name as in form values.
     */
    name: P;
  };

export type unstable_FormInputHTMLProps = TabbableHTMLProps &
  React.InputHTMLAttributes<any>;

export type unstable_FormInputProps<
  V,
  P extends DeepPath<V, P>
> = unstable_FormInputOptions<V, P> & unstable_FormInputHTMLProps;

export const unstable_useFormInput = createHook<
  unstable_FormInputOptions<any, any>,
  unstable_FormInputHTMLProps
>({
  name: "FormInput",
  compose: useTabbable,
  useState: unstable_useFormState,
  keys: ["name"],

  useOptions(options, { name }) {
    return { name, ...options };
  },

  useProps(
    options,
    { onChange: htmlOnChange, onBlur: htmlOnBlur, ...htmlProps }
  ) {
    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        options.update(options.name, event.target.value);
      },
      [options.update, options.name]
    );

    const onBlur = React.useCallback(() => {
      options.blur(options.name);
    }, [options.blur, options.name]);

    return {
      id: getInputId(options.name, options.baseId),
      name: formatInputName(options.name),
      value: unstable_getIn(options.values, options.name, ""),
      onChange: useAllCallbacks(onChange, htmlOnChange),
      onBlur: useAllCallbacks(onBlur, htmlOnBlur),
      "aria-describedby": getMessageId(options.name, options.baseId),
      "aria-labelledby": getLabelId(options.name, options.baseId),
      "aria-invalid": shouldShowError(options, options.name),
      ...htmlProps
    };
  }
}) as <V, P extends DeepPath<V, P>>(
  options: unstable_FormInputOptions<V, P>,
  htmlProps?: unstable_FormInputHTMLProps
) => unstable_FormInputHTMLProps;

export const unstable_FormInput = (createComponent({
  as: "input",
  useHook: unstable_useFormInput
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormInputOptions<V, P>, T>
) => JSX.Element;
