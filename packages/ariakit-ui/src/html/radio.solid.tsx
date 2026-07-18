import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { radio, radioDescription, radioLabel } from "../styles/radio.ts";

export interface RadioProps
  extends ComponentProps<"input">, VariantProps<typeof radio> {}

export function Radio(props: RadioProps) {
  const [localProps, variantProps, rest] = splitProps(
    props,
    ["children", "disabled"],
    radio.html.propKeys,
  );
  return (
    <label
      {...radio.html({
        ...variantProps,
        $disabled: variantProps.$disabled ?? localProps.disabled,
      })}
    >
      <input type="radio" disabled={localProps.disabled} {...rest} />
      {localProps.children}
    </label>
  );
}

export interface RadioLabelProps
  extends ComponentProps<"span">, VariantProps<typeof radioLabel> {}

export function RadioLabel(props: RadioLabelProps) {
  const [variantProps, rest] = splitProps(props, radioLabel.html.propKeys);
  return <span {...radioLabel.html(variantProps)} {...rest} />;
}

export interface RadioDescriptionProps
  extends ComponentProps<"span">, VariantProps<typeof radioDescription> {}

export function RadioDescription(props: RadioDescriptionProps) {
  const [variantProps, rest] = splitProps(
    props,
    radioDescription.html.propKeys,
  );
  return <span {...radioDescription.html(variantProps)} {...rest} />;
}
