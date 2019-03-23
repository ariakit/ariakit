import * as React from "react";
import { unstable_RoverStateReturn, useRoverState } from "../Rover/RoverState";
import { useHook } from "../system/useHook";
import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { As, PropsWithAs } from "../__utils/types";
import {
  unstable_FormGroupOptions,
  unstable_FormGroupProps,
  useFormGroup
} from "./FormGroup";
import { unstable_FormStateReturn, useFormState } from "./FormState";
import { DeepPath } from "./__utils/types";

export type unstable_FormRadioGroupOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_FormGroupOptions<V, P> &
  Partial<unstable_FormStateReturn<V>> &
  Pick<unstable_FormStateReturn<V>, "touched" | "errors"> & {
    /** TODO: Description */
    name: P;
  };

export type unstable_FormRadioGroupProps = unstable_FormGroupProps &
  React.FieldsetHTMLAttributes<any>;

export const FormRadioGroupContext = React.createContext<unstable_RoverStateReturn | null>(
  null
);

export function useFormRadioGroup<V, P extends DeepPath<V, P>>(
  options: unstable_FormRadioGroupOptions<V, P>,
  htmlProps: unstable_FormRadioGroupProps = {}
) {
  htmlProps = mergeProps({ role: "radiogroup" } as typeof htmlProps, htmlProps);
  htmlProps = useFormGroup(options, htmlProps);
  htmlProps = useHook("useFormRadioGroup", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_FormRadioGroupOptions<any, any>> = [
  ...useFormGroup.keys,
  ...useFormState.keys,
  "name"
];

useFormRadioGroup.keys = keys;

export const FormRadioGroup = (unstable_createComponent(
  "fieldset",
  useFormRadioGroup,
  (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    const rover = useRoverState({ loop: true });
    const value = React.useMemo(() => rover, [
      rover.stops,
      rover.currentId,
      rover.pastId
    ]);
    return (
      <FormRadioGroupContext.Provider value={value}>
        {element}
      </FormRadioGroupContext.Provider>
    );
  }
) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "fieldset">(
  props: PropsWithAs<unstable_FormRadioGroupOptions<V, P>, T>
) => JSX.Element;
