import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { hover } from "../styles/hover.ts";

export interface HoverProps
  extends ak.RoleProps<"div">, VariantProps<typeof hover> {}

/**
 * Renders a div that adjusts its layer lightness and chroma on hover. The
 * element must also be a layer (`ak-layer`) for the variants to paint
 * anything.
 */
export function Hover(props: HoverProps) {
  const [variantProps, rest] = splitProps(props, hover);
  return <ak.Role.div {...hover.jsx(variantProps)} {...rest} />;
}
