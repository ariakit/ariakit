import { cv } from "clava";
import { button } from "./button.ts";
import { frame } from "./frame.ts";
import { layer } from "./layer.ts";

export const popover = cv({
  extend: [layer, frame],
  class: [
    "z-10",
    "[transition-property:overlay,display,scale,opacity] transition-discrete",
    // Popover edges adapt to the theme: a ring reads better over light
    // content, a border over dark.
    "ak-light:ring ak-light:border-none ak-dark:ak-frame-border",
    // Scale from the anchor side when Ariakit provides the transform
    // origin; the invalid var() fallback leaves the default center origin
    // for native popovers.
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
     * the `data-open` attribute, and `none` renders a static surface with
     * no transitions, for previews and thumbnails.
     */
    $state: {
      none: "",
      // The enter easing overshoots slightly; curve from easingwizard.com.
      // Inlined twice because Tailwind only picks up literal candidates.
      auto: [
        "[&:is(dialog,[popover])]:open:duration-500",
        "[&:is(dialog,[popover])]:open:ease-[linear(0,0.008_1.1%,0.031_2.2%,0.129_4.8%,0.257_7.2%,0.671_14.2%,0.789_16.5%,0.881_18.6%,0.957_20.7%,1.019_22.9%,1.063_25.1%,1.094_27.4%,1.114_30.7%,1.112_34.5%,1.018_49.9%,0.99_59.1%,1)]",
        "[&:is(dialog,[popover])]:open:starting:scale-95",
        "[&:is(dialog,[popover])]:open:starting:opacity-0",
        // The backdrop is a native top-layer pseudo-element, so its rules
        // only exist on this channel. The discrete transition and starting
        // opacity make the fades the legacy transition-property list
        // declared actually run.
        "[&:is(dialog,[popover])]:backdrop:[transition-property:overlay,display,opacity]",
        "[&:is(dialog,[popover])]:backdrop:transition-discrete",
        "[&:is(dialog,[popover])]:open:backdrop:duration-250",
        "[&:is(dialog,[popover])]:open:backdrop:opacity-100",
        "[&:is(dialog,[popover])]:open:starting:backdrop:opacity-0",
        "[&:is(dialog,[popover])]:not-open:duration-250",
        "[&:is(dialog,[popover])]:not-open:scale-95",
        "[&:is(dialog,[popover])]:not-open:opacity-0",
        "[&:is(dialog,[popover])]:not-open:backdrop:duration-250",
        "[&:is(dialog,[popover])]:not-open:backdrop:opacity-0",
      ],
      data: [
        "data-open:duration-500",
        "data-open:ease-[linear(0,0.008_1.1%,0.031_2.2%,0.129_4.8%,0.257_7.2%,0.671_14.2%,0.789_16.5%,0.881_18.6%,0.957_20.7%,1.019_22.9%,1.063_25.1%,1.094_27.4%,1.114_30.7%,1.112_34.5%,1.018_49.9%,0.99_59.1%,1)]",
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
    // Popovers always float above content, so they lighten like the legacy
    // ak-layer-lighten-6 instead of using the adaptive offset.
    $lighten: 1.2,
  },
});

export const popoverDisclosure = cv({
  extend: [button],
});

export const popoverScroll = cv({
  extend: [frame],
  class: "overflow-auto overscroll-contain",
  defaultVariants: {
    $cover: true,
    // The scroll area is a viewport into the popover surface, not a new
    // layer like the legacy ak-popover-scroll.
    $layer: false,
  },
});

export const popoverHeading = cv({
  class: "text-lg font-medium",
});

export const popoverDescription = cv({
  class: "ak-ink-80",
});
