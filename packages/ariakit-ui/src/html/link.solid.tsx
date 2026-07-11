import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { link } from "../styles/link.ts";

export interface LinkProps
  extends ComponentProps<"a">, VariantProps<typeof link> {}

export function Link(props: LinkProps) {
  const [variantProps, rest] = splitProps(props, link.html.propKeys);
  return <a {...link.html(variantProps)} {...rest} />;
}
