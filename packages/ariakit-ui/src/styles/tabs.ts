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
import { gliderCover } from "./glider.ts";

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
    // The edge width, whichever of the two the adaptive edge picked.
    "[--tabs-bordering:calc(var(--tabs-border)+var(--ak-frame-ring))]",
  ],
  defaultVariants: {
    $border: true,
  },
});

// An unselected folder tab, or a glider covering one, floats one strip
// padding above the seam, inside the corner the panel draws there, so its
// bottom corners take the radius a frame nested that deep would: its own,
// less that padding. A selected folder has no bottom corners at all.
const tabFloatCorners = cx(
  "[--tab-radius-b:max(0px,calc(var(--ak-frame-radius)-var(--tabs-float,0px)))]",
  "not-ui-selected:rounded-b-(--tab-radius-b)",
);

// A folder tab drops its bottom corners and merges into the panel below when
// selected. Unselected, it is a button in the strip.
const tabFolder = cx(
  "ui-folder",
  tabFloatCorners,
  // The curves rewrite the radius on the pseudo-elements that draw them, so
  // the tab's own radius travels under another name.
  "[--tab-radius:var(--ak-frame-radius)]",
  // The first tab's start curve meets the panel's start corner at the root's
  // edge, which begins one edge width before the strip's padding does, so
  // both take half of the padding plus that width.
  "[:first-child>&]:nth-[1_of_&]:ui-selected:before:[--ak-frame-radius:min(var(--tab-radius),(var(--tabs-padding)+var(--tabs-border))/2)]",
  // The strip ends a tab one padding above the seam and publishes how far the
  // selected tab reaches to meet it. Only the bottom padding grows, so the
  // label keeps its place, and the margin gives the room back so the row
  // keeps its height.
  "ui-selected:pb-[calc(var(--py)+var(--tab-reach,0px))]",
  "ui-selected:-mb-(--tab-reach,0px)",
  // An unselected tab has no edge of its own, hovered or not.
  "not-ui-selected:border-transparent not-ui-selected:ring-0",
  "not-ui-selected:ui-hover:border-transparent",
);

export const tab = cv({
  extend: [button],
  class: [
    // Only the selected tab paints at rest. The others keep their layer,
    // which their hover paint reads, and show the surface behind them.
    "not-ui-selected:bg-transparent",
    // The transparent background covers the layer the hover shifts, so the
    // hover paints it back on the tab's own box. The extra variant sorts this
    // after the rule above.
    "not-ui-selected:ui-hover:bg-(--ak-layer)",
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
      if (value === "bevel") return "ui-selected:ui-bevel-button";
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
        gliderCover,
        tabFloatCorners,
        // The curves rewrite the radius on the pseudo-elements that draw
        // them, so the glider's own radius travels under another name.
        "[--tab-radius:var(--ak-frame-radius)]",
        // Only the selected folder glider reaches the seam. A hover or focus
        // glider covers the tab.
        "ui-selected:[--glider-reach:var(--tabs-dock)]",
        // With the first tab selected, the start curve shrinks as the tab's
        // own does.
        "[.glider-group:has(&)_.control]:ui-selected:nth-[1_of_.control]:[&~.glider]:before:[--ak-frame-radius:min(var(--tab-radius),(var(--tabs-padding)+var(--tabs-border))/2)]",
      ],
    },
    $state: {
      // The glider's own selected state clears the covered tab's edge as a
      // border-*, and the edge a tab inherits may be a ring-* instead.
      selected:
        "supports-anchor:[.control:has(~&)]:ui-selected:ring-transparent",
    },
  },
  defaultVariants: {
    $kind: "folder",
    // The glider's own lifts arrive as the default value, and the tab scheme
    // replaces them for the covers: the glider paints the selected tab's
    // surface, which sits one step off the strip rather than the two a
    // selected glider takes, and a hovered tab paints one step past that. A
    // bar carries its colour another way and keeps the glider's value.
    $lightnessOffset(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      if (variants.$state === "hover") return 2;
      return true;
    },
    // A selected folder glider takes the root's edge, as the tab does, and
    // frame leaves the edge variants unset for it. The other kinds keep the
    // glider's own ring, and a hover or focus glider has no edge to show.
    $border(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      if (variants.$state !== "selected") return defaultValue;
      return defaultValue ?? "inherit";
    },
  },
});

export const tabList = cv({
  extend: [buttonGroup],
  class: [
    // The strip ends flat where the panel begins.
    "rounded-b-none!",
    // The seam tucks into the strip by the root's edge width, so the strip
    // pads that much more below the tabs and every tab ends one padding
    // above the line the seam draws. A selected folder reaches through that
    // room to the seam: the tab itself, or a working selected glider.
    "[--tabs-float:var(--ak-frame-padding)]",
    "[--tabs-dock:calc(var(--tabs-float)+var(--tabs-bordering))]",
    "pb-(--tabs-dock)",
    "[--tab-reach:var(--tabs-dock)]",
    "supports-anchor:has-[>.glider.selected]:[--tab-reach:0px]",
    // A tab's end curve is painted past its box. This spacer keeps the last
    // one inside the scroll clip, whether the tabs fill the strip or
    // overflow it, so it must not give way to them.
    "after:w-[calc((var(--tabs-radius)-var(--tabs-padding))*2)] after:shrink-0",
    // Trailing tabs stay reachable by pointer when the strip overflows.
    "overflow-x-auto overflow-y-clip overscroll-x-contain [scrollbar-width:none]",
  ],
  defaultVariants: {
    // The root's surface shows through the strip.
    $layer: "ghost",
    $cover: true,
    $p: "unset",
    $rounded: "unset",
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
    // tab's curve at the root's edge, where the panel's corner starts one
    // edge width before the strip's padding does. The starting values give
    // the corner the other state's radius to animate from.
    "[.tabs:has(:first-child>.control[aria-selected='true']:nth-child(1_of_.control))_&]:rounded-ss-[min(var(--ak-frame-radius),(var(--tabs-padding)+var(--tabs-border))/2)]",
    "[.tabs:has(:first-child>.control[aria-selected='true']:nth-child(1_of_.control))_&]:starting:rounded-ss-(--ak-frame-radius)!",
    "[.tabs:has(:first-child>.control[aria-selected='false']:nth-child(1_of_.control))_&]:starting:rounded-ss-[min(var(--ak-frame-radius),(var(--tabs-padding)+var(--tabs-border))/2)]!",
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
