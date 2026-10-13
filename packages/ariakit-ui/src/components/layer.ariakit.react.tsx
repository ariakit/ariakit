import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { layer } from "../styles/layer.ts";

export interface LayerProps
  extends ak.RoleProps<"div">, VariantProps<typeof layer> {}

/**
 * Renders a background surface in the relative color system. Use `$layer` to
 * set its color and `$lighten` or `$darken` to shift it.
 * @example
 * <Layer $layer="brand">
 *   <Text>Project details</Text>
 *   <Layer $layer $lighten>
 *     <Text>Updated today</Text>
 *   </Layer>
 * </Layer>
 */
export function Layer(props: LayerProps) {
  const [variantProps, rest] = splitProps(props, layer);
  return <ak.Role.div {...layer.jsx(variantProps)} {...rest} />;
}
