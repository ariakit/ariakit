import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { code } from "../styles/code.ts";

export interface CodeProps
  extends ak.RoleProps<"code">, VariantProps<typeof code> {}

/**
 * Renders an inline code chip. Code blocks are a different component, so this
 * one is always the inline form.
 */
export function Code(props: CodeProps) {
  const [variantProps, rest] = splitProps(props, code);
  return <ak.Role.code {...code.jsx(variantProps)} {...rest} />;
}
