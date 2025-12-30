import type { ComponentProps } from "solid-js";
import { kbd } from "../styles/kbd.ts";

export interface KbdProps extends ComponentProps<"kbd"> {}

export function Kbd(props: KbdProps) {
  return <kbd {...props} class={kbd(props)} />;
}
