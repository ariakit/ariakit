import { cv } from "clava";
import { button } from "./button.ts";
import { frame, frameBase } from "./frame.ts";

export const popover = cv({
  extend: [frame],
  class: [
    "z-10",
    // An arbitrary property rather than the transition-* utility, which
    // also emits a default duration and easing. Every state below sets its
    // own, so those defaults would only be there to be overwritten.
    "[transition-property:overlay,display,scale,opacity] transition-discrete",
    // Scale from the anchor side when Ariakit provides the
    // `transform-origin`; the invalid var() fallback leaves the default
    // center origin for native popovers.
    "origin-(--popover-transform-origin)",
  ],
  variants: {
    /**
     * Sets the popover shadow. A variant rather than a base class so
     * extending styles like the tooltip can lighten it — clava concatenates
     * classes, and a competing shadow class would lose to the base one by
     * stylesheet order.
     */
    $shadow: {
      none: "",
      md: "shadow-md",
      xl: "shadow-xl",
    },
    /**
     * Selects how the open state is detected for the enter and leave
     * transitions. `auto` targets native `dialog` and `[popover]` elements
     * via the `open:` pseudo state, `data` targets Ariakit components via
     * the `data-open` attribute, and `none` renders a plain surface with
     * no transitions, for previews and thumbnails.
     */
    $state: {
      none: "",
      auto: [
        "[dialog,[popover]]:open:duration-(--duration-overshoot)",
        "[dialog,[popover]]:open:ease-overshoot",
        "[dialog,[popover]]:open:starting:scale-95",
        "[dialog,[popover]]:open:starting:opacity-0",
        // The backdrop is a native top-layer pseudo-element, so its rules
        // only exist on this channel. The discrete behavior and the
        // starting opacity are what make the fade its own
        // transition-property list declares actually run.
        "[dialog,[popover]]:backdrop:[transition-property:overlay,display,opacity]",
        "[dialog,[popover]]:backdrop:transition-discrete",
        "[dialog,[popover]]:open:backdrop:duration-250",
        "[dialog,[popover]]:open:backdrop:opacity-100",
        "[dialog,[popover]]:open:starting:backdrop:opacity-0",
        "[dialog,[popover]]:not-open:duration-250",
        "[dialog,[popover]]:not-open:scale-95",
        "[dialog,[popover]]:not-open:opacity-0",
        "[dialog,[popover]]:not-open:backdrop:duration-250",
        "[dialog,[popover]]:not-open:backdrop:opacity-0",
      ],
      data: [
        "data-open:duration-(--duration-overshoot)",
        "data-open:ease-overshoot",
        "data-open:starting:scale-95",
        "data-open:starting:opacity-0",
        "not-data-open:duration-250",
        "not-data-open:scale-95",
        "not-data-open:opacity-0",
      ],
    },
  },
  defaultVariants: {
    $state: "auto",
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

// A viewport into the popover surface rather than a surface of its own, so
// it takes the frame geometry without the layer and edge that come with it.
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
