import { cv } from "clava";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";

export const option = cv({
  extend: [button],
  // Options are text rows, not buttons: content aligns to the start instead of
  // the control's centered default.
  class: "justify-start",
  defaultVariants: {
    $rounded: "lg",
    // A row lies flush on the list surface behind it. Hover and focus are the
    // only things that lift it off.
    $lightnessOffset: false,
    $focusHighlight: true,
  },
});

export const optionContent = buttonContent;
export const optionDescription = buttonDescription;
export const optionLabel = buttonLabel;
export const optionSlot = buttonSlot;
