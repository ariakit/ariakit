import { cv } from "clava";
import { button, buttonSlot } from "./button.ts";
import { control, controlLabel } from "./control.ts";
import { frame, frameBase } from "./frame.ts";
import { input } from "./input.ts";
import {
  option,
  optionContent,
  optionDescription,
  optionLabel,
  optionSlot,
} from "./option.ts";
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

export const comboboxItemContent = optionContent;
export const comboboxItemDescription = optionDescription;
export const comboboxItemLabel = optionLabel;
export const comboboxItemSlot = optionSlot;

export const comboboxSelect = cv({
  extend: [button],
});

// A slot, so the chevron takes the size and the row alignment every other
// control icon gets. It ends the row even when nothing before it grows.
export const comboboxSelectArrow = cv({
  extend: [buttonSlot],
  class: "ms-auto",
});

export const comboboxSelectIcon = buttonSlot;

// The display value takes the label cv so the button's $text* variants reach
// it: they only match .text and svg descendants. It fills the row and reads
// from the start, where the button would center it.
export const comboboxSelectValueLabel = cv({
  extend: [controlLabel],
  class: "flex-1 text-start",
});

export const comboboxSelectPopover = cv({
  extend: [popover],
  class: [
    // Focus lands here for a tick before Ariakit hands it back to the button,
    // so the browser's ring stays off. The active item carries the highlight.
    "outline-none",
    // Anchor positioning for a native [popover] opened by its invoker.
    // Ariakit positions through the style attribute, which wins over these.
    "top-[calc(anchor(bottom)+--spacing(1))]",
    "inset-s-[calc(anchor(start)---spacing(1))]",
    "[position-try-fallbacks:flip-block,flip-inline]",
  ],
  defaultVariants: {
    // A compact list on the canvas layer, rather than the dialog-scale popover
    // surface.
    $rounded: "xl",
    $p: 1,
    $layer: "canvas",
  },
});

export const comboboxSelectItem = cv({
  extend: [option],
  class: "group/select-item",
  defaultVariants: {
    // The check sits closer to its label than a button's slot does.
    $gap: "sm",
  },
});

// The check keeps its space while unselected, so the labels line up.
export const comboboxSelectItemCheck = cv({
  extend: [buttonSlot],
  class: "invisible group-ui-selected/select-item:visible",
});
