import type { ComponentProps } from "solid-js";
import { mergeProps, splitProps } from "solid-js";
import { kbd } from "../styles/kbd.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface KbdProps
  extends ComponentProps<"kbd">,
    VariantProps<typeof kbd> {}

export function Kbd(props: KbdProps) {
  const [variantProps, rest] = splitProps(
    mergeProps(kbd.defaultVariants, props),
    kbd.variantProps,
  );
  return <kbd {...rest} class={kbd(variantProps)} />;
}
