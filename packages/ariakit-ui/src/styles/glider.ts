import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { controlGroup, controlSeparator } from "./control.ts";
import { frame } from "./frame.ts";
import { hasLayerBackground } from "./layer.ts";

// Match the selected control's box. --glider-reach extends covers to tab
// panels; frame margins inset the cover and preserve concentric corners.
export const gliderCover = cx(
  "inset-s-[anchor(start)]",
  "bottom-[calc(anchor(bottom)-var(--glider-reach,0px))]",
  "w-[calc(anchor-size()-var(--ak-frame-margin)*2)]",
  "h-[calc(anchor-size()+var(--glider-reach,0px)-var(--ak-frame-margin)*2)]",
);

// The concentric radius of items placed in a frame's padding. It skips the
// frame's 0.125em minimum because the group cannot read the item's own radius.
// Groups set it as `--glider-radius` through inline styles: a class name
// containing frame utility names would trip `[class*=…]` frame checks such as
// shell covers.
export const gliderRadius =
  "max(0px, calc(var(--ak-frame-radius) - var(--ak-frame-padding) - var(--ak-frame-border)))";

/**
 * An anchored selection indicator with surface, bar, and motion variants.
 * Extenders identify the selected control.
 */
export const gliderBase = cv({
  extend: [frame],
  class: [
    "glider absolute! -z-1 pointer-events-none not-supports-anchor:hidden",
    // Let the glider share the selected control's state rules.
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
        "z-10",
        // A fixed width keeps the bar the same at every text size. Normalize
        // the 0–100 contrast scale so high contrast adds only 20%.
        "[--glider-bar:calc(var(--glider-bar-width,2px)*(1+0.2*var(--contrast)/100))]",
        // `$barLength` shortens the bar by an inset at each end.
        "not-[.vertical>&]:left-[calc(anchor(left)+var(--glider-bar-inset,0px))]",
        "not-[.vertical>&]:top-[calc(anchor(bottom)+var(--glider-bar-offset))]",
        "not-[.vertical>&]:w-[calc(anchor-size()-var(--glider-bar-inset,0px)*2)]",
        "not-[.vertical>&]:h-(--glider-bar)",
        "not-[.vertical>&]:[&.glider-bar-start]:top-auto",
        "not-[.vertical>&]:[&.glider-bar-start]:bottom-[calc(anchor(top)+var(--glider-bar-offset))]",
        "[.vertical>&]:inset-s-[calc(anchor(end)+var(--glider-bar-offset))]",
        "[.vertical>&]:bottom-[calc(anchor(bottom)+var(--glider-bar-inset,0px))]",
        "[.vertical>&]:w-(--glider-bar)",
        "[.vertical>&]:h-[calc(anchor-size()-var(--glider-bar-inset,0px)*2)]",
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
     * padding minus the bar thickness, clamped at zero. `center` centers the
     * bar in the frame padding, so it touches neither the frame edge nor the
     * item. `frame` aligns the bar to the group's edge even for an indented
     * item.
     */
    $barOffset(value?: "auto" | "center" | "frame" | (string & {}) | number) {
      if (value == null) return;
      if (value === "auto") {
        return "glider-bar-auto [--glider-bar-offset:max(0px,calc(var(--glider-padding,0px)-var(--glider-bar)))]";
      }
      if (value === "center") {
        return "glider-bar-center [--glider-bar-offset:max(0px,calc((var(--glider-padding,0px)-var(--glider-bar))/2))]";
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
     * Sets the bar thickness. Numbers are pixels; other values are CSS lengths.
     * High contrast adds 20%. Defaults to 2px.
     */
    $barWidth(value?: number | (string & {})) {
      if (value == null) return;
      const width = typeof value === "number" ? `${value}px` : value;
      return { style: { "--glider-bar-width": width } };
    },
    /**
     * Sets the bar length along the item. `full` spans the item. `auto` is
     * shorter by the item's corner radius, half at each end, so rounder items
     * get shorter bars. Defaults to `auto` for bars.
     */
    $barLength: {
      full: "",
      // Browsers clamp a rendered corner to half the item's shorter side.
      // Engines that reject anchor-size() in insets keep the full length.
      auto: "supports-[left:anchor-size(width)]:[--glider-bar-inset:min(var(--glider-radius,0px)/2,anchor-size(width)/4,anchor-size(height)/4)]",
    },
    /** Animates the glider as it travels between controls. */
    $animated: [
      "glider-animated",
      // WebKit requires inset longhands in transition lists. Omit display so
      // unselected gliders disappear immediately.
      "transition-[left,inset-inline-start,height,width]",
      "[.vertical>&]:transition-[bottom,height,width]",
      "duration-100",
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
    $barLength(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? "auto";
    },
    $animated: true,
    $p: "none",
    // Bars ignore extender radius and border defaults to remain thin rules.
    // Their subtle radius would otherwise follow a padded parent frame.
    $rounded(defaultValue, variants) {
      if (variants.$kind === "bar") return "xs";
      return defaultValue ?? "full";
    },
    $forceRounded(defaultValue, variants) {
      if (variants.$kind !== "bar") return defaultValue;
      return defaultValue ?? true;
    },
    $border(defaultValue, variants) {
      if (variants.$kind === "bar") return false;
      return defaultValue;
    },
    // Keep the glider one lightness step beyond a hovered control.
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // Bars use inversion and contrast instead of a lightness offset.
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
    // Let adaptive high-contrast edges use the group's ring width.
    $borderType(defaultValue) {
      return defaultValue ?? "ring";
    },
    $edgeWeight(defaultValue, variants) {
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

/** A selection indicator placed after the controls in its glider group. */
export const glider = cv({
  extend: [gliderBase],
  class: [
    // Only the selected control before this glider supplies its anchor.
    "[.control:has(~&)]:ui-selected:[anchor-name:--glider-selected]",
    // Without an anchor, the glider would remain at the group's start.
    "not-ui-glider-selected:hidden",
  ],
  refine({ variants, addClass }) {
    if (variants.$kind === "bar") return;
    // The cover owns the selected edge. Forced colors repaint transparent
    // borders, so remove the control's border width too.
    addClass([
      "supports-anchor:[.control:has(~&)]:ui-selected:bg-transparent",
      "supports-anchor:[.control:has(~&)]:ui-selected:border-transparent",
      "supports-anchor:[.control:has(~&)]:ui-selected:befter:hidden",
      "supports-anchor:[.control:has(~&)]:ui-selected:forced-colors:ak-frame-border-0",
    ]);
  },
});

/** Marks a control that a following glider can track. */
export const gliderAnchor = cv({
  class: "peer",
});

/** A separator between controls in a glider group. */
export const gliderSeparator = controlSeparator;

/** A control group that contains and scopes its selection gliders. */
export const gliderGroup = cv({
  extend: [controlGroup],
  // Keep negative-z-index gliders above the group's background.
  class: "glider-group relative z-1 [--glider-padding:var(--ak-frame-padding)]",
  style: {
    anchorName: "--glider-frame",
    anchorScope: "--glider-frame, --glider-selected",
    "--glider-radius": gliderRadius,
  },
});
