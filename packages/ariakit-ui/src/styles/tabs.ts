import { cv, cx } from "clava";
import {
  button,
  buttonGlider,
  buttonGroup,
  buttonLabel,
  buttonSeparator,
  buttonSlot,
} from "./button.ts";
import { frame } from "./frame.ts";

export const tabs = cv({
  extend: [frame],
  class: [
    "tabs",
    // The tabs, the glider and the panel all read the root's geometry. The
    // padding and the radius inherit, but every frame on the way down
    // rewrites them, and the edge widths never inherit at all.
    "[--tabs-padding:var(--ak-frame-padding)]",
    "[--tabs-radius:var(--ak-frame-radius)]",
    "[--tabs-border:var(--ak-frame-border)]",
    "[--tabs-ring:var(--ak-frame-ring)]",
    // The edge width, whichever of the two the adaptive edge picked.
    "[--tabs-bordering:calc(var(--tabs-border)+var(--tabs-ring))]",
  ],
  defaultVariants: {
    $border: true,
  },
});

// A folder tab drops its bottom corners and merges into the panel below when
// selected, and paints its hover as an inset rectangle otherwise.
const tabFolder = cx(
  "ui-folder",
  // The curves rewrite the radius on the pseudo-elements that draw them, so
  // the tab's own radius travels under another name.
  "[--tab-radius:var(--ak-frame-radius)]",
  // The first tab's start curve would poke out of the root, so it shrinks
  // to fit inside the root's padding.
  "[:first-child>&]:nth-[1_of_&]:ui-selected:before:[--ak-frame-radius:min(var(--tab-radius),var(--tabs-padding)/2)]",
  // Without a glider the selected tab paints its own surface, and it grows
  // by the root's edge width to cover the panel's top edge.
  "[.tabs:not(:has(.glider))_&]:pb-[calc(var(--py)+var(--inset-padding,0px)+var(--tabs-bordering))]",
  // An unselected tab has no edge of its own, hovered or not.
  "not-ui-selected:border-transparent not-ui-selected:ring-0",
  "not-ui-selected:ui-hover:border-transparent",
  // A folder tab has no bottom corners to round, so its hover paints on an
  // inset rectangle drawn by ::after rather than on the tab. The tab still
  // resolves the hovered layer color, and the overlay reads it as its
  // parent layer.
  "not-ui-selected:ui-hover:bg-transparent",
  "not-ui-selected:ui-hover:after:absolute not-ui-selected:ui-hover:after:-z-1",
  "not-ui-selected:ui-hover:after:ak-layer",
  "not-ui-selected:ui-hover:after:ak-layer-color-(--ak-layer-parent)",
  // The overlay keeps one visual inset from the tab's outer edge. Its
  // containing box is already inside that edge, except at the bottom, where
  // the folder shape has none, and except when the edge is a ring-*, which
  // takes no space.
  "not-ui-selected:ui-hover:after:[--inset:max(0px,0.2em+var(--group-gap)/2-var(--tabs-padding)/2)]",
  "not-ui-selected:ui-hover:after:[--inset-x:calc(var(--inset)+var(--tabs-ring))]",
  "not-ui-selected:ui-hover:after:[--inset-b:calc(var(--inset)+var(--tabs-bordering))]",
  "not-ui-selected:ui-hover:after:top-(--inset-x)",
  "not-ui-selected:ui-hover:after:bottom-(--inset-b)",
  "not-ui-selected:ui-hover:after:inset-x-(--inset-x)",
  // The corners stay concentric with the tab's.
  "not-ui-selected:ui-hover:after:[--round-t:calc(var(--ak-frame-radius)-var(--tabs-border)-var(--inset-x))]",
  "not-ui-selected:ui-hover:after:[--round-b:calc(var(--ak-frame-radius)-var(--inset-b))]",
  "not-ui-selected:ui-hover:after:rounded-t-(--round-t)",
  "not-ui-selected:ui-hover:after:rounded-b-(--round-b)",
);

export const tab = cv({
  extend: [button],
  class: [
    // Only the selected tab paints at rest. The others keep their layer,
    // which their hover paint reads, and show the surface behind them.
    "not-ui-selected:bg-transparent",
    // The selected tab already reads as active, so hovering it must not
    // shift its layer the way a button hover does.
    "ui-selected:ui-hover:ak-state-0",
  ],
  variants: {
    /**
     * Sets how the tab paints. A `flat` tab is a plain button that lifts off
     * the strip when selected, a `bevel` tab raises the selected tab with the
     * gradient and inner shadow of a push button, and a `folder` tab drops
     * its bottom corners and merges into the panel below. Whatever the kind,
     * an unselected tab shows the surface behind it until hovered.
     */
    $kind(value?: "flat" | "bevel" | "folder") {
      if (value === "folder") return tabFolder;
      // The transparent background hides the layer the hover shifts, so the
      // hover paints it back.
      const hoverPaint = "not-ui-selected:ui-hover:bg-(--ak-layer)";
      if (value === "bevel") {
        return [hoverPaint, "ui-selected:ui-bevel-button"];
      }
      if (value === "flat") return hoverPaint;
      return;
    },
  },
  defaultVariants: {
    $kind: "folder",
    // The radius comes from the frame nesting, concentric with the strip.
    $rounded: "unset",
    // A folder tab takes the root's edge, so the selected one merges with
    // the panel. The other kinds have none, like the button they are.
    $border(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      return defaultValue ?? "inherit";
    },
  },
});

export const tabSlot = buttonSlot;

export const tabLabel = buttonLabel;

export const tabSeparator = buttonSeparator;

// A hover or focus glider is clipped to an inset rectangle, like the hover a
// folder tab paints for itself.
const tabGliderClip = cx(
  "[--round-t:calc(var(--ak-frame-radius)-var(--inset))]",
  "[--round-b:calc(var(--ak-frame-radius)-var(--inset)-var(--tabs-padding))]",
  "[clip-path:inset(var(--inset)_round_var(--round-t)_var(--round-t)_var(--round-b)_var(--round-b))]",
);

export const tabGlider = cv({
  extend: [buttonGlider],
  // The glider's own duration-* has a vertical variant that sorts after this
  // one and would otherwise win in a vertical strip.
  class: "duration-(--duration-tabs)!",
  variants: {
    /**
     * Adds `folder` to the glider's `flat`, `bevel` and `bar`: the glider
     * takes the shape of a selected folder tab, curves included, and reaches
     * down to the panel.
     */
    $kind: {
      folder: [
        "ui-folder",
        // The curves rewrite the radius on the pseudo-elements that draw
        // them, so the glider's own radius travels under another name.
        "[--tab-radius:var(--ak-frame-radius)]",
        // The cover geometry, except that the bottom edge stays on the tab's:
        // the height loses one inset rather than two.
        "m-(--inset-padding) mb-0",
        "inset-s-[anchor(start)] bottom-[anchor(bottom)]",
        "w-[calc(anchor-size()-var(--inset-padding)*2)]",
        "h-[calc(anchor-size()-var(--inset-padding))]",
        // With the first tab selected, the start curve shrinks to fit the
        // root's padding, as the tab's own does.
        "[.glider-group:has(&)_.control]:ui-selected:nth-[1_of_.control]:[&~.glider]:before:[--ak-frame-radius:min(var(--tab-radius),var(--tabs-padding)/2)]",
      ],
    },
    $state: {
      // The glider's own selected state clears the covered tab's edge as a
      // border-*, and the edge a tab inherits may be a ring-* instead.
      selected:
        "supports-anchor:[.control:has(~&)]:ui-selected:ring-transparent",
      hover: [
        "[--inset:calc(max(0px,0.2em-var(--tabs-padding)/2)+var(--tabs-bordering))]",
        "rounded-none",
        tabGliderClip,
      ],
      focus: [
        "[--inset:0.2em]",
        tabGliderClip,
        // The clip cuts everything past the inset, the focus indicator
        // included, so the indicator moves inside it by its own 2px width.
        // The glider's outline-offset-1 is the rule this one has to beat.
        "outline-offset-[calc(-1*(var(--inset)+2px))]!",
      ],
    },
  },
  defaultVariants: {
    $kind: "folder",
    // The glider paints the selected tab's surface, so it sits on the tab's
    // layer offset rather than the deeper one a selected glider takes.
    $lightnessOffset: true,
    // A folder glider takes the root's edge, as the tab does, and frame
    // leaves the edge variants unset for it. The other kinds keep the
    // glider's own ring.
    $border(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      return defaultValue ?? "inherit";
    },
  },
  refine({ variants, setVariants }) {
    if (variants.$state !== "focus") return;
    // The focus glider draws its indicator and paints nothing, whatever the
    // surface above asked for.
    setVariants({ $lightnessOffset: false });
  },
});

export const tabList = cv({
  extend: [buttonGroup],
  class: [
    // The strip ends flat where the panel begins. Folder tabs reach down to
    // it, so the strip drops its bottom padding for them, and keeps it for
    // the other kinds, which float in the strip as buttons do.
    "rounded-b-none! has-[.ui-folder]:pb-0",
    // A tab's end curve is painted past its box. This spacer keeps the last
    // one inside the scroll clip, whether the tabs fill the strip or
    // overflow it, so it must not give way to them.
    "after:w-[calc((var(--tabs-radius)-var(--tabs-padding))*2)] after:shrink-0",
    // Trailing tabs stay reachable by pointer when the strip overflows.
    "overflow-x-auto overflow-y-clip overscroll-x-contain [scrollbar-width:none]",
    // Tabs sit flush unless a working glider spaces them.
    "not-has-[.glider]:gap-0 not-supports-anchor:gap-0",
  ],
  defaultVariants: {
    // The root's surface shows through the strip.
    $layer: "ghost",
    $cover: true,
    $p: "unset",
    $rounded: "unset",
    // A cover child overhangs the root's padding by its own edge width. The
    // strip has no edge, so it takes the root's to line up with the panel.
    $m: "calc(-1 * var(--tabs-border))",
  },
});

export const tabPanels = cv({
  extend: [frame],
  class: [
    "relative overflow-clip",
    // The panel's top edge tucks under the strip, where the selected tab or
    // the glider covers it.
    "-mt-(--ak-frame-border)",
    // With the first tab selected, the start corner shrinks to meet that
    // tab's curve, which fits inside the root's padding. The starting values
    // give the corner the other state's radius to animate from.
    "[.tabs:has(:first-child>.control[aria-selected='true']:nth-child(1_of_.control))_&]:rounded-ss-[min(var(--ak-frame-radius),var(--tabs-padding)/2)]",
    "[.tabs:has(:first-child>.control[aria-selected='true']:nth-child(1_of_.control))_&]:starting:rounded-ss-(--ak-frame-radius)!",
    "[.tabs:has(:first-child>.control[aria-selected='false']:nth-child(1_of_.control))_&]:starting:rounded-ss-[min(var(--ak-frame-radius),var(--tabs-padding)/2)]!",
    // The corner animates only beside a selected glider, whose travel it
    // follows. Without anchor support the glider is not shown.
    "ease-tabs",
    "supports-anchor:[.tabs:has(.glider.selected)_&]:transition-[border-radius]",
    "supports-anchor:[.tabs:has(.glider.selected)_&]:duration-(--duration-tabs)",
  ],
  variants: {
    /**
     * Whether the top corners keep the frame radius. The strip above paints
     * nothing, so they show. A strip that paints its own surface wants them
     * square.
     */
    $roundedTop: "rounded-t-(--ak-frame-radius)",
  },
  defaultVariants: {
    $roundedTop: true,
    $lightnessOffset: true,
    $p: 3,
    $cover: true,
    // The edge is the root's, as on the tab.
    $border: "inherit",
  },
});
