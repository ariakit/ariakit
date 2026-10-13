import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { code } from "../styles/code.ts";

export interface CodeProps
  extends ak.RoleProps<"code">, VariantProps<typeof code> {}

/**
 * Renders inline code with monospace text and compact spacing.
 * @example
 * <p>Run <Code>pnpm install</Code> to install dependencies.</p>
 */
export function Code(props: CodeProps) {
  const [variantProps, rest] = splitProps(props, code);
  return <ak.Role.code {...code.jsx(variantProps)} {...rest} />;
}
