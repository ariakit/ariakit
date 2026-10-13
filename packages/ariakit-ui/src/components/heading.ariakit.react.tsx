import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { heading } from "../styles/heading.ts";

export interface HeadingProps
  extends ak.HeadingProps, VariantProps<typeof heading> {}

/**
 * Renders an `h1` to `h6` element based on the surrounding `HeadingLevel`. Use
 * `$level` to change the visual size without changing the semantic level.
 * @example
 * <HeadingLevel level={1}>
 *   <Heading>Projects</Heading>
 * </HeadingLevel>
 * @example
 * <HeadingLevel level={2}>
 *   <Heading $level={4}>Project details</Heading>
 * </HeadingLevel>
 */
export function Heading(props: HeadingProps) {
  const [variantProps, rest] = splitProps(props, heading);
  return <ak.Heading {...heading.jsx(variantProps)} {...rest} />;
}

export interface HeadingLevelProps extends ak.HeadingLevelProps {}

/**
 * Sets the semantic heading level for descendants without adding an element.
 * @example
 * <HeadingLevel>
 *   <Heading>Projects</Heading>
 *   <HeadingLevel>
 *     <Heading>Active projects</Heading>
 *   </HeadingLevel>
 * </HeadingLevel>
 */
export function HeadingLevel(props: HeadingLevelProps) {
  return <ak.HeadingLevel {...props} />;
}
