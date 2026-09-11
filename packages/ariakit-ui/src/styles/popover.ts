import { cv } from "clava";
import { button } from "./button.ts";
import { frame, frameBase } from "./frame.ts";

export const popover = cv({
  extend: [frame],
  class: [
    "z-10",
    // ui-open and ui-closed read the native open state and Ariakit's
    // data-open alike, so one list serves every kind of popover. Static
    // markup adds data-open to render open.
    // A utility, not an arbitrary property, so a caller's transition-none
    // can switch the motion off. Its default duration never shows: each of
    // the two states sets its own.
    "transition-[overlay,display,scale,opacity] transition-discrete",
    // The leave keeps the browser's curve, which the utility above would
    // otherwise swap for Tailwind's default.
    "ease-[ease]",
    "ui-open:duration-(--duration-overshoot) ui-open:ease-overshoot",
    "ui-open:starting:scale-95 ui-open:starting:opacity-0",
    "ui-closed:duration-250 ui-closed:scale-95 ui-closed:opacity-0",
    // ui-backdrop reaches the native ::backdrop and the element Ariakit
    // renders before the dialog alike. Opacity only: the dialog's own display
    // and overlay transitions keep a native backdrop rendered through the
    // leave, and a display transition on the Ariakit element would keep it
    // over the page after Ariakit hides it.
    "ui-backdrop:transition-opacity ui-backdrop:duration-250 ui-backdrop:ease-[ease]",
    "ui-open:starting:ui-backdrop:opacity-0 ui-closed:ui-backdrop:opacity-0",
    // Reduced motion drops the scale and the fade, which carry nothing the
    // end state does not. It removes the transitioned properties rather than
    // zeroing the durations, because the open and closed durations above
    // outrank a plain duration, and because Ariakit then hides a closing
    // popover at once instead of waiting for a transition end.
    "motion-reduce:transition-none motion-reduce:ui-backdrop:transition-none",
    // Scale from the anchor side when Ariakit provides the
    // `transform-origin`; the invalid var() fallback leaves the default
    // center origin for native popovers.
    "origin-(--popover-transform-origin)",
  ],
  variants: {
    /**
     * Sets the popover shadow. A variant rather than a base class so extending
     * styles like the tooltip can lighten it — clava concatenates classes, and
     * a competing shadow class would lose to the base one by stylesheet order.
     */
    $shadow: {
      none: "",
      md: "shadow-md",
      xl: "shadow-xl",
    },
  },
  defaultVariants: {
    $shadow: "xl",
    $rounded: "2xl",
    $forceRounded: true,
    $p: 4,
    // Popovers always float above the content, so they lift unconditionally
    // instead of taking the adaptive offset.
    $lighten: true,
    // A lifted surface, so the adaptive edge resolves to a border over dark
    // content and a ring over light content.
    $border: true,
  },
});

export const popoverDisclosure = cv({
  extend: [button],
});

export const popoverDismiss = cv({
  extend: [button],
});

// A viewport into the popover surface rather than a surface of its own, so it
// takes the frame geometry without the layer and edge that come with it.
export const popoverScroll = cv({
  extend: [frameBase],
  class: "overflow-auto overscroll-contain",
  defaultVariants: {
    $cover: true,
  },
});

export const popoverHeading = cv({
  class: "text-lg font-medium",
});

export const popoverDescription = cv({
  class: "ak-ink-80",
});
