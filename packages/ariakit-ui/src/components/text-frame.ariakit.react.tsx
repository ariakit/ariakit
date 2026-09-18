import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { textFrame } from "../styles/text-frame.ts";

export interface TextFrameProps
  extends ak.RoleProps<"div">, VariantProps<typeof textFrame> {}

/**
 * Renders a frame for a line of text. It takes every `Frame` prop and adds
 * optical side padding, so its text starts where the label of a control with
 * the same padding starts. Despite the name, it has nothing to do with the
 * `Text` component, which colors text.
 */
export function TextFrame(props: TextFrameProps) {
  const [variantProps, rest] = splitProps(props, textFrame);
  return <ak.Role.div {...textFrame.jsx(variantProps)} {...rest} />;
}
