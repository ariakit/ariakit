import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { textFrame } from "../styles/text-frame.ts";

export interface TextFrameProps
  extends ak.RoleProps<"div">, VariantProps<typeof textFrame> {}

/**
 * Renders a frame for text with side padding that aligns it with control labels
 * that use the same padding.
 * @example
 * <TextFrame $p={2} $border $rounded="md">
 *   Project details
 * </TextFrame>
 */
export function TextFrame(props: TextFrameProps) {
  const [variantProps, rest] = splitProps(props, textFrame);
  return <ak.Role.div {...textFrame.jsx(variantProps)} {...rest} />;
}
