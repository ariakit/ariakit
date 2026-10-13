import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { separator } from "../styles/separator.ts";

export interface SeparatorProps
  extends ak.RoleProps<"hr">, VariantProps<typeof separator> {}

/**
 * Renders a rule between sections. Use the `$edge*` variants to set the line
 * color. Layer variants set the surface color used to calculate the edge.
 * @example
 * <Prose>
 *   <p>Project details</p>
 *   <Separator $line="solid" />
 *   <p>Project activity</p>
 * </Prose>
 */
export function Separator(props: SeparatorProps) {
  const [variantProps, rest] = splitProps(props, separator);
  return (
    <ak.Role.hr role="separator" {...separator.jsx(variantProps)} {...rest} />
  );
}
