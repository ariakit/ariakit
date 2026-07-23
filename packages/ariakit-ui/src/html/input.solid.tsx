import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { input } from "../styles/input.ts";

export interface InputProps
  extends ComponentProps<"input">, VariantProps<typeof input> {}

export function Input(props: InputProps) {
  const [variantProps, rest] = splitProps(props, input.html.propKeys);
  return <input {...input.html(variantProps)} {...rest} />;
}
