import { cv, cx } from "clava";
import { controlGroup, controlSeparator } from "./control.ts";
import { frame } from "./frame.ts";

// A bevel or flat glider covers the whole control it follows, inset on every
// side by the padding the group publishes.
const gliderCover = cx(
  "m-(--inset-padding)",
  "inset-s-[anchor(start)] bottom-[anchor(bottom)]",
  "w-[calc(anchor-size()-var(--inset-padding)*2)]",
  "h-[calc(anchor-size()-var(--inset-padding)*2)]",
);

export const glider = cv({
  extend: [frame],
  class: "glider absolute! -z-1 pointer-events-none not-supports-anchor:hidden",
  variants: {
    /**
     * Sets how the glider is drawn. `flat` and `bevel` cover the control they
     * follow, while `bar` is a thin rule along the group's edge.
     */
    $kind: {
      bevel: ["ui-bevel", gliderCover],
      flat: gliderCover,
      bar: [
        // The bar reads as an edge on top of the controls, not a surface
        // behind them, so it reverses the stacking the base class sets.
        "z-10",
        // Raw --contrast spans 0-100, so it must be normalized before
        // scaling the bar thickness, or high-contrast mode inflates the bar
        // from 2px to 42px.
        "[--glider-bar:calc(--spacing(0.5)+(--spacing(0.1))*var(--contrast)/100)]",
        "not-[.vertical>&]:inset-s-[calc(anchor(start)+var(--inset-padding))]",
        "not-[.vertical>&]:bottom-[anchor(--glider-group_bottom)]",
        "not-[.vertical>&]:w-[calc(anchor-size()-var(--inset-padding)*2)]",
        "not-[.vertical>&]:h-(--glider-bar)",
        "[.vertical>&]:inset-e-[anchor(--glider-group_end)]",
        "[.vertical>&]:bottom-[calc(anchor(bottom)+var(--inset-padding))]",
        "[.vertical>&]:w-(--glider-bar)",
        "[.vertical>&]:h-[calc(anchor-size()-var(--inset-padding)*2)]",
      ],
    },
    /**
     * Sets which control state the glider follows. A control publishes the
     * matching anchor name only while it is in that state, so the glider
     * lands on whichever control is hovered, focused, or selected right now.
     */
    $state: {
      none: "",
      hover: [
        "[position-anchor:--glider-hover] ease-linear",
        "[.control:has(~&)]:ui-hover:[--glider-hover:--glider-hover]",
        "in-[.glider-group:hover:not(:has(:hover))]:delay-250",
        "in-[.glider-group:not(:hover)]:hidden",
        // The glider sits behind the control it covers, so the control has
        // to stop painting its own surface or it hides the glider.
        "supports-anchor:[.control:has(~&)]:ui-hover:bg-transparent",
        "supports-anchor:[.control:has(~&)]:ui-hover:border-transparent",
        "supports-anchor:[.control:has(~&)]:ui-hover:befter:hidden",
      ],
      focus: [
        "[position-anchor:--glider-focus]",
        "[.control:has(~&)]:ui-focus-visible:[--glider-focus:--glider-focus]",
        "not-peer-ui-focus-visible:outline-none",
        "supports-anchor:[.control:has(~&)]:ui-focus-visible:outline-none",
        "ak-outline ak-outline-brand outline-2 outline-offset-1",
      ],
      selected: [
        "[position-anchor:--glider-selected] selected",
        "[.control:has(~&)]:ui-selected:[--glider-selected:--glider-selected]",
        "supports-anchor:[.control:has(~&)]:ui-selected:bg-transparent",
        "supports-anchor:[.control:has(~&)]:ui-selected:border-transparent",
        "supports-anchor:[.control:has(~&)]:ui-selected:befter:hidden",
      ],
    },
    /**
     * Animates the glider as it travels between controls.
     */
    $animated: [
      "transition-[inset-inline,border-color,height,width,outline]",
      "[.vertical>&]:transition-[inset-block,border-color,height,width,outline]",
      "duration-100 transition-discrete",
      "[.vertical>&]:duration-50",
    ],
  },
  defaultVariants: {
    $kind: "flat",
    $state: "selected",
    $animated: true,
    $p: "none",
    // A bar is a rule a couple of pixels thick. It has no room for a radius
    // or a border, so these two ignore what an extender asked for.
    $rounded(defaultValue, variants) {
      if (variants.$kind === "bar") return "none";
      return defaultValue ?? "full";
    },
    $border(defaultValue, variants) {
      if (variants.$kind === "bar") return false;
      return defaultValue;
    },
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$state === "hover") return true;
      if (variants.$state !== "selected") return defaultValue;
      // A selected bar carries its color through $invert and $contrast
      // instead, so it must not also lift off the surface.
      if (variants.$kind === "bar") return defaultValue;
      return 2;
    },
    $invert(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? true;
    },
    $contrast(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? true;
    },
    $borderType(defaultValue, variants) {
      // Hover feedback is a flat layer with no border semantics. The ring
      // class must not be emitted here, or it picks up a bordered group's
      // inherited --border-width. Selected and focus gliders keep the ring so
      // the adaptive high-contrast edge can use the group's width.
      if (variants.$state === "hover") return defaultValue ?? "unset";
      return defaultValue ?? "ring";
    },
    $edgeWeight(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      return defaultValue ?? "adaptive";
    },
  },
});

export const gliderAnchor = cv({
  class: "peer",
  style: {
    // Every control carries all three names, but each one stays the dummy
    // --x until the control enters that state and the glider's own rules
    // swap the real name in. Only then can a glider anchor to it.
    anchorName:
      "var(--glider-hover,--x), var(--glider-focus,--x), var(--glider-selected,--x)",
  },
});

export const gliderSeparator = cv({
  extend: [controlSeparator],
  // Both this margin and the one controlSeparator sets target margin-inline
  // at the same specificity, so this one wins only because it sorts later.
  class:
    "separator -mx-[calc(var(--inset-padding,0px)*1.5+var(--border-width,0px)/2)]",
});

export const gliderGroup = cv({
  extend: [controlGroup],
  class: [
    "glider-group relative z-1",
    "not-[.vertical]:has-[>.glider]:[&>.control:not(:nth-last-child(1_of_.control)):not(:has(+.separator))]:me-[calc(-2*var(--inset-padding))]",
    "[.vertical]:has-[>.glider]:[&>.control:not(:nth-last-child(1_of_.control))]:mb-[calc(-2*var(--inset-padding))]",
    "supports-anchor:has-[>.glider]:[--inset-padding:var(--ak-frame-padding,0px)]",
  ],
  style: {
    anchorName: "--glider-group",
    anchorScope:
      "--glider-group, --glider-hover, --glider-focus, --glider-selected",
  },
  refine({ variants, addClass }) {
    // A gapless group has only its padding to separate its controls, so it
    // keeps it. With a gap, the glider's own inset already provides that
    // space and the padding would double it.
    if (variants.$gap === "none") return;
    addClass("supports-anchor:has-[>.glider]:p-0");
  },
});
