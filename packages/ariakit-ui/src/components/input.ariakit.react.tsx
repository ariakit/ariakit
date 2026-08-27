import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { input } from "../styles/input.ts";

export interface InputProps
  extends ak.FocusableProps<"input">, VariantProps<typeof input> {}

export function Input(props: InputProps) {
  const [variantProps, rest] = splitProps(props, input);
  // Focusable adds data-focus-visible and disabled handling; the element
  // comes from the render prop, which a user-provided render still wins.
  return (
    <ak.Focusable render={<input />} {...input.jsx(variantProps)} {...rest} />
  );
}
