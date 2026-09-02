import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { FC } from "react";
import { kbd } from "../styles/kbd.ts";

// Role has no kbd shorthand, so the element comes from the render prop and
// this alias retypes the props for the kbd element (the runtime component is
// element-agnostic).
const RoleKbd = ak.Role as FC<ak.RoleProps<"kbd">>;

export interface KbdProps
  extends ak.RoleProps<"kbd">, VariantProps<typeof kbd> {}

export function Kbd(props: KbdProps) {
  const [variantProps, rest] = splitProps(props, kbd);
  // A user-provided render in rest still wins over the kbd element.
  return <RoleKbd render={<kbd />} {...kbd.jsx(variantProps)} {...rest} />;
}
