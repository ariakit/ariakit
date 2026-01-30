import { cv } from "clava";
import {
  activeIndicator,
  activeIndicatorGroup,
  activeIndicatorItem,
} from "./active-indicator.ts";
import { bevel } from "./bevel.ts";
import { command } from "./command.ts";
import {
  control,
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "./control.ts";

export const button = cv({
  extend: [control, command, bevel, activeIndicatorItem],
  class: [
    "font-[calc(500+50*var(--contrast))]",
    "ak-outline-primary transition-[color]",
    "ui-hover:ak-layer-hover ui-hover:[anchor-name:--button-hover]",
    "outline-offset-[calc(1px-var(--inset-gap,0px))] ui-focus-visible:outline-2",
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

export const buttonActiveIndicator = cv({
  extend: [activeIndicator],
  defaultVariants: {
    $anchor: "--button-hover",
  },
});

export const buttonGroup = cv({
  extend: [activeIndicatorGroup],
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
