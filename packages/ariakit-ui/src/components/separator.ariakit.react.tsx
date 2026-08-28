import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { FC } from "react";
import { separator } from "../styles/separator.ts";

// Role has no hr shorthand, so the element comes from the render prop and
// this alias retypes the props for the hr element (the runtime component is
// element-agnostic).
const RoleHr = ak.Role as FC<ak.RoleProps<"hr">>;

export interface SeparatorProps
  extends ak.RoleProps<"hr">, VariantProps<typeof separator> {}

/**
 * Renders a rule between sections.
 */
export function Separator(props: SeparatorProps) {
  const [variantProps, rest] = splitProps(props, separator);
  // A user-provided render in rest still wins over the hr element.
  return (
    <RoleHr
      render={<hr />}
      role="separator"
      {...separator.jsx(variantProps)}
      {...rest}
    />
  );
}
