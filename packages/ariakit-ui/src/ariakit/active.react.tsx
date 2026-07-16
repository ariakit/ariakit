import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { active } from "../styles/active.ts";

export interface ActiveProps
  extends ak.RoleProps<"div">, VariantProps<typeof active> {}

/**
 * Renders a div exposing the press-scale variants ($active, $activeDepth,
 * $activeDepthX, and $activeDepthY). The scale is gated on the active
 * (pressed) state, and no styles apply unless $active is set.
 */
export function Active(props: ActiveProps) {
  const [variantProps, rest] = splitProps(props, active);
  return <ak.Role.div {...active.jsx(variantProps)} {...rest} />;
}
