import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { input } from "../styles/input.ts";

export interface InputProps
  extends ak.FocusableProps<"input">, VariantProps<typeof input> {}

export function Input({ render = <input />, ...props }: InputProps) {
  const [variantProps, rest] = splitProps(props, input);
  return (
    <ak.Focusable render={render} {...input.jsx(variantProps)} {...rest} />
  );
}
