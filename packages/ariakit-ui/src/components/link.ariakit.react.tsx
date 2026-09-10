import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { link } from "../styles/link.ts";

export interface LinkProps
  extends ak.RoleProps<"a">, VariantProps<typeof link> {}

/**
 * Renders an inline text link as an anchor element. Use the `render` prop to
 * swap in a framework router link.
 */
export function Link(props: LinkProps) {
  const [variantProps, rest] = splitProps(props, link);
  return <ak.Role.a {...link.jsx(variantProps)} {...rest} />;
}
