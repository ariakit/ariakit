import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { radio, radioDescription, radioLabel } from "../styles/radio.ts";

export interface RadioProviderProps extends ak.RadioProviderProps {}

/**
 * Provides a radio store to `RadioGroup` and `Radio` descendants.
 * @see https://ariakit.com/reference/radio-provider
 */
export function RadioProvider(props: RadioProviderProps) {
  return <ak.RadioProvider {...props} />;
}

export interface RadioGroupProps extends ak.RadioGroupProps {}

/**
 * Groups `Radio` components. Requires a `store` prop or a `RadioProvider`
 * ancestor.
 * @see https://ariakit.com/reference/radio-group
 */
export function RadioGroup(props: RadioGroupProps) {
  return <ak.RadioGroup {...props} />;
}

export interface RadioProps extends ak.RadioProps, VariantProps<typeof radio> {}

/**
 * Radio button rendered as a label wrapping a visually hidden `ak.Radio`
 * input, so children become the clickable label content.
 * @see https://ariakit.com/reference/radio
 */
export function Radio({ children, ...props }: RadioProps) {
  const [variantProps, rest] = splitProps(props, radio);
  // The input is visually hidden, so the disabled look must be painted on the
  // wrapping label through the $disabled variant instead of the input's
  // native pseudo class.
  return (
    <label
      {...radio.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
    >
      <ak.Radio {...rest} />
      {children}
    </label>
  );
}

export interface RadioLabelProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioLabel> {}

/**
 * Label text for a radio. Must be rendered inside a `Radio` component.
 */
export function RadioLabel(props: RadioLabelProps) {
  const [variantProps, rest] = splitProps(props, radioLabel);
  return <ak.Role.span {...radioLabel.jsx(variantProps)} {...rest} />;
}

export interface RadioDescriptionProps
  extends ak.RoleProps<"span">, VariantProps<typeof radioDescription> {}

/**
 * Secondary text below a radio's label. Must be rendered inside a `Radio`
 * component.
 */
export function RadioDescription(props: RadioDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioDescription);
  return <ak.Role.span {...radioDescription.jsx(variantProps)} {...rest} />;
}
