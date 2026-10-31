import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { heading, headingDescription } from "../styles/heading.ts";

export interface HeadingProps
  extends ak.HeadingProps, VariantProps<typeof heading> {}

/**
 * Renders an `h1` to `h6` element based on the surrounding `HeadingLevel`. Use
 * `$level` to change the visual size without changing the semantic level. It
 * has no margins, so the parent sets the space around it.
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

export interface HeadingDescriptionProps
  extends ak.RoleProps<"p">, VariantProps<typeof headingDescription> {}

/**
 * Renders muted text under a `Heading`. It keeps the font size of its parent.
 * Put both as direct children of `Prose` for a tight space between them.
 * @example
 * <Prose>
 *   <Heading>Projects</Heading>
 *   <HeadingDescription>Organize your work.</HeadingDescription>
 * </Prose>
 */
export function HeadingDescription(props: HeadingDescriptionProps) {
  const [variantProps, rest] = splitProps(props, headingDescription);
  return <ak.Role.p {...headingDescription.jsx(variantProps)} {...rest} />;
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
