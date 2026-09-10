import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { kbd } from "../styles/kbd.ts";

export interface KbdProps
  extends ak.RoleProps<"kbd">, VariantProps<typeof kbd> {}

export function Kbd(props: KbdProps) {
  const [variantProps, rest] = splitProps(props, kbd);
  return <ak.Role.kbd {...kbd.jsx(variantProps)} {...rest} />;
}
