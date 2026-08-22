import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { focus } from "../styles/focus.ts";

export interface FocusProps
  extends ComponentProps<"div">, VariantProps<typeof focus> {}

/**
 * Renders a div exposing the keyboard focus-ring variants ($focus,
 * $focusColor, and $focusOffset). The ring only shows when the element itself
 * is focusable, so make it interactive (for example with tabIndex) or apply
 * the variants to an interactive element instead.
 */
export function Focus(props: FocusProps) {
  const [variantProps, rest] = splitProps(props, focus.html.propKeys);
  return <div {...focus.html(variantProps)} {...rest} />;
}
