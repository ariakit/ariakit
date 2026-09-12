import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { separator } from "../styles/separator.ts";

export interface SeparatorProps
  extends ak.RoleProps<"hr">, VariantProps<typeof separator> {}

/**
 * Renders a rule between sections. The rule paints only its edge, so color it
 * with the `$edge*` variants. The layer variants are there for that edge to
 * resolve against: a painted layer fills the rule's box instead of tinting the
 * line.
 */
export function Separator(props: SeparatorProps) {
  const [variantProps, rest] = splitProps(props, separator);
  return (
    <ak.Role.hr role="separator" {...separator.jsx(variantProps)} {...rest} />
  );
}
