import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { radio, radioDescription, radioLabel } from "../styles/radio.ts";

export interface RadioProps
  extends ComponentProps<"input">, VariantProps<typeof radio> {}

export function Radio({ children, ...props }: RadioProps) {
  const [variantProps, rest] = splitProps(props, radio);
  return (
    <label
      {...radio.jsx({
        ...variantProps,
        $disabled: variantProps.$disabled ?? rest.disabled,
      })}
    >
      <input type="radio" {...rest} />
      {children}
    </label>
  );
}

export interface RadioLabelProps
  extends ComponentProps<"span">, VariantProps<typeof radioLabel> {}

export function RadioLabel(props: RadioLabelProps) {
  const [variantProps, rest] = splitProps(props, radioLabel);
  return <span {...radioLabel.jsx(variantProps)} {...rest} />;
}

export interface RadioDescriptionProps
  extends ComponentProps<"span">, VariantProps<typeof radioDescription> {}

export function RadioDescription(props: RadioDescriptionProps) {
  const [variantProps, rest] = splitProps(props, radioDescription);
  return <span {...radioDescription.jsx(variantProps)} {...rest} />;
}
