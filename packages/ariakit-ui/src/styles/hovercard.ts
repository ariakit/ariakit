import { cv } from "clava";
import { button } from "./button.ts";
import {
  popover,
  popoverDescription,
  popoverDismiss,
  popoverHeading,
} from "./popover.ts";

/**
 * A popover that shows while the pointer rests on its anchor, such as a preview
 * of a link or a profile card. Several anchors can share one hovercard, which
 * moves to the anchor that the pointer rests on; set `$slide` to make it slide
 * there.
 */
export const hovercard = cv({
  extend: [popover],
});

/** A prominent heading for a hovercard. */
export const hovercardHeading = popoverHeading;

/** Muted description text for a hovercard. */
export const hovercardDescription = popoverDescription;

/** A button that closes a hovercard. */
export const hovercardDismiss = popoverDismiss;

/**
 * A small round button after the anchor, which opens the hovercard from the
 * keyboard. Ariakit hides it visually until the anchor takes keyboard focus.
 */
export const hovercardDisclosure = cv({
  extend: [button],
  class: ["size-6 shrink-0 items-center justify-center", "[&>svg]:size-3"],
  defaultVariants: {
    $rounded: "full",
    $p: "none",
  },
});
