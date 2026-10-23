import { cv } from "clava";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";

/** A selectable text row with rounded edges and focus highlighting. */
export const option = cv({
  extend: [button],
  class: "justify-start",
  defaultVariants: {
    $rounded: "lg",
    $p: 1.5,
    $lightnessOffset: false,
    $focusHighlight: true,
  },
});

/** Arranges an option's label and description. */
export const optionContent = buttonContent;

/** Secondary text for an option. */
export const optionDescription = buttonDescription;

/** Option label text with optional truncation. */
export const optionLabel = buttonLabel;

/** An option slot for an icon, avatar, badge, or shortcut. */
export const optionSlot = buttonSlot;
