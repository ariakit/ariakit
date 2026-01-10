import type { VariantProps } from "clava";
import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { kbd } from "../styles/kbd.ts";

export interface KbdProps
  extends ComponentProps<"kbd">,
    VariantProps<typeof kbd> {}

export function Kbd(props: KbdProps) {
  const [variantProps, rest] = splitProps(props, kbd.html.propKeys);
  return <kbd {...kbd.html(variantProps)} {...rest} />;
}
