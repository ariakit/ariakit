import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { kbd } from "../styles/kbd.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface KbdProps
  extends VariantProps<typeof kbd>,
    ComponentProps<"kbd"> {}

export function Kbd(props: KbdProps) {
  const [variantProps, rest] = splitProps(props, kbd.variantProps);
  return <kbd {...rest} class={kbd(variantProps)} />;
}
