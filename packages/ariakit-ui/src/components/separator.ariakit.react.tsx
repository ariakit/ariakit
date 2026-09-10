import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { separator } from "../styles/separator.ts";

export interface SeparatorProps
  extends ak.RoleProps<"hr">, VariantProps<typeof separator> {}

/**
 * Renders a rule between sections.
 */
export function Separator(props: SeparatorProps) {
  const [variantProps, rest] = splitProps(props, separator);
  return (
    <ak.Role.hr role="separator" {...separator.jsx(variantProps)} {...rest} />
  );
}
