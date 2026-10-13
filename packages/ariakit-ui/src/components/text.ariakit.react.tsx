import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { text } from "../styles/text.ts";

export interface TextProps
  extends ak.RoleProps<"span">, VariantProps<typeof text> {}

/**
 * Renders a span with text colors from its own variants or a parent component's
 * text variants. A color modifier enables the adaptive text color, unless
 * `$text` is set.
 * @example
 * <Text $text="success">Changes saved</Text>
 * @example
 * <Layer $layer="brand">
 *   <Text $textChroma="muted">Project details</Text>
 * </Layer>
 */
export function Text(props: TextProps) {
  const [variantProps, rest] = splitProps(props, text);
  return <ak.Role.span {...text.jsx(variantProps)} {...rest} />;
}
