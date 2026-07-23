import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { aurora } from "../styles/aurora.ts";

export interface AuroraProps
  extends ak.RoleProps<"div">, VariantProps<typeof aurora> {}

/**
 * Renders an animated gradient ring that follows the frame edge, colored via
 * `$aurora` and optionally `$auroraTo`. It owns the element's `::after`, and
 * nothing renders without `$aurora`.
 */
export function Aurora(props: AuroraProps) {
  const [variantProps, rest] = splitProps(props, aurora);
  return <ak.Role.div {...aurora.jsx(variantProps)} {...rest} />;
}
