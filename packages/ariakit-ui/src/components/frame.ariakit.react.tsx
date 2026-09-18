import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { frame } from "../styles/frame.ts";

export interface FrameProps
  extends ak.RoleProps<"div">, VariantProps<typeof frame> {}

/**
 * Renders a generic framed div exposing the frame system: radius, padding,
 * borders, and concentric radius nesting with parent frames. It paints no
 * surface of its own until a layer prop moves the color; pass `$layer` to make
 * it one.
 */
export function Frame(props: FrameProps) {
  const [variantProps, rest] = splitProps(props, frame);
  return <ak.Role.div {...frame.jsx(variantProps)} {...rest} />;
}
