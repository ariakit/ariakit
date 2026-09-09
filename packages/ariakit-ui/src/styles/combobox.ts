import { cv } from "clava";
import { control, controlLabel } from "./control.ts";
import { frame, frameBase } from "./frame.ts";
import { input } from "./input.ts";
import { option } from "./option.ts";
import { popover } from "./popover.ts";
import { text } from "./text.ts";

export const comboboxInput = input;

export const comboboxLabel = controlLabel;

export const comboboxPopover = cv({
  extend: [popover],
  class: [
    "outline-none overflow-auto overscroll-contain",
    "max-h-[min(var(--popover-available-height),20rem)]",
    "min-w-(--popover-anchor-width)",
  ],
  defaultVariants: {
    $rounded: "xl",
    $p: 1,
    $layer: "canvas",
  },
});

export const comboboxGroup = cv({
  extend: [frameBase],
  defaultVariants: {
    $cover: true,
  },
});

export const comboboxGroupLabel = cv({
  extend: [frame, text],
  class: "cursor-default text-sm font-medium ak-ink-50",
  defaultVariants: {
    $rounded: "xl",
    $p: 2,
    $layer: "transparent",
  },
});

export const comboboxItem = cv({
  extend: [option],
  class: "data-active-item:ak-state-6",
  defaultVariants: {
    $hoverOffset: false,
  },
});

export const comboboxEmpty = cv({
  extend: [control],
  class: "justify-start",
});
