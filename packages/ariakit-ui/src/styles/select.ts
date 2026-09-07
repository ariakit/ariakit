import { cv } from "clava";
import { button, buttonSlot } from "./button.ts";
import { controlLabel } from "./control.ts";
import { option } from "./option.ts";
import { popover } from "./popover.ts";

export const select = cv({
  extend: [button],
});

// A slot, so the chevron takes the size and the row alignment every other
// control icon gets. It ends the row even when nothing before it grows.
export const selectArrow = cv({
  extend: [buttonSlot],
  class: "ms-auto",
});

export const selectIcon = buttonSlot;

// The display value takes the label cv so the button's $text* variants reach
// it: they only match .text and svg descendants. It fills the row and reads
// from the start, where the button would center it.
export const selectValueLabel = cv({
  extend: [controlLabel],
  class: "flex-1 text-start",
});

export const selectPopover = cv({
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

export const selectItem = cv({
  extend: [option],
  class: "group/select-item",
  defaultVariants: {
    // The check sits closer to its label than a button's slot does.
    $gap: "sm",
  },
});

// The check keeps its space while unselected, so the labels line up.
export const selectItemCheck = cv({
  extend: [buttonSlot],
  class: "invisible group-ui-selected/select-item:visible",
});
