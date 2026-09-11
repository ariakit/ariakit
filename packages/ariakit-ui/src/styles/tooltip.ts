import { cv } from "clava";
import { popover } from "./popover.ts";

export const tooltip = cv({
  extend: [popover],
  class: [
    "text-sm",
    // The sides take twice the frame padding, so $p scales both axes. The
    // var() form sorts before a px-* step, so a caller's step still wins.
    "[--tooltip-px:calc(var(--ak-frame-padding)*2)] px-(--tooltip-px)",
    // A long label wraps instead of running across the viewport. A channel
    // like the dialog width, so a caller's max-w-* sorts after it and wins.
    "[--tooltip-max-width:--spacing(80)] max-w-(--tooltip-max-width)",
  ],
  defaultVariants: {
    $shadow: "md",
    $rounded: "lg",
    $p: 1,
  },
});
