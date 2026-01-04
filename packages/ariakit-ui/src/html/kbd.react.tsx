import type { ComponentProps } from "react";
import { kbd } from "../styles/kbd.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface KbdProps
  extends VariantProps<typeof kbd>,
    ComponentProps<"kbd"> {}

export function Kbd(props: KbdProps) {
  const [variantProps, rest] = kbd.splitProps(props);
  return <kbd {...rest} className={kbd(variantProps)} />;
}
