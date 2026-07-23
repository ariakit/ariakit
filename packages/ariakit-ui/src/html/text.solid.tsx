import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { text } from "../styles/text.ts";

export interface TextProps
  extends ComponentProps<"span">, VariantProps<typeof text> {}

/**
 * A span that serves as a text-color target for the text system. Text
 * variants set on a `$layer` element affect descendant text/SVG targets like
 * this one rather than the layer's direct text.
 */
export function Text(props: TextProps) {
  const [variantProps, rest] = splitProps(props, text.html.propKeys);
  return <span {...text.html(variantProps)} {...rest} />;
}
