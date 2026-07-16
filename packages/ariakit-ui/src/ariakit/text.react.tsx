import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { text } from "../styles/text.ts";

export interface TextProps
  extends ak.RoleProps<"span">, VariantProps<typeof text> {}

/**
 * A span that serves as a text-color target for the text system. Text
 * variants set on a `$layer` element affect descendant text/SVG targets like
 * this one rather than the layer's direct text.
 */
export function Text(props: TextProps) {
  const [variantProps, rest] = splitProps(props, text);
  return <ak.Role.span {...text.jsx(variantProps)} {...rest} />;
}
