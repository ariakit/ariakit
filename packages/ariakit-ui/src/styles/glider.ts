import { cv, cx } from "clava";
import { controlGroup, controlSeparator } from "./control.ts";
import { frame } from "./frame.ts";

// A flat, bevel or folder glider takes the box of the control it follows, so
// the glider and everything the control paints for itself land on the same
// rectangle. A cover may reach past the control's bottom edge by
// --glider-reach; the selected folder glider uses it to meet the panel. A frame
// margin insets the cover on every side, and the frame already takes that
// margin off the nested radius, so an inset cover stays concentric.
export const gliderCover = cx(
  "inset-s-[anchor(start)]",
  "bottom-[calc(anchor(bottom)-var(--glider-reach,0px))]",
  "w-[calc(anchor-size()-var(--ak-frame-margin)*2)]",
  "h-[calc(anchor-size()+var(--glider-reach,0px)-var(--ak-frame-margin)*2)]",
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
        // The group is the containing block, and an element cannot anchor
        // its own absolutely positioned children, so the group's edge is a
        // plain inset rather than an anchor() on its name.
        "not-[.vertical>&]:inset-s-[anchor(start)]",
        "not-[.vertical>&]:bottom-0",
        "not-[.vertical>&]:w-[anchor-size()]",
        "not-[.vertical>&]:h-(--glider-bar)",
        "[.vertical>&]:inset-e-0",
        "[.vertical>&]:bottom-[anchor(bottom)]",
        "[.vertical>&]:w-(--glider-bar)",
        "[.vertical>&]:h-[anchor-size()]",
      ],
    },
    /**
     * Sets which control state the glider follows. A control publishes the
     * matching anchor name only while it is in that state, so the glider lands
     * on whichever control is hovered, focused, or selected right now.
     */
    $state: {
      none: "",
      hover: [
        "[position-anchor:--glider-hover] ease-linear",
        "[.control:has(~&)]:ui-hover:[--glider-hover:--glider-hover]",
        // A selected glider covers the same box, and hovering the selected
        // control must not change it, so the hover glider sits under the
        // selected one. Both are below zero; this sorts after the base value.
        "-z-2",
        // The pointer is crossing the gap between two controls, so the glider
        // waits on the last one for the next instead of leaving at once.
        "in-[.glider-group:hover:not(:has(:hover))]:delay-250",
        // With nothing under the pointer the anchor is gone, and a glider that
        // stayed would fall to a point at the group's start. It leaves instead,
        // after the delay above, and comes back in place on the next control.
        "in-[.glider-group:not(:has(:hover))]:hidden",
        // The glider sits behind the control it covers, so the control has to
        // stop painting its own surface or it hides the glider. A control's
        // own hover paint can carry more variants than this rule and outrank
        // it (a tab's does), so the surface wipe is marked important.
        "supports-anchor:[.control:has(~&)]:ui-hover:bg-transparent!",
        "supports-anchor:[.control:has(~&)]:ui-hover:border-transparent",
        "supports-anchor:[.control:has(~&)]:ui-hover:befter:hidden",
      ],
      focus: [
        "[position-anchor:--glider-focus] focus",
        "[.control:has(~&)]:ui-focus-visible:[--glider-focus:--glider-focus]",
        "not-peer-ui-focus-visible:outline-none",
        "supports-anchor:[.control:has(~&)]:ui-focus-visible:outline-none",
        "ak-outline ak-outline-brand outline-2 outline-offset-1",
      ],
      selected: [
        "[position-anchor:--glider-selected] selected",
        "[.control:has(~&)]:ui-selected:[--glider-selected:--glider-selected]",
        // With no control selected there is no anchor to land on, and the
        // glider would stay as a blank square at the group's start.
        "not-ui-sibling-selected:hidden",
        "supports-anchor:[.control:has(~&)]:ui-selected:bg-transparent",
        "supports-anchor:[.control:has(~&)]:ui-selected:border-transparent",
        "supports-anchor:[.control:has(~&)]:ui-selected:befter:hidden",
      ],
    },
    /**
     * Animates the glider as it travels between controls.
     */
    $animated: [
      // display is on the list so a leaving hover glider can wait out its
      // delay first; the discrete behaviour is what lets display take part.
      // The insets are the longhands: WebKit passes over the inset-block and
      // inset-inline shorthands in a transition list.
      "transition-[inset-inline-start,border-color,height,width,outline,display]",
      "[.vertical>&]:transition-[bottom,border-color,height,width,outline,display]",
      "duration-100 transition-discrete",
      "[.vertical>&]:duration-50",
    ],
  },
  defaultVariants: {
    $kind: "flat",
    $state: "selected",
    $animated: true,
    $p: "none",
    // A bar is a rule a couple of pixels thick. It has no room for a radius or
    // a border, so these two ignore what an extender asked for.
    $rounded(defaultValue, variants) {
      if (variants.$kind === "bar") return "none";
      return defaultValue ?? "full";
    },
    $border(defaultValue, variants) {
      if (variants.$kind === "bar") return false;
      return defaultValue;
    },
    $layer(defaultValue, variants) {
      if (variants.$state !== "focus") return defaultValue;
      // A bar is the indicator itself and keeps its fill.
      if (variants.$kind === "bar") return defaultValue;
      // A focus cover draws its indicator and paints nothing. It keeps the
      // layer, which colours the indicator, and replaces only layer's own
      // default: a colour asked for by an extender or a caller stays.
      if (defaultValue !== true) return defaultValue;
      return "transparent";
    },
    // A glider's lift counts from the group's surface, which is where a control
    // in a glider group rests. A hover glider takes the one step a hovered
    // control takes, and a selected glider one more. Controls that lift at rest
    // pass that lift on to their gliders, or the hover glider paints the colour
    // they already have.
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$state === "hover") return true;
      if (variants.$state !== "selected") return defaultValue;
      // A selected bar carries its color through $invert and $contrast instead,
      // so it must not also lift off the surface.
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
      // Hover and focus feedback have no edge. The ring-* class must not be
      // emitted for them, or it picks up a bordered group's inherited
      // --border-width and draws a hairline beside the focus indicator. A
      // selected glider keeps the ring-* so the adaptive high-contrast edge can
      // use the group's width.
      if (variants.$state === "selected") return defaultValue ?? "ring";
      return defaultValue ?? "unset";
    },
    $edgeWeight(defaultValue, variants) {
      if (variants.$state !== "selected") return defaultValue;
      // $edgeRaw asks for the edge color exactly as given.
      if (variants.$edgeRaw) return defaultValue;
      return defaultValue ?? "adaptive";
    },
  },
});

export const gliderAnchor = cv({
  class: "peer",
  style: {
    // Every control carries all three names, but each one stays the dummy --x
    // until the control enters that state and the glider's own rules swap the
    // real name in. Only then can a glider anchor to it.
    anchorName:
      "var(--glider-hover,--x), var(--glider-focus,--x), var(--glider-selected,--x)",
  },
});

export const gliderSeparator = controlSeparator;

export const gliderGroup = cv({
  extend: [controlGroup],
  // The gliders paint behind the controls, below zero on the z axis, so the
  // group opens a stacking context to keep them in front of its own surface.
  class: "glider-group relative z-1",
  style: {
    anchorScope: "--glider-hover, --glider-focus, --glider-selected",
  },
});
