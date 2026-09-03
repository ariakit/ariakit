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
    // While the first tab is a selected folder, its start curve and the
    // panel's start corner meet halfway between the root's edge and that
    // tab. A strip thinner than the edge pulls its tabs onto the edge, so
    // the room is the padding plus what the edge leaves of it. Otherwise
    // the curve and the corner keep their own radius.
    "has-[>:first-child>.ui-folder[aria-selected='true']:nth-child(1_of_.control)]:[--tabs-meet:calc((var(--tabs-padding)+min(var(--tabs-padding),var(--tabs-border)))/2)]",
    // The panel follows the strip's scroll to square the corner a
    // scrolled-off tab is cut at, and a sibling can only reach that
    // timeline through a scope on the root.
    "[timeline-scope:--tabs-scroll]",
  ],
  defaultVariants: {
    $border: true,
  },
  refine({ variants, setVariants }) {
    if (variants.$border !== false) return;
    // Without an edge utility the root passes the surrounding frame's edge
    // through to the tabs and the panel, which inherit it. An explicit false
    // publishes a zero edge instead, so they inherit none. The type is set
    // by hand because frame's computed default reads a zero width as none.
    setVariants({ $border: 0, $borderType: "auto" });
  },
});

// A selected folder's start curve meets the panel's start corner at the
// root's edge, so it takes the radius the root publishes while the first tab
// is the selected one. Only a selected folder draws the curve, so the rule
// needs no first-child test.
const tabStartCurve = cx(
  "before:[--ak-frame-radius:min(var(--tab-radius),var(--tabs-meet,var(--tab-radius)))]",
);

// The transparent background covers the layer the hover shifts, so a flat or
// bevel tab paints it back on its own box. The extra variant sorts this after
// the rule at rest.
const tabBoxHover = cx("not-ui-selected:ui-hover:bg-(--ak-layer)");

// A folder tab drops its bottom corners and merges into the panel below when
// selected. Unselected, it is a button in the strip, and its hover is a pill
// inside its box.
const tabFolder = cx(
  "ui-folder",
  // The curves rewrite the radius on the pseudo-elements that draw them, so
  // the tab's own radius travels under another name.
  "[--tab-radius:var(--ak-frame-radius)]",
  tabStartCurve,
  // The strip ends a tab one padding above the seam and publishes how far the
  // selected tab reaches to meet it. Only the bottom padding grows, so the
  // label keeps its place, and the margin gives the room back so the row
  // keeps its height.
  "ui-selected:pb-[calc(var(--py)+var(--tab-reach,0px))]",
  "ui-selected:-mb-(--tab-reach,0px)",
  // An unselected tab has no edge of its own, hovered or not.
  "not-ui-selected:border-transparent not-ui-selected:ring-0",
  "not-ui-selected:ui-hover:border-transparent",
  // The hover paints the layer the tab resolved as a pill --tab-inset inside
  // the tab's box, on the pseudo-element the curves leave free while the tab
  // is not selected. The pseudo-element is placed from the padding box, one
  // edge width inside the tab's box on every side but the bottom, where a
  // folder has no edge, and that width does not reach a pseudo-element, so
  // the tab derives the placement. The corners stay concentric.
  "[--tab-inset-x:calc(var(--tab-inset)-var(--ak-frame-border))]",
  "not-ui-selected:ui-hover:after:-z-1",
  "not-ui-selected:ui-hover:after:inset-(--tab-inset-x)",
  "not-ui-selected:ui-hover:after:bottom-(--tab-inset)",
  "not-ui-selected:ui-hover:after:bg-(--ak-layer)",
  "not-ui-selected:ui-hover:after:rounded-[max(0px,calc(var(--ak-frame-radius)-var(--tab-inset)))]",
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
     * an unselected tab shows the surface behind it until hovered: a flat or
     * bevel tab then paints its whole box, a folder tab a pill inside it.
     */
    $kind(value?: "flat" | "bevel" | "folder") {
      if (value == null) return;
      if (value === "folder") return tabFolder;
      if (value === "bevel") {
        return [tabBoxHover, "ui-selected:ui-bevel-button"];
      }
      return tabBoxHover;
    },
  },
  defaultVariants: {
    $kind: "folder",
    // The selected tab sits one step off the strip. The other tabs take the
    // same lift and blank it, as the classes above do, so their hover paints
    // the lifted colour one step further.
    $lightnessOffset: true,
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
        // The curves rewrite the radius on the pseudo-elements that draw
        // them, so the glider's own radius travels under another name.
        "[--tab-radius:var(--ak-frame-radius)]",
        tabStartCurve,
        // Only the selected folder glider reaches the seam. A hover or focus
        // glider covers the tab.
        "ui-selected:[--glider-reach:var(--tabs-dock)]",
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
    // replaces them for the painted covers: the glider paints the selected
    // tab's surface, which sits one step off the strip rather than the two a
    // selected glider takes, and a hovered tab paints one step past that. A
    // bar carries its colour another way, and a focus cover only draws its
    // ring, so both keep the glider's value.
    $lightnessOffset(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      if (variants.$state === "focus") return defaultValue;
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
    // A hover glider is the pill a hovered folder tab paints for itself,
    // inset from the tab's box by the strip's inset. The frame takes the
    // margin off its nested radius, so the corners stay concentric on their
    // own. A focus glider keeps the tab's box, as the tab's own focus
    // indicator does, and a selected glider covers the whole tab.
    $m(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      if (variants.$state !== "hover") return defaultValue;
      return defaultValue ?? "var(--tab-inset)";
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
    // A folder tab takes the root's edge. A strip thinner than that edge
    // would set the tab's edge beside the root's, so the strip reaches over
    // the root's edge by the difference and the tabs land on it; the margin
    // default below spends the pull. Only an edge that takes room counts: an
    // edge drawn outside the box, as a ring-* is, pulls nothing.
    "[--tabs-pull:max(0px,calc(var(--tabs-border)-var(--tabs-float)))]",
    // A hovered folder tab, and the glider covering one, paint a pill this
    // far inside the tab's box: past the pull, then a fifth of the font size.
    "[--tab-inset:calc(0.2em+var(--tabs-pull))]",
    // A tab's end curve is painted past its box. This spacer keeps the last
    // one inside the scroll clip, whether the tabs fill the strip or
    // overflow it, so it must not give way to them.
    "after:w-[calc((var(--tabs-radius)-var(--tabs-padding))*2)] after:shrink-0",
    // Trailing tabs stay reachable by pointer when the strip overflows.
    "overflow-x-auto overflow-y-clip overscroll-x-contain scrollbar-none",
    // A tab scrolled into view brings its end curve, painted one tab radius
    // past its box. The frame's own scroll padding is the strip's padding,
    // which is thinner, and sorts before this one.
    "scroll-px-[calc(var(--ak-frame-radius)-var(--tabs-float))]",
    // The panel reads this timeline to square the corner a scrolled-off tab
    // is cut at; the root scopes the name for it.
    "[scroll-timeline:--tabs-scroll_inline]",
  ],
  defaultVariants: {
    // The root's surface shows through the strip.
    $layer: "transparent",
    $cover: true,
    $p: "unset",
    $rounded: "unset",
    // The cover adds this margin to its stretch and takes it off the radius,
    // so the strip's corners stay concentric with the root's where it lands.
    $m: "calc(-1 * var(--tabs-pull))",
  },
});

export const tabPanels = cv({
  extend: [frame],
  class: [
    "relative overflow-clip",
    // The panel's top edge tucks under the strip, where the selected tab or
    // the glider covers it.
    "-mt-(--ak-frame-border)",
    // Each top corner squares while the strip's content continues past that
    // side, so a tab cut at the strip's edge meets a straight corner.
    "ui-tabs-round",
    // The start corner animates only beside a selected glider, whose travel
    // it follows. Without anchor support the glider is not shown.
    "ease-tabs",
    "supports-anchor:[.tabs:has(.glider.selected)_&]:transition-[border-radius]",
    "supports-anchor:[.tabs:has(.glider.selected)_&]:duration-(--duration-tabs)",
  ],
  variants: {
    /**
     * Whether the top corners keep the frame radius. The strip above paints
     * nothing, so they show. A strip that paints its own surface wants them
     * square. The start corner shrinks to meet the first tab's curve while
     * that tab is a selected folder, and either corner squares while the
     * strip's content continues past its side.
     */
    $roundedTop: [
      "rounded-ss-[calc(min(var(--ak-frame-radius),var(--tabs-meet,var(--ak-frame-radius)))*var(--tabs-round-s,1))]",
      "rounded-se-[calc(var(--ak-frame-radius)*var(--tabs-round-e,1))]",
    ],
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
