import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { frame } from "../styles/frame.ts";

export interface FrameProps
  extends ComponentProps<"div">, VariantProps<typeof frame> {}

/**
 * Renders a generic framed div surface exposing the frame system: radius,
 * padding, borders, and concentric radius nesting with parent frames.
 */
export function Frame(props: FrameProps) {
  const [variantProps, rest] = splitProps(props, frame.html.propKeys);
  return <div {...frame.html(variantProps)} {...rest} />;
}
