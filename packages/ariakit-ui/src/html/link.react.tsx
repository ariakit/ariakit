import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { link } from "../styles/link.ts";

export interface LinkProps
  extends ComponentProps<"a">, VariantProps<typeof link> {}

export function Link(props: LinkProps) {
  const [variantProps, rest] = splitProps(props, link);
  return <a {...link.jsx(variantProps)} {...rest} />;
}
