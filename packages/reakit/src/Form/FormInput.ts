import * as React from "react";
import { As, PropsWithAs, Keys, Omit } from "../__utils/types";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
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

export type unstable_FormInputOptions<V, P extends DeepPath<V, P>> = Omit<
  TabbableOptions,
  "unstable_clickKeys"
> &
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

const defaultClickKeys: string[] = [];

export function unstable_useFormInput<V, P extends DeepPath<V, P>>(
  options: unstable_FormInputOptions<V, P>,
  htmlProps: unstable_FormInputHTMLProps = {}
) {
  options = unstable_useOptions("FormInput", options, htmlProps);

  htmlProps = unstable_mergeProps(
    {
      id: getInputId(options.name, options.baseId),
      name: formatInputName(options.name),
      value: unstable_getIn(options.values, options.name, ""),
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        options.update(options.name, event.target.value as any),
      onBlur: () => options.blur(options.name),
      "aria-describedby": getMessageId(options.name, options.baseId),
      "aria-labelledby": getLabelId(options.name, options.baseId),
      "aria-invalid": shouldShowError(options, options.name)
    } as unstable_FormInputHTMLProps,
    htmlProps
  );

  htmlProps = unstable_useProps("FormInput", options, htmlProps);
  htmlProps = useTabbable(
    { ...options, unstable_clickKeys: defaultClickKeys },
    htmlProps
  );
  return htmlProps;
}

const keys: Keys<
  TabbableOptions &
    unstable_FormStateReturn<any> &
    unstable_FormInputOptions<any, any>
> = [...useTabbable.__keys, ...unstable_useFormState.__keys, "name"];

unstable_useFormInput.__keys = keys;

export const unstable_FormInput = (unstable_createComponent({
  as: "input",
  useHook: unstable_useFormInput
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormInputOptions<V, P>, T>
) => JSX.Element;
