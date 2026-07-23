import { cv } from "clava";
import { button } from "./button.ts";
import { controlLabel } from "./control.ts";
import { option } from "./option.ts";
import { popover } from "./popover.ts";

export const select = cv({
  extend: [button],
});

export const selectArrow = cv({
  // self-center keeps the arrow on the text's vertical center: the button
  // control doesn't set items-center, so the span would stretch and the
  // blockified svg would sit at its top.
  class: "ms-auto flex-none self-center [&>svg]:block [&>svg]:size-4",
});

// The custom icon needs the same self-center compensation as the arrow.
export const selectIcon = cv({
  class: "flex-none self-center [&>svg]:block [&>svg]:size-4",
});

// The label cv opts the display value into the button's $text* variants,
// which only reach .text and svg descendants.
export const selectValueLabel = cv({
  extend: [controlLabel],
  class: "flex-1 text-start",
});

export const selectPopover = cv({
  extend: [popover],
  class: [
    "outline-none",
    // Anchor-position fallbacks for the native [popover] path; Ariakit
    // positions with inline styles that win over these.
    "top-[calc(anchor(bottom)+--spacing(1))]",
    "[inset-inline-start:calc(anchor(start)---spacing(1))]",
    "[position-try-fallbacks:flip-block,flip-inline]",
  ],
  defaultVariants: {
    // Legacy ak-frame-container/container on the canvas layer: a compact
    // list container rather than the dialog-scale popover surface.
    $rounded: "xl",
    $p: 1,
    $layer: "canvas",
  },
});

export const selectItem = cv({
  extend: [option],
  class: "group/select-item items-center",
  defaultVariants: {
    // The legacy item row uses a fixed small gap between the check and the
    // label; sm resolves to the frame padding, matching legacy gap-2.
    $gap: "sm",
  },
});

export const selectItemCheck = cv({
  class: [
    "invisible flex-none size-4 [&>svg]:size-4",
    "group-ui-selected/select-item:visible",
  ],
});
