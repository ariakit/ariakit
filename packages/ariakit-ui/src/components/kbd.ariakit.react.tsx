import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import { kbd } from "../styles/kbd.ts";

export interface KbdProps
  extends ak.RoleProps<"kbd">, VariantProps<typeof kbd> {}

/**
 * Renders a key or keyboard shortcut as plain muted text, a raised keycap, or a
 * flat chip. Put plain keys in a `text` slot of a control, and use a keycap in
 * prose.
 * @example
 * <p>Press <Kbd $kind="keycap">Esc</Kbd> to close the dialog.</p>
 * @example
 * <Button>
 *   <ButtonLabel>Save</ButtonLabel>
 *   <ButtonSlot $kind="text">
 *     <Kbd>⌘S</Kbd>
 *   </ButtonSlot>
 * </Button>
 */
export function Kbd(props: KbdProps) {
  const [variantProps, rest] = splitProps(props, kbd);
  return <ak.Role.kbd {...kbd.jsx(variantProps)} {...rest} />;
}
