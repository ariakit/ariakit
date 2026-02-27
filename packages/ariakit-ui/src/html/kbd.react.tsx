import type { VariantProps } from "clava";
import { splitProps } from "clava";
import type { ComponentProps } from "react";
import { kbd } from "../styles/kbd.ts";

export interface KbdProps
  extends ComponentProps<"kbd">,
    VariantProps<typeof kbd> {}

export function Kbd(props: KbdProps) {
  const [variantProps, rest] = splitProps(props, kbd);
  return <kbd {...kbd(variantProps)} {...rest} />;
}
