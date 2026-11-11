import { cv } from "clava";

/**
 * A check mark drawn on the `::after` pseudo-element of its host. The mark
 * takes the host's text color. Set `--check-mark-box` to the length that the
 * mark size is relative to. It defaults to the content box of the host.
 *
 * The host owns the checked state, because it can come from a prop or from CSS.
 * A hidden mark is clipped from the end, and a shown mark clears the clip with
 * `clip-path: inset(0)`, so a left-to-right wipe follows the check's two
 * 45-degree strokes as if they were being written.
 */
export const checkMark = cv({
  class: [
    "[--check-mark-size:calc(var(--check-mark-box,100%)*var(--check-mark-scale))]",
  ],
  variants: {
    /**
     * The mark drawn in the host. `check` draws a check mark.
     * @default "check"
     */
    $mark: {
      check: [
        "after:bg-current after:forced-color-adjust-none",
        "after:size-(--check-mark-size) after:mask-(--choice-mark-check)",
        "after:mask-contain after:mask-center after:mask-no-repeat",
      ],
    },
    /**
     * Makes the check smaller in a round box. The tip of a check points at a
     * corner, which a round box cuts off. A smaller check keeps about the room
     * that a square box gives its sides.
     * @default false
     */
    $roundBox: {
      true: "[--check-mark-scale:0.6]",
      false: "[--check-mark-scale:0.7]",
    },
  },
  defaultVariants: {
    $mark: "check",
    $roundBox: false,
  },
});
