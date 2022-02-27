import { MouseEvent, useCallback } from "react";
import { useEventCallback } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { ButtonOptions, useButton } from "../button";
import { FormContext } from "./__utils";
import { FormState } from "./form-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a reset buttom in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const state = useFormState();
 * const props = useFormReset({ state });
 * <Form state={state}>
 *   <Role {...props}>Reset</Role>
 * </Form>
 * ```
 */
export const useFormReset = createHook<FormResetOptions>(
  ({ state, ...props }) => {
    state = useStore(state || FormContext, [`submitting`]);

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state?.reset();
      },
      [onClickProp, state?.reset]
    );

    props = {
      type: "reset",
      disabled: state?.submitting,
      ...props,
    };

    return useButton({
      ...props,
      onClick,
    });
  }
);

/**
 * A component that renders a reset buttom in a form.
 * @see https://ariakit.org/components/form
 * @example
 * ```jsx
 * const form = useFormState();
 * <Form state={form}>
 *   <FormReset>Reset</FormReset>
 * </Form>
 * ```
 */
export const FormReset = createComponent<FormResetOptions>((props) => {
  const htmlProps = useFormReset(props);
  return createElement(`button`, htmlProps);
});

export type FormResetOptions<T extends As = "button"> = ButtonOptions<T> & {
  /**
   * Object returned by the `useFormState` hook. If not provided, the parent
   * `Form` component's context will be used.
   */
  state?: FormState;
};

export type FormResetProps<T extends As = "button"> = Props<
  FormResetOptions<T>
>;
