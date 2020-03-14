import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { As, PropsWithAs } from "reakit-utils/types";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { RadioHTMLProps, useRadio } from "../Radio/Radio";
import { BoxOptions } from "../Box";
import { FormRadioGroupContext } from "./FormRadioGroup";
import { unstable_FormStateReturn, unstable_useFormState } from "./FormState";
import { unstable_getIn } from "./utils/getIn";
import { formatInputName } from "./__utils/formatInputName";
import { DeepPath, DeepPathValue } from "./__utils/types";

export type unstable_FormRadioOptions<
  V,
  P extends DeepPath<V, P>
> = BoxOptions &
  Pick<unstable_FormStateReturn<V>, "values" | "update" | "blur"> & {
    /**
     * FormRadio's name as in form values.
     */
    name: P;
    /**
     * FormRadio's value.
     */
    value: DeepPathValue<V, P>;
  };

export type unstable_FormRadioHTMLProps = RadioHTMLProps;

export type unstable_FormRadioProps<
  V,
  P extends DeepPath<V, P>
> = unstable_FormRadioOptions<V, P> & unstable_FormRadioHTMLProps;

export const unstable_useFormRadio = createHook<
  unstable_FormRadioOptions<any, any>,
  unstable_FormRadioHTMLProps
>({
  name: "FormRadio",
  compose: useRadio,
  useState: unstable_useFormState,
  keys: ["name", "value"],

  useOptions(options, htmlProps) {
    const name = options.name || htmlProps.name;
    const value =
      typeof options.value !== "undefined" ? options.value : htmlProps.value;
    const composite = React.useContext(FormRadioGroupContext);
    const currentChecked = unstable_getIn(options.values, name);
    const checked = currentChecked === value;

    if (!composite) {
      // TODO: Better error
      throw new Error("Missing FormRadioGroup");
    }

    return { ...options, ...composite, checked, name, value };
  },

  useProps(
    options,
    { onChange: htmlOnChange, onBlur: htmlOnBlur, ...htmlProps }
  ) {
    const onChange = React.useCallback(() => {
      options.update(options.name, options.value);
    }, [options.update, options.name, options.value]);

    const onBlur = React.useCallback(() => {
      options.blur(options.name);
    }, [options.blur, options.name]);

    return {
      name: formatInputName(options.name),
      onChange: useAllCallbacks(onChange, htmlOnChange),
      onBlur: useAllCallbacks(onBlur, htmlOnBlur),
      ...htmlProps
    };
  }
}) as <V, P extends DeepPath<V, P>>(
  options: unstable_FormRadioOptions<V, P>,
  htmlProps?: unstable_FormRadioHTMLProps
) => unstable_FormRadioHTMLProps;

export const unstable_FormRadio = (createComponent({
  as: "input",
  useHook: unstable_useFormRadio
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "input">(
  props: PropsWithAs<unstable_FormRadioOptions<V, P>, T>
) => JSX.Element;
