import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { aurora } from "../styles/aurora.ts";

export interface AuroraProps
  extends ComponentProps<"div">, VariantProps<typeof aurora> {}

/**
 * Renders an animated gradient ring that follows the frame edge, colored via
 * `$aurora` and optionally `$auroraTo`. It owns the element's `::after`, and
 * nothing renders without `$aurora`.
 */
export function Aurora(props: AuroraProps) {
  const [variantProps, rest] = splitProps(props, aurora);
  return <div {...aurora.jsx(variantProps)} {...rest} />;
}
