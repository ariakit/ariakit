import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { focus } from "../styles/focus.ts";

export interface FocusProps
  extends ak.RoleProps<"div">, VariantProps<typeof focus> {}

/**
 * Renders a div exposing the keyboard focus-ring variants ($focus,
 * $focusColor, and $focusOffset). The ring only shows when the element itself
 * is focusable, so compose it onto an interactive element with the render
 * prop.
 */
export function Focus(props: FocusProps) {
  const [variantProps, rest] = splitProps(props, focus);
  return <ak.Role.div {...focus.jsx(variantProps)} {...rest} />;
}
