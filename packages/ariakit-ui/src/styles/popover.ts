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
    "ui-popover",
    // Animate only backdrop opacity. A display transition would delay removal
    // of the Ariakit backdrop after it is hidden.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "ui-backdrop:transition-opacity ui-backdrop:duration-250 ui-backdrop:ease-[ease]",
    "motion-reduce:ui-backdrop:transition-none",
    // Remove transition properties so state-specific durations cannot delay
    // hiding under reduced motion.
    // Stays a class to come after the classes of a caller, so that the reduced
    // motion rule still applies.
    "motion-reduce:transition-none",
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
     * anchor. Ariakit adds `data-enter` to the popup after its first paint,
     * which comes after the default positioning puts it at its first anchor, so
     * the slide waits for it, and the popup does not travel when it opens. A
     * custom `updatePosition` that places the popup after that paint makes it
     * travel from where the positioner starts. The popup needs its own enter
     * animation for that order, which the `popover` style recipe has. Reduced
     * motion turns the slide off. In a scroll container, an open popup trails
     * its anchor while the container scrolls.
     */
    $slide: "ui-popover-positioner--slide",
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
      "ui-popover-disclosure--surface [--selected-push:initial]",
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
  class: "ui-popover-scroll",
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
