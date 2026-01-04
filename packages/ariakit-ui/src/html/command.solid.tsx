import type { ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import { command } from "../styles/command.ts";
import type { VariantProps } from "../utils/cv.ts";

export interface CommandProps
  extends VariantProps<typeof command>,
    ComponentProps<"button"> {}

export function Command(props: CommandProps) {
  const [variantProps, rest] = splitProps(props, command.variantProps);
  return <button {...rest} class={command(variantProps)} />;
}
