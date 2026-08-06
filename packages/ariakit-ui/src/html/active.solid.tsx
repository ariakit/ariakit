import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { active } from "../styles/active.ts";

export interface ActiveProps
  extends ComponentProps<"div">, VariantProps<typeof active> {}

/**
 * Renders a div exposing the press-scale variants ($active, $activeDepth,
 * $activeDepthX, and $activeDepthY). The scale is gated on the active
 * (pressed) state, and no styles apply unless $active is set.
 */
export function Active(props: ActiveProps) {
  const [variantProps, rest] = splitProps(props, active.html.propKeys);
  return <div {...active.html(variantProps)} {...rest} />;
}
