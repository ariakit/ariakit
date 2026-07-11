import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { input } from "../styles/input.ts";

export interface InputProps
  extends ComponentProps<"input">, VariantProps<typeof input> {}

export function Input(props: InputProps) {
  const [variantProps, rest] = splitProps(props, input);
  return <input {...input.jsx(variantProps)} {...rest} />;
}
