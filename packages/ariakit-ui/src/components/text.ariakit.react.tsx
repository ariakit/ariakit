import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { text } from "../styles/text.ts";

export interface TextProps
  extends ak.RoleProps<"span">, VariantProps<typeof text> {}

/**
 * Renders a span that receives text colors from its own variants or a parent
 * layer's text variants.
 * @example
 * <Text $text="success">Changes saved</Text>
 * @example
 * <Layer $layer="brand">
 *   <Text>Project details</Text>
 * </Layer>
 */
export function Text(props: TextProps) {
  const [variantProps, rest] = splitProps(props, text);
  return <ak.Role.span {...text.jsx(variantProps)} {...rest} />;
}
