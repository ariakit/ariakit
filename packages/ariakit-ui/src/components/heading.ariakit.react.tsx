import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { heading } from "../styles/heading.ts";

export interface HeadingProps
  extends ak.HeadingProps, VariantProps<typeof heading> {}

/**
 * Renders an `h1` to `h6` element. There is no `level` prop: Ariakit derives
 * the element from the surrounding `HeadingLevel` context. Use the `$level`
 * variant when the visual size should differ from the semantic level.
 * @see https://ariakit.com/reference/heading
 *
 * @example
 * <HeadingLevel level={1}>
 *   <Heading>Projects</Heading>
 * </HeadingLevel>
 *
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
 * @see https://ariakit.com/reference/heading-level
 *
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
