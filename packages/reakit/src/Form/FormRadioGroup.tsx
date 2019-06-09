import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { As, PropsWithAs } from "reakit-utils/types";
import { createHook } from "reakit-system/createHook";
import { usePipe } from "reakit-utils/usePipe";
import { RoverStateReturn, useRoverState } from "../Rover/RoverState";
import {
  unstable_FormGroupOptions,
  unstable_FormGroupHTMLProps,
  unstable_useFormGroup
} from "./FormGroup";
import { unstable_useFormState } from "./FormState";
import { DeepPath } from "./__utils/types";

export type unstable_FormRadioGroupOptions<
  V,
  P extends DeepPath<V, P>
> = unstable_FormGroupOptions<V, P> & {
  /**
   * FormRadioGroup's name as in form values.
   */
  name: P;
};

export type unstable_FormRadioGroupHTMLProps = unstable_FormGroupHTMLProps &
  React.FieldsetHTMLAttributes<any>;

export type unstable_FormRadioGroupProps<
  V,
  P extends DeepPath<V, P>
> = unstable_FormRadioGroupOptions<V, P> & unstable_FormRadioGroupHTMLProps;

export const FormRadioGroupContext = React.createContext<RoverStateReturn | null>(
  null
);

export const unstable_useFormRadioGroup = createHook<
  unstable_FormRadioGroupOptions<any, any>,
  unstable_FormRadioGroupHTMLProps
>({
  name: "FormRadioGroup",
  compose: unstable_useFormGroup as any,
  useState: unstable_useFormState,
  keys: ["name"],

  useProps(_, { unstable_wrap: htmlWrap, ...htmlProps }) {
    const rover = useRoverState({ loop: true });
    const providerValue = React.useMemo(() => rover, [
      rover.stops,
      rover.currentId,
      rover.unstable_pastId
    ]);

    const wrap = React.useCallback(
      (children: React.ReactNode) => (
        <FormRadioGroupContext.Provider value={providerValue}>
          {children}
        </FormRadioGroupContext.Provider>
      ),
      [providerValue]
    );

    return {
      role: "radiogroup",
      unstable_wrap: usePipe(wrap, htmlWrap),
      ...htmlProps
    };
  }
}) as <V, P extends DeepPath<V, P>>(
  options: unstable_FormRadioGroupOptions<V, P>,
  htmlProps?: unstable_FormRadioGroupHTMLProps
) => unstable_FormRadioGroupHTMLProps;

export const unstable_FormRadioGroup = (createComponent({
  as: "fieldset",
  useHook: unstable_useFormRadioGroup
}) as unknown) as <V, P extends DeepPath<V, P>, T extends As = "fieldset">(
  props: PropsWithAs<unstable_FormRadioGroupOptions<V, P>, T>
) => JSX.Element;
