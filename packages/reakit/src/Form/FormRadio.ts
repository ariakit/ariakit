import * as React from "react";
import { unstable_RadioProps, useRadio } from "../Radio/Radio";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { As, PropsWithAs } from "../__utils/types";
import { unstable_BoxOptions, useBox } from "../Box";
import { unstable_FormStateReturn, useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { formatInputName } from "./__utils/formatInputName";
import { DeepPath, DeepPathValue } from "./__utils/types";
import { FormRadioGroupContext } from "./FormRadioGroup";

export type unstable_FormRadioOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_BoxOptions &
  Partial<unstable_FormStateReturn<V>> &
  Pick<unstable_FormStateReturn<V>, "values" | "update" | "blur"> & {
    /** TODO: Description */
    name: P;
    /** TODO: Description */
    value: DeepPathValue<V, P>;
  };

export type unstable_FormRadioProps = unstable_RadioProps;

export function useFormRadio<V, P extends DeepPath<V, P>>(
  options: unstable_FormRadioOptions<V, P>,
  htmlProps: unstable_FormRadioProps = {}
) {
  const rover = React.useContext(FormRadioGroupContext);

  if (!rover) {
    // TODO: Better error
    throw new Error("Missing FormRadioGroup");
  }

  const currentChecked = unstable_getIn(options.values, options.name);
  const checked = currentChecked === options.value;
  const allOptions = { ...rover, ...options, checked };

  htmlProps = mergeProps(
    {
      name: formatInputName(options.name),
      onChange: () => options.update(options.name, options.value),
      onBlur: () => options.blur(options.name),
      onFocus: () => options.update(options.name, options.value)
    } as typeof htmlProps,
    htmlProps
  );

  htmlProps = useRadio(allOptions, htmlProps);
  htmlProps = useHook("useFormRadio", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormRadioOptions<any, any>> = [
  ...useBox.keys,
  ...useFormState.keys,
  "name",
  "value"
];

useFormRadio.keys = keys;

export const FormRadio = (unstable_createComponent(
  "input",
  useFormRadio
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormRadioOptions<V, P>, T>
) => JSX.Element;
