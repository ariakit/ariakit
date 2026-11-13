import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { font } from "../styles/font.ts";

export interface FontProps
  extends ak.RoleProps<"span">, VariantProps<typeof font> {}

/**
 * Renders a span with a font family, size, and line height. A number in `$size`
 * multiplies the font size of the parent and gives smaller text a smaller line
 * height, like the Tailwind text scale.
 * @example
 * <Font $size={0.875} render={<p />}>
 *   4 days ago
 * </Font>
 * @example
 * <Font $font="mono">v1.2.0</Font>
 */
export function Font(props: FontProps) {
  const [variantProps, rest] = splitProps(props, font);
  return <ak.Role.span {...font.jsx(variantProps)} {...rest} />;
}
