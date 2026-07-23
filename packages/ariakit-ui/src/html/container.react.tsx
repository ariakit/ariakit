import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { container } from "../styles/container.ts";

export interface ContainerProps
  extends ComponentProps<"div">, VariantProps<typeof container> {}

export function Container(props: ContainerProps) {
  const [variantProps, rest] = splitProps(props, container);
  return <div {...container.jsx(variantProps)} {...rest} />;
}
