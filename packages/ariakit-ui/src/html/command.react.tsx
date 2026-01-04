import type { ComponentProps } from "react";
import { command } from "../styles/command.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface CommandProps
  extends VariantProps<typeof command>,
    ComponentProps<"button"> {}

export function Command(props: CommandProps) {
  const [variantProps, rest] = command.splitProps(props);
  return <button {...rest} className={command(variantProps)} />;
}
