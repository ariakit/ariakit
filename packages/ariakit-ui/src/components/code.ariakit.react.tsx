import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { FC } from "react";
import { code } from "../styles/code.ts";

// Role has no code shorthand, so the element comes from the render prop and
// this alias retypes the props for the code element (the runtime component is
// element-agnostic).
const RoleCode = ak.Role as FC<ak.RoleProps<"code">>;

export interface CodeProps
  extends ak.RoleProps<"code">, VariantProps<typeof code> {}

/**
 * Renders an inline code chip. Code blocks are a different component, so this
 * one is always the inline form.
 */
export function Code(props: CodeProps) {
  const [variantProps, rest] = splitProps(props, code);
  // A user-provided render in rest still wins over the code element.
  return <RoleCode render={<code />} {...code.jsx(variantProps)} {...rest} />;
}
