import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { aurora } from "../styles/aurora.ts";

export interface AuroraProps
  extends ComponentProps<"div">, VariantProps<typeof aurora> {}

/**
 * Renders an animated gradient ring that follows the frame edge, colored via
 * `$aurora` and optionally `$auroraTo`. It owns the element's `::after`, and
 * nothing renders without `$aurora`.
 */
export function Aurora(props: AuroraProps) {
  const [variantProps, rest] = splitProps(props, aurora.html.propKeys);
  return <div {...aurora.html(variantProps)} {...rest} />;
}
