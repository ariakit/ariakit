import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { prose } from "../styles/prose.ts";

export interface ProseProps
  extends ak.RoleProps<"div">, VariantProps<typeof prose> {}

/**
 * Renders a long-form content container that spaces its children on a shared
 * vertical rhythm and styles the plain markup that has no component of its
 * own (paragraphs and strong emphasis).
 */
export function Prose(props: ProseProps) {
  const [variantProps, rest] = splitProps(props, prose);
  return <ak.Role.div {...prose.jsx(variantProps)} {...rest} />;
}
