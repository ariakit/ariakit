import { cv } from "clava";
import { controlSlot } from "./control.ts";
import { popover } from "./popover.ts";

/**
 * A compact popover with wider side padding and wrapping text. It inverts the
 * page colors without an edge by default. A layer color such as `brand` keeps
 * its hue and the popover edge.
 */
export const tooltip = cv({
  extend: [popover],
  class: [
    "text-sm",
    // Scale side padding with frame padding. The var() utility sorts before
    // caller px-* steps.
    "[--tooltip-px:calc(var(--ak-frame-padding)*2)] px-(--tooltip-px)",
    // Allow caller max-w-* utilities to override the wrapping limit.
    "[--tooltip-max-width:--spacing(80)] max-w-(--tooltip-max-width)",
    // A tooltip that the next tooltip replaces at once hides without its exit
    // transition, so their contents don't overlap. Only transition: none stops
    // an exit transition that already runs. The next tooltip keeps its enter
    // transition.
    "data-instant:ui-closed:transition-none",
  ],
  defaultVariants: {
    $shadow: "md",
    $rounded: "lg",
    $p: 1,
    $invert(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A color tooltip keeps its hue. Inverting would turn it into a pale
      // tint.
      if (variants.$layer === "canvas") return true;
      if (variants.$layer === true) return true;
      return variants.$layer === "transparent";
    },
    $border(defaultValue, variants) {
      if (!variants.$invert) return defaultValue;
      // Keep a border width that an extending style recipe sets.
      if (defaultValue !== true) return defaultValue;
      // An inverted surface already stands out from the page.
      return false;
    },
  },
  refine({ variants, addClass }) {
    // Forced colors paint the surface in the page color, so a tooltip without
    // an edge needs a system border there.
    if (variants.$border !== false) return;
    addClass("forced-colors:ak-frame-border");
  },
});

/**
 * A keyboard shortcut after the tooltip text, like the shortcut slot of a
 * control: muted keys in the UI font, in left-to-right order in any text
 * direction. A fill or a border draws a box around the keys.
 */
export const tooltipShortcut = cv({
  extend: [controlSlot],
  class: [
    // Stay on the text line. inline-flex sorts after the slot's flex.
    "inline-flex",
    // Separate the keys from the text before them, also without a space.
    "ms-1",
  ],
  defaultVariants: {
    $kind: "shortcut",
  },
});

/** The positioned wrapper of a tooltip popup that several anchors share. */
export const tooltipGroupWrapper = cv({
  variants: {
    /**
     * Slides the popup when it moves to another anchor. Ariakit adds
     * `data-enter` after the popup is in place at its first anchor, so the
     * slide waits for it, and the popup does not travel when it opens. The
     * popup needs its own enter animation for that order, which the tooltip
     * style recipe has. Reduced motion turns the slide off. In a scroll
     * container, an open popup trails its anchor while the container scrolls;
     * use `false` there.
     */
    $slide: {
      // The motion-safe: condition is needed because the :has() selector
      // outranks a motion-reduce: override.
      true: [
        "motion-safe:[&:has(>[data-enter])]:transition-transform",
        "motion-safe:[&:has(>[data-enter])]:duration-150",
        "motion-safe:[&:has(>[data-enter])]:ease-out",
      ],
      false: "",
    },
  },
  defaultVariants: {
    $slide: true,
  },
});
