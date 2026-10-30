import { cv } from "clava";
import { popover } from "./popover.ts";
import { slotFrame, slotFrameSlot } from "./slot-frame.ts";

/**
 * A compact popover with the optical side padding of a text frame and wrapping
 * text. It inverts the page colors without an edge by default. A layer color
 * such as `brand` keeps its hue and the popover edge. Put icons, badges, and
 * keyboard keys in `TooltipSlot` parts.
 */
export const tooltip = cv({
  // The slot frame lays out text and `TooltipSlot` parts in a row, with the
  // optical side padding and gaps of a control.
  extend: [popover, slotFrame],
  class: [
    // Without slots, text flows as a paragraph, so inline elements such as
    // <strong> stay on its lines. A flex row would make each text run and
    // element a separate column. A caller display class needs ! to replace it.
    "[&:not(:has(>.slot-frame-slot))]:block",
    // Allow caller max-w-* utilities to override the wrapping limit.
    "[--tooltip-max-width:--spacing(80)] max-w-(--tooltip-max-width)",
    // A tooltip that the next tooltip replaces at once hides without its exit
    // transition, so their contents don't overlap. Only transition: none stops
    // an exit transition that already runs. The next tooltip keeps its enter
    // transition.
    "data-instant:ui-closed:transition-none",
  ],
  defaultVariants: {
    $size: "sm",
    // Tooltip text is usually bare, so a line-tall slot can't push it away by
    // the glyph side bearing, as it does a control label. A full side-padding
    // gap keeps the slot as far from the text as from the side.
    $gap: "lg",
    $shadow: "md",
    $rounded: "lg",
    // One spacing step is 3.5px at the default text size. Chrome paints the
    // half pixel on one side, so a line-tall slot would sit 1px closer to the
    // bottom than the top. Round it to a whole pixel.
    // https://github.com/ariakit/ariakit/issues/8179
    $p: "round(var(--spacing), 1px)",
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
 * An icon, badge, keyboard key, or short text beside the tooltip text, aligned
 * like a slot of a control.
 */
export const tooltipSlot = slotFrameSlot;

/**
 * The positioned wrapper of a tooltip popup, through the `wrapperProps` of
 * `TooltipPopover`. Use it for a popup that several anchors share.
 */
export const tooltipWrapper = cv({
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
