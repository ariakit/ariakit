import { cv } from "clava";
import { button } from "./button.ts";
import { frame, frameBase } from "./frame.ts";

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

/** A button that opens a popover. */
export const popoverDisclosure = cv({
  extend: [button],
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
