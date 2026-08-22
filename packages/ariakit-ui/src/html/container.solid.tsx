import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { container } from "../styles/container.ts";

export interface ContainerProps
  extends ComponentProps<"div">, VariantProps<typeof container> {}

export function Container(props: ContainerProps) {
  const [variantProps, rest] = splitProps(props, container.html.propKeys);
  return <div {...container.html(variantProps)} {...rest} />;
}
