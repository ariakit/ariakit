import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { prose } from "../styles/prose.ts";

export interface ProseProps
  extends ComponentProps<"div">, VariantProps<typeof prose> {}

export function Prose(props: ProseProps) {
  const [variantProps, rest] = splitProps(props, prose);
  return <div {...prose.jsx(variantProps)} {...rest} />;
}
