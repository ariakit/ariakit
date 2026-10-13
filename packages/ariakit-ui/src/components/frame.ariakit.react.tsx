import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { frame } from "../styles/frame.ts";

export interface FrameProps
  extends ak.RoleProps<"div">, VariantProps<typeof frame> {}

/**
 * Renders a frame with padding, borders, and corners that follow parent frames.
 * Use `$layer` to add a background surface.
 * @example
 * <Frame $p={3} $rounded="lg" $border>
 *   <p>Project details</p>
 * </Frame>
 */
export function Frame(props: FrameProps) {
  const [variantProps, rest] = splitProps(props, frame);
  return <ak.Role.div {...frame.jsx(variantProps)} {...rest} />;
}
