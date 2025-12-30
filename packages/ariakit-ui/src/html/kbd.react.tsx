import type { ComponentProps } from "react";
import { kbd } from "../styles/kbd.ts";

export interface KbdProps extends ComponentProps<"kbd"> {}

export function Kbd(props: KbdProps) {
  return <kbd {...props} className={kbd(props)} />;
}
