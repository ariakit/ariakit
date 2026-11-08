import { cv } from "clava";
import { button } from "./button.ts";
import { frame, frameBase } from "./frame.ts";
import { hasSelectedSurface } from "./selected.ts";

/**
 * A floating surface with open, close, and backdrop animations. Static markup
 * needs `data-open` to appear open.
 */
export const popover = cv({
  extend: [frame],
  class: [
    "z-10",
    // Use transition utilities so `transition-none` can disable motion. Open
    // and closed states supply their own durations.
    "transition-[overlay,display,scale,opacity] transition-discrete",
    // Keep the browser easing curve when closing.
    "ease-[ease]",
    "ui-open:duration-(--duration-overshoot) ui-open:ease-overshoot",
    "ui-open:starting:scale-95 ui-open:starting:opacity-0",
    "ui-closed:duration-250 ui-closed:scale-95 ui-closed:opacity-0",
    // Animate only backdrop opacity. A display transition would delay removal
    // of the Ariakit backdrop after it is hidden.
    "ui-backdrop:transition-opacity ui-backdrop:duration-250 ui-backdrop:ease-[ease]",
    "ui-open:starting:ui-backdrop:opacity-0 ui-closed:ui-backdrop:opacity-0",
    // Remove transition properties so state-specific durations cannot delay
    // hiding under reduced motion.
    "motion-reduce:transition-none motion-reduce:ui-backdrop:transition-none",
    // Use the Ariakit anchor origin when supplied; native popovers retain the
    // default center origin.
    "origin-(--popover-transform-origin)",
  ],
  variants: {
    /** Sets the surface shadow. Use `none` to omit it. */
    $shadow: {
      none: "",
      md: "shadow-md",
      xl: "shadow-xl",
    },
  },
  defaultVariants: {
    $layer: "canvas",
    $shadow: "xl",
    $rounded: "2xl",
    $forceRounded: true,
    $p: 4,
    $lighten: true,
    $border: true,
  },
});

/**
 * The element that Ariakit positions around a popup, through the `wrapperProps`
 * of the popup. The Ariakit UI popup style components apply it and take its
 * variants as props. With an Ariakit component, pass `popoverPositioner.jsx()`
 * to `wrapperProps`.
 */
export const popoverPositioner = cv({
  variants: {
    /**
     * Slides a popup that several anchors share when it moves to another
     * anchor. Ariakit adds `data-enter` to the popup after it is in place at
     * its first anchor, so the slide waits for it, and the popup does not
     * travel when it opens. The popup needs its own enter animation for that
     * order, which the `popover` style recipe has. Reduced motion turns the
     * slide off. In a scroll container, an open popup trails its anchor while
     * the container scrolls.
     */
    $slide: [
      // The :has() selector checks only the positioner, so browsers don't
      // check it on every element that they restyle. The motion-safe:
      // condition turns the slide off with reduced motion, because :has()
      // outranks a motion-reduce: class.
      "motion-safe:[&:has(>[data-enter])]:transition-transform",
      "motion-safe:[&:has(>[data-enter])]:duration-150",
      "motion-safe:[&:has(>[data-enter])]:ease-out",
    ],
  },
});

/**
 * A button that opens a popover. `$selectedOffset` and `$selectedPush` also
 * paint while the popover is open.
 */
export const popoverDisclosure = cv({
  extend: [button],
  refine({ variants, addClass }) {
    if (!hasSelectedSurface(variants)) return;
    // Only here, because ui-selected would also match open nav sections,
    // sidebar toggles, and comboboxes, which stay expanded while people work
    // elsewhere.
    addClass([
      "popover-disclosure-surface [--selected-push:initial]",
      "aria-expanded:ak-state-(--selected-offset,0)",
      "aria-expanded:ak-state-push-(--selected-push,0)",
      "aria-expanded:ui-hover:ak-state-(--selected-offset,0)",
      "aria-expanded:ui-hover:ak-state-push-(--selected-push,0)",
    ]);
  },
});

/** A button that closes a popover. */
export const popoverDismiss = cv({
  extend: [button],
});

/**
 * A scrollable viewport that uses the popover surface without painting its own.
 */
export const popoverScroll = cv({
  extend: [frameBase],
  class: "overflow-auto overscroll-contain",
  defaultVariants: {
    $cover: true,
  },
});

/** A prominent heading for a popover. */
export const popoverHeading = cv({
  class: "text-lg font-medium",
});

/** Muted description text for a popover. */
export const popoverDescription = cv({
  class: "ak-ink-80",
});
