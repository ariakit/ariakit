import * as ak from "@ariakit/react";
import type { VariantProps } from "clava";
import { splitProps } from "clava";
import {
  slotFrame,
  slotFrameSlot,
  slotFrameText,
} from "../styles/slot-frame.ts";

export interface SlotFrameProps
  extends ak.RoleProps<"div">, VariantProps<typeof slotFrame> {}

/**
 * Renders a static row of slots and text, such as a logo or a title with an
 * icon. Its gaps and the margins of its slots follow its padding, so an icon
 * sits as far from the side as from the top, like the icon of a button with the
 * same padding.
 * @example
 * <SlotFrame $p={2} className="font-semibold">
 *   <SlotFrameSlot>
 *     <BookOpen />
 *   </SlotFrameSlot>
 *   <SlotFrameText>Field Notes</SlotFrameText>
 * </SlotFrame>
 */
export function SlotFrame(props: SlotFrameProps) {
  const [variantProps, rest] = splitProps(props, slotFrame);
  return <ak.Role.div {...slotFrame.jsx(variantProps)} {...rest} />;
}

export interface SlotFrameSlotProps
  extends ak.RoleProps<"span">, VariantProps<typeof slotFrameSlot> {}

/**
 * An icon or other content beside the text of a `SlotFrame`. Pass `aria-hidden`
 * when the slot is decorative.
 * @example
 * <SlotFrame $p={2}>
 *   <SlotFrameSlot aria-hidden>
 *     <Hexagon />
 *   </SlotFrameSlot>
 *   <SlotFrameText>Acme</SlotFrameText>
 * </SlotFrame>
 */
export function SlotFrameSlot(props: SlotFrameSlotProps) {
  const [variantProps, rest] = splitProps(props, slotFrameSlot);
  return <ak.Role.span {...slotFrameSlot.jsx(variantProps)} {...rest} />;
}

export interface SlotFrameTextProps
  extends ak.RoleProps<"span">, VariantProps<typeof slotFrameText> {}

/**
 * The text of a `SlotFrame`. Use `$truncate` to keep it on one line and `$grow`
 * to push the slots after it to the end of the row.
 * @example
 * <SlotFrame $p={2}>
 *   <SlotFrameText $truncate $grow>Field Notes</SlotFrameText>
 * </SlotFrame>
 */
export function SlotFrameText(props: SlotFrameTextProps) {
  const [variantProps, rest] = splitProps(props, slotFrameText);
  return <ak.Role.span {...slotFrameText.jsx(variantProps)} {...rest} />;
}
