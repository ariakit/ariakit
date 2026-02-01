import { cv } from "clava";
import { bevel } from "./bevel.ts";
import { command } from "./command.ts";
import {
  control,
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "./control.ts";
import {
  glider,
  gliderAnchor,
  gliderGroup,
  gliderSeparator,
} from "./glider.ts";

export const button = cv({
  extend: [control, command, bevel, gliderAnchor],
  class: [
    "font-[calc(500+50*var(--contrast))]",
    "ak-outline-primary transition-[color]",
    "ui-hover:ak-layer-hover ui-hover:[anchor-name:--button-hover]",
    "outline-offset-1 ui-focus-visible:outline-2",
  ],
  variants: {
    $kind: {
      flat: "",
    },
  },
  defaultVariants: {
    $kind: "flat",
    $gapY: "none",
    $button: true,
  },
});

export const buttonGlider = cv({
  extend: [glider],
});

export const buttonGroup = cv({
  extend: [gliderGroup],
});

export const buttonSeparator = cv({
  extend: [gliderSeparator],
});

export const buttonSlot = controlSlot;

export const buttonContent = controlContent;

export const buttonDescription = cv({
  extend: [controlDescription],
  defaultVariants: {
    $truncate: true,
  },
});

export const buttonLabel = cv({
  extend: [controlLabel],
  defaultVariants: {
    $truncate: true,
  },
});
