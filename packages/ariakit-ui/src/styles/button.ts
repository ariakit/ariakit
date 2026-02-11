import { cv } from "clava";
import { active } from "./active.ts";
import { bevel } from "./bevel.ts";
import {
  control,
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "./control.ts";
import { focus } from "./focus.ts";
import {
  glider,
  gliderAnchor,
  gliderGroup,
  gliderSeparator,
} from "./glider.ts";
import { hover } from "./hover.ts";

export const button = cv({
  extend: [control, bevel, gliderAnchor, hover, focus, active],
  class: [
    "transition-[color] not-[a]:cursor-default not-[button]:select-none",
    // Only apply cursor-pointer to submit buttons that are not disabled
    "[&:where([type='submit'],form_button:only-of-type,a_&)]:not-ui-disabled:cursor-pointer",
    // Adjust the font weight based on the global contrast setting.
    "font-[calc(500+50*var(--contrast))]",
  ],
  variants: {
    $kind: {
      flat: "",
    },
  },
  defaultVariants: {
    $kind: "flat",
    $gapY: "none",
    $hover: true,
    $focus: true,
    $active: true,
    $bevelButton: true,
  },
});

export const buttonLabel = cv({
  extend: [controlLabel],
  defaultVariants: {
    $truncate: true,
  },
});

export const buttonDescription = cv({
  extend: [controlDescription],
  defaultVariants: {
    $truncate: true,
  },
});

export const buttonGlider = glider;

export const buttonGroup = gliderGroup;

export const buttonSeparator = gliderSeparator;

export const buttonSlot = controlSlot;

export const buttonContent = controlContent;
