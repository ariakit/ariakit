import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { glider, gliderGroup, gliderSeparator } from "../styles/glider.ts";

export interface GliderProps
  extends ComponentProps<"div">, VariantProps<typeof glider> {}

/**
 * Renders the div that glides between controls to highlight the hovered,
 * focused, or selected one. It requires a GliderGroup ancestor and preceding
 * sibling controls that compose the glider anchor, and hides itself in
 * browsers without CSS anchor positioning support.
 */
export function Glider(props: GliderProps) {
  const [variantProps, rest] = splitProps(props, glider);
  return <div {...glider.jsx(variantProps)} {...rest} />;
}

export interface GliderGroupProps
  extends ComponentProps<"div">, VariantProps<typeof gliderGroup> {}

/**
 * Renders the group div that scopes the anchor names shared by a Glider and
 * its sibling controls.
 */
export function GliderGroup(props: GliderGroupProps) {
  const [variantProps, rest] = splitProps(props, gliderGroup);
  return <div {...gliderGroup.jsx(variantProps)} {...rest} />;
}

export interface GliderSeparatorProps
  extends ComponentProps<"div">, VariantProps<typeof gliderSeparator> {}

/**
 * Renders a decorative divider div placed between adjacent controls inside a
 * GliderGroup.
 */
export function GliderSeparator(props: GliderSeparatorProps) {
  const [variantProps, rest] = splitProps(props, gliderSeparator);
  return <div {...gliderSeparator.jsx(variantProps)} {...rest} />;
}
