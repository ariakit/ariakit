import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { controlGroup, controlSeparator } from "./control.ts";
import { frame } from "./frame.ts";
import { hasLayerBackground } from "./layer.ts";

// A flat, bevel or folder glider takes the box of the control it follows, so
// the glider and everything the control paints for itself land on the same
// rectangle. A cover may reach past the control's bottom edge by
// --glider-reach; a tab's folder glider uses it to meet the panel. A frame
// margin insets the cover on every side, and the frame already takes that
// margin off the nested radius, so an inset cover stays concentric.
export const gliderCover = cx(
  "inset-s-[anchor(start)]",
  "bottom-[calc(anchor(bottom)-var(--glider-reach,0px))]",
  "w-[calc(anchor-size()-var(--ak-frame-margin)*2)]",
  "h-[calc(anchor-size()+var(--glider-reach,0px)-var(--ak-frame-margin)*2)]",
);

// What every glider shares: how it is drawn, how it travels and the surface it
// paints. It positions itself against the selected anchor, and each recipe that
// extends it says which controls publish that anchor.
export const gliderBase = cv({
  extend: [frame],
  class: [
    "glider absolute! -z-1 pointer-events-none not-supports-anchor:hidden",
    // The selected class makes ui-selected-* rules match the glider, so it
    // can share them with the control it stands in for.
    "[position-anchor:--glider-selected] selected",
  ],
  variants: {
    /**
     * Sets how the glider is drawn. `flat` and `bevel` cover the control they
     * follow, while `bar` is a thin rule along the group's edge.
     */
    $kind: {
      bevel: ["ui-bevel", gliderCover],
      flat: gliderCover,
      bar: [
        "glider-bar",
        // Keep horizontal bars outside the scrolling containing block. Firefox
        // otherwise applies the RTL scroll offset twice to anchor() insets.
        "not-[.vertical>&]:fixed! [position-visibility:anchors-visible]",
        // The bar reads as an edge on top of the controls, not a surface
        // behind them, so it reverses the stacking the base class sets.
        "z-10",
        // Raw --contrast spans 0-100, so it must be normalized before
        // scaling the bar thickness, or high-contrast mode inflates the bar
        // from 2px to 42px.
        "[--glider-bar:calc(--spacing(0.5)+(--spacing(0.1))*var(--contrast)/100)]",
        "not-[.vertical>&]:left-[anchor(left)]",
        "not-[.vertical>&]:top-[calc(anchor(bottom)+var(--glider-bar-offset))]",
        "not-[.vertical>&]:w-[anchor-size()]",
        "not-[.vertical>&]:h-(--glider-bar)",
        "not-[.vertical>&]:[&.glider-bar-start]:top-auto",
        "not-[.vertical>&]:[&.glider-bar-start]:bottom-[calc(anchor(top)+var(--glider-bar-offset))]",
        "[.vertical>&]:inset-s-[calc(anchor(end)+var(--glider-bar-offset))]",
        "[.vertical>&]:bottom-[anchor(bottom)]",
        "[.vertical>&]:w-(--glider-bar)",
        "[.vertical>&]:h-[anchor-size()]",
        "[.vertical>&]:[&.glider-bar-start]:inset-s-auto",
        "[.vertical>&]:[&.glider-bar-start]:inset-e-[calc(anchor(start)+var(--glider-bar-offset))]",
        // Frame mode locates the outside edge even when the item is indented.
        "not-[.vertical>&]:[&.glider-bar-frame]:top-auto",
        "not-[.vertical>&]:[&.glider-bar-frame]:bottom-[anchor(--glider-frame_bottom)]",
        "not-[.vertical>&]:[&.glider-bar-frame.glider-bar-start]:bottom-auto",
        "not-[.vertical>&]:[&.glider-bar-frame.glider-bar-start]:top-[anchor(--glider-frame_top)]",
        "[.vertical>&]:[&.glider-bar-frame]:inset-s-auto",
        "[.vertical>&]:[&.glider-bar-frame]:inset-e-0",
        "[.vertical>&]:[&.glider-bar-frame.glider-bar-start]:inset-e-auto",
        "[.vertical>&]:[&.glider-bar-frame.glider-bar-start]:inset-s-0",
      ],
    },
    /** Places a bar at the start or end of the group's cross axis. */
    $side: {
      start: "glider-bar-start",
      end: "glider-bar-end",
    },
    /**
     * Sets the gap from the item to the bar's near edge. Numbers scale the
     * spacing token; CSS lengths can be negative for overlap. `auto` uses frame
     * padding minus the bar thickness, clamped at zero. `frame` aligns the bar
     * to the group's edge even for an indented item. Set `--glider-bar` through
     * `style` or `className` to change thickness.
     */
    $barOffset(value?: "auto" | "frame" | (string & {}) | number) {
      if (value == null) return;
      if (value === "auto") {
        return "glider-bar-auto [--glider-bar-offset:max(0px,calc(var(--glider-padding,0px)-var(--glider-bar)))]";
      }
      if (value === "frame") {
        // Firefox needs the frame anchor inside the items' scroll container.
        // Chromium instead double-counts document scrolling for that anchor, so
        // other engines use the group's own anchor name.
        return [
          "glider-bar-frame",
          "[@supports(-moz-appearance:none)]:[:is(.glider-group,.nav):has(>&)]:before:absolute",
          "[@supports(-moz-appearance:none)]:[:is(.glider-group,.nav):has(>&)]:before:inset-0",
          "[@supports(-moz-appearance:none)]:[:is(.glider-group,.nav):has(>&)]:before:pointer-events-none",
          "[@supports(-moz-appearance:none)]:[:is(.glider-group,.nav):has(>&)]:before:[anchor-name:--glider-frame]",
        ];
      }
      return { style: { "--glider-bar-offset": getSpacingValue(value) } };
    },
    /**
     * Animates the glider as it travels between controls.
     */
    $animated: [
      "glider-animated",
      // The insets are the longhands: WebKit passes over the inset-block and
      // inset-inline shorthands in a transition list.
      "transition-[left,inset-inline-start,border-color,height,width,display]",
      "[.vertical>&]:transition-[bottom,border-color,height,width,display]",
      "duration-100 transition-discrete",
      "[.vertical>&]:duration-50",
    ],
  },
  defaultVariants: {
    $kind: "flat",
    $barOffset(defaultValue, variants) {
      if (variants.$kind !== "bar") {
        return defaultValue;
      }
      return defaultValue ?? "auto";
    },
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
    // A glider's lift counts from the group's surface, which is where a control
    // in a glider group rests. A glider takes one step more than a hovered
    // control takes.
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A bar carries its color through $invert and $contrast instead, so it
      // must not also lift off the surface.
      if (variants.$kind === "bar") return defaultValue;
      return 2;
    },
    $invert(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? true;
    },
    $contrast(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? true;
    },
    // The ring-* class lets the adaptive high-contrast edge use the group's
    // width.
    $borderType(defaultValue) {
      return defaultValue ?? "ring";
    },
    $edgeWeight(defaultValue, variants) {
      // $edgeRaw asks for the edge color exactly as given.
      if (variants.$edgeRaw) return defaultValue;
      return defaultValue ?? "adaptive";
    },
  },
  refine({ variants, addClass }) {
    if (
      variants.$border == null &&
      (variants.$kind === "bevel" || hasLayerBackground(variants))
    ) {
      // A borderless ancestor must not erase the glider's own painted edge.
      // https://github.com/ariakit/ariakit/pull/7500#discussion_r4000913151
      addClass(
        "forced-colors:ak-frame-border-[length:max(1px,var(--border-width,1px))]",
      );
    }
  },
});

// A glider that follows the controls of a glider group. It comes after them as
// their sibling, which is where the rules below look for it.
export const glider = cv({
  extend: [gliderBase],
  class: [
    // A control takes the anchor name only while it is selected and a glider
    // follows it, so the glider lands on whichever control is selected right
    // now.
    "[.control:has(~&)]:ui-selected:[anchor-name:--glider-selected]",
    // With no control selected there is no anchor to land on, and the glider
    // would stay as a blank square at the group's start.
    "not-ui-glider-selected:hidden",
  ],
  refine({ variants, addClass }) {
    if (variants.$kind === "bar") return;
    // A cover takes over the control's surface. Forced colors repaint
    // transparent borders, and the cover owns the edge, so remove the covered
    // control's width as well as its border color.
    addClass([
      "supports-anchor:[.control:has(~&)]:ui-selected:bg-transparent",
      "supports-anchor:[.control:has(~&)]:ui-selected:border-transparent",
      "supports-anchor:[.control:has(~&)]:ui-selected:befter:hidden",
      "supports-anchor:[.control:has(~&)]:ui-selected:forced-colors:ak-frame-border-0",
    ]);
  },
});

export const gliderAnchor = cv({
  // The marker a glider reads to find a selected control before it (see
  // ui-glider-selected in ui.css). The glider's own rules give the selected
  // control its anchor name.
  class: "peer",
});

export const gliderSeparator = controlSeparator;

export const gliderGroup = cv({
  extend: [controlGroup],
  // The gliders paint behind the controls, below zero on the z axis, so the
  // group opens a stacking context to keep them in front of its own surface.
  class: "glider-group relative z-1 [--glider-padding:var(--ak-frame-padding)]",
  style: {
    anchorName: "--glider-frame",
    anchorScope: "--glider-frame, --glider-selected",
  },
});
