import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { hover } from "../styles/hover.ts";

export interface HoverProps
  extends ComponentProps<"div">, VariantProps<typeof hover> {}

/**
 * Renders a div that adjusts its layer lightness and chroma on hover. The
 * element must also be a layer (`ak-layer`) for the variants to paint
 * anything.
 */
export function Hover(props: HoverProps) {
  const [variantProps, rest] = splitProps(props, hover);
  return <div {...hover.jsx(variantProps)} {...rest} />;
}
