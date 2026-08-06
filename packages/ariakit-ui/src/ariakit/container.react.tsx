import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { container } from "../styles/container.ts";

export interface ContainerProps
  extends ak.RoleProps<"div">, VariantProps<typeof container> {}

/**
 * Renders a horizontally centered div whose width is capped by `$size` with
 * a `$p` gutter. Both props inherit, so an ancestor can provide them to size
 * several nested containers at once.
 */
export function Container(props: ContainerProps) {
  const [variantProps, rest] = splitProps(props, container);
  return <ak.Role.div {...container.jsx(variantProps)} {...rest} />;
}
