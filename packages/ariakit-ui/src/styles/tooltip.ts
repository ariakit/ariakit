import { cv } from "clava";
import { popover } from "./popover.ts";

/** A compact popover with wider side padding and wrapping text. */
export const tooltip = cv({
  extend: [popover],
  class: [
    "text-sm",
    // Scale side padding with frame padding. The var() utility sorts before
    // caller px-* steps.
    "[--tooltip-px:calc(var(--ak-frame-padding)*2)] px-(--tooltip-px)",
    // Allow caller max-w-* utilities to override the wrapping limit.
    "[--tooltip-max-width:--spacing(80)] max-w-(--tooltip-max-width)",
  ],
  defaultVariants: {
    $shadow: "md",
    $rounded: "lg",
    $p: 1,
  },
});
