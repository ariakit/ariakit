import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { text } from "../styles/text.ts";

export interface TextProps
  extends ak.RoleProps<"span">, VariantProps<typeof text> {}

/**
 * Renders a span of text with a font, a strength, and a color. Without a color
 * variant, it sets no color of its own and takes a parent component's text
 * variants. A color modifier that emits output enables the adaptive text color,
 * unless `$text` is set. `$textPush={0}`, for example, emits none. A number in
 * `$size` multiplies the font size of the parent and gives smaller text a
 * smaller line height, like the Tailwind text scale.
 * @example
 * <Text $size={0.875} $ink={60} render={<p />}>
 *   4 days ago
 * </Text>
 * @example
 * <Text $font="mono">v1.2.0</Text>
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
