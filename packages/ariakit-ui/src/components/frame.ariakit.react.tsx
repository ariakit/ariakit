import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { frame } from "../styles/frame.ts";

export interface FrameProps
  extends ak.RoleProps<"div">, VariantProps<typeof frame> {}

/**
 * Renders a generic framed div surface exposing the frame system: radius,
 * padding, borders, and concentric radius nesting with parent frames.
 */
export function Frame(props: FrameProps) {
  const [variantProps, rest] = splitProps(props, frame);
  return <ak.Role.div {...frame.jsx(variantProps)} {...rest} />;
}
