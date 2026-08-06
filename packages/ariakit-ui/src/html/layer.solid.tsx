import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { layer } from "../styles/layer.ts";

export interface LayerProps
  extends ComponentProps<"div">, VariantProps<typeof layer> {}

/**
 * Renders a div with a colored background surface at the root of the relative
 * color system. Nested layers shift automatically to stay distinguishable
 * from their parent.
 */
export function Layer(props: LayerProps) {
  const [variantProps, rest] = splitProps(props, layer.html.propKeys);
  return <div {...layer.html(variantProps)} {...rest} />;
}
