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
    // The strip runs under the panel's top corners, so the panel paints over
    // the strip, and the tabs and the gliders paint over the panel so that a
    // selected tab covers the seam. The root keeps that stack to itself: the
    // panel first, the hover glider second, a flat or bevel selected glider
    // third, the focus glider fourth, a folder selected glider fifth, the
    // tabs sixth, and a bar keeps the glider's own place above them all.
    "isolate",
    // The tabs, the glider and the panel all read the root's geometry. The
    // padding and the radius inherit, but every frame on the way down rewrites
    // them, and the edge widths never inherit at all.
    "[--tabs-padding:var(--ak-frame-padding)]",
    "[--tabs-radius:var(--ak-frame-radius)]",
    "[--tabs-border:var(--ak-frame-border)]",
    "[--tabs-ring:var(--ak-frame-ring)]",
    // The edge width, whichever of the two the adaptive edge picked.
    "[--tabs-bordering:calc(var(--tabs-border)+var(--tabs-ring))]",
    // The tabs and the gliders read the root's surface too, so they lift off it
    // as the panel does while the strip under them sinks below it.
    "[--tabs-layer:var(--ak-layer)]",
    // The root does not clip at its edge. The strip reaches over the edge but
    // paints its surface inside it, and a tab or panel edge that lands on the
    // root's edge draws itself there. A border covers the root's edge, since
    // it lies on its own surface. A ring is translucent and lies on nothing
    // of its own, so a ring landing on the root's ring stacks into a darker
    // line. That stays: an opaque surface under the ring would cut it off
    // from a shadow below it, the way a border is, and reading as part of
    // the shadow is what a ring is for.
    // While the first tab is a selected folder, its start curve and the panel's
    // start corner meet halfway between the root's edge and that tab. A strip
    // thinner than the edge pulls its tabs onto the edge, so the room is the
    // padding plus what the edge leaves of it. Otherwise the curve and the
    // corner keep their own radius.
    "has-[>:first-child>.ui-folder[aria-selected='true']:nth-child(1_of_.control)]:[--tabs-meet:calc((var(--tabs-padding)+min(var(--tabs-padding),var(--tabs-border)))/2)]",
    // The panel follows the strip's scroll to square the corner a scrolled-off
    // tab is cut at, and a sibling can only reach that timeline through a scope
    // on the root.
    "[timeline-scope:--tabs-scroll]",
    // Only a folder's curves meet the panel's top corners, so the notch below
    // exists only while the strip has a folder tab or a folder glider.
    "has-[.ui-folder]:[--tabs-folder:1]",
    // A ring folder's box runs three pixels past the seam, two more than the
    // edge it lands on, for the cut the folder makes there. The strip has to
    // hold those pixels, or the box hangs out of it, and the strip scrolls it
    // into view when the tab takes focus and the whole row moves up. A border
    // folder ends on its edge and needs no room.
    "[--tabs-over:calc(max(0px,calc(min(var(--tabs-ring)*1000000,3px)-var(--tabs-ring)))*var(--tabs-folder,0))]",
  ],
  variants: {
    /**
     * Paints the root's own edge in transparent while the selected tab and the
     * panel keep drawing it, for a folder with no card around it. The edge
     * keeps its width, so the seam and the corners stay where they are.
     */
    $edgeHidden: "border-transparent ring-transparent",
    /**
     * Rounds the panel's top corners under folder tabs, whose curves they meet.
     * The strip runs one radius under the panel, so its surface shows through
     * the corners, as a browser's tab strip does. The start corner shrinks to
     * meet the first tab's curve while that tab is a selected folder, either
     * corner squares while the strip's content continues past its side, and
     * under flat or bevel tabs, or a bar, both stay square. Off, the strip ends
     * at the seam and the panel keeps square top corners.
     */
    $panelRoundedTop: [
      // The notch is how far the strip runs under the panel, and the most a
      // panel corner rounds.
      "[--tabs-notch:calc(var(--tabs-radius)*var(--tabs-folder,0))]",
    ],
  },
  defaultVariants: {
    $border: true,
    $panelRoundedTop: true,
  },
  refine({ variants, setVariants }) {
    if (variants.$border !== false) return;
    // Without an edge utility the root passes the surrounding frame's edge
    // through to the tabs and the panel, which inherit it. An explicit false
    // publishes a zero edge instead, so they inherit none. The type is set by
    // hand because frame's computed default reads a zero width as none.
    setVariants({ $border: 0, $borderType: "auto" });
  },
});

// A selected folder's start curve meets the panel's start corner at the root's
// edge, so it takes the radius the root publishes while the first tab is the
// selected one. Only a selected folder draws the curve, so the rule needs no
// first-child test. The selected gate matters: the before-* variant gives the
// pseudo-element content, and one that exists on an unselected tab would carry
// the small radius over and animate it when the tab is selected.
const tabStartCurve = cx(
  "ui-selected:before:[--folder-radius:min(var(--tabs-radius),var(--tabs-meet,var(--tabs-radius)))]",
);

// The transparent background covers the layer the hover shifts, so a flat or
// bevel tab paints it back on its own box. The extra variant sorts this after
// the rule at rest. Keyboard focus paints the box in the brand layer, selected
// or not, the way a composite row marks its focused item, and the brand layer
// gives the label its colour. An unselected tab reads the strip's colour with a
// variant of its own, so the brand carries that variant too to outrank it. The
// selected tab's lift comes off while the box is brand, so the brand reads the
// same on every tab.
const tabBox = cx(
  "not-ui-selected:ui-hover:bg-(--ak-layer)",
  "ui-focus-visible:ak-layer-brand ui-focus-visible:ak-layer-contrast",
  "not-ui-selected:ui-focus-visible:ak-layer-brand",
  "ui-focus-visible:ak-layer-offset-0",
  "not-ui-selected:ui-focus-visible:bg-(--ak-layer)",
  // A selected glider wipes the box it covers. The tab paints the brand box
  // back over the cover for its focus, unless a focus glider follows and
  // paints it instead.
  "supports-anchor:not-has-[~.glider.focus]:ui-selected:ui-focus-visible:bg-(--ak-layer)!",
);

// A folder tab drops its bottom corners and merges into the panel below when
// selected. Unselected, it is a button in the strip, and its hover is a pill
// inside its box.
const tabFolder = cx(
  "ui-folder",
  // The curves take the root's radius, the one the panel's corners have, rather
  // than the smaller radius the frame nesting gives the tab.
  "[--folder-radius:var(--tabs-radius)]",
  tabStartCurve,
  // The strip merges the row with the root's edge by pulling it up by the
  // edge's width, where a border, drawn inside the tab's box, lands on the
  // edge. A ring is drawn outside the box, so a ring tab steps back down by
  // its ring to land the ring on the edge rather than past it, and a first
  // tab steps back from the start edge the same way.
  "mt-[min(var(--tabs-merge),var(--ak-frame-ring))]",
  "first:ms-[min(var(--tabs-merge),var(--ak-frame-ring))]",
  // The strip ends a tab one padding above the seam, and a selected tab reaches
  // through that padding and over the panel's edge, as far as the folder says
  // its own edge needs. Only the bottom padding grows, so the label keeps its
  // place, and the margin gives the room back so the row keeps its height. A
  // working selected glider reaches instead of the tab.
  "[--tab-reach:calc(var(--tabs-float)+var(--folder-reach,0px))]",
  "supports-anchor:has-[~.glider.selected]:[--tab-reach:0px]",
  "ui-selected:pb-[calc(var(--py)+var(--tab-reach))]",
  "ui-selected:-mb-(--tab-reach)",
  // An unselected tab has no edge of its own, hovered or not.
  "not-ui-selected:border-transparent not-ui-selected:ring-0",
  "not-ui-selected:ui-hover:border-transparent",
  // The hover and the keyboard focus paint the layer the tab resolved as a
  // pill --tab-inset inside the tab's box, on the pseudo-element the curves
  // leave free while the tab is not selected. The pseudo-element is placed
  // from the padding box, one edge width inside the tab's box on every side
  // but the bottom, where a folder has no edge, and that width does not reach
  // a pseudo-element, so the tab derives the placement. The corners stay
  // concentric. The pill is shaped at rest and painted by the state.
  "[--tab-inset-x:calc(var(--tab-inset)-var(--ak-frame-border))]",
  "not-ui-selected:after:-z-1",
  "not-ui-selected:after:inset-(--tab-inset-x)",
  "not-ui-selected:after:bottom-(--tab-inset)",
  "not-ui-selected:after:rounded-[max(0px,calc(var(--ak-frame-radius)-var(--tab-inset)))]",
  "not-ui-selected:ui-hover:after:bg-(--ak-layer)",
  "not-ui-selected:ui-focus-visible:after:bg-(--ak-layer)",
  // Keyboard focus on an unselected folder paints that pill in the brand
  // layer, the way a composite row marks its focused item, and the brand
  // layer gives the label its colour. The contrast keeps the pill apart from
  // a brand surface behind the strip.
  "not-ui-selected:ui-focus-visible:ak-layer-brand",
  "not-ui-selected:ui-focus-visible:ak-layer-contrast",
  // The selected folder marks keyboard focus on its edge instead, so the seam
  // stays and nothing crosses it. The edge takes the focus colour and grows by
  // --tab-focus-extra: to two pixels at least, and by half of itself at least,
  // so it stands out from an edge that is brand already. The extra width grows
  // inward, taken from the padding, so the box, the label and the outer
  // silhouette stay put, and a tab with less padding than that gets a thinner
  // mark rather than a bigger box. A border grows itself, a ring keeps its
  // width and gets a border inside it, and the curves widen their band by the
  // same amount through the folder, which grows them toward the box.
  "ui-selected:ui-focus-visible:[--tab-focus-extra:min(max(1px,calc(2px-var(--ak-frame-border)-var(--ak-frame-ring)),round(up,calc((var(--ak-frame-border)+var(--ak-frame-ring))/2),1px)),var(--py,0px),var(--px,0px))]",
  "ui-selected:ui-focus-visible:border-t-[calc(var(--ak-frame-border)+var(--tab-focus-extra))]",
  "ui-selected:ui-focus-visible:border-x-[calc(var(--ak-frame-border)+var(--tab-focus-extra))]",
  "ui-selected:ui-focus-visible:pt-[calc(var(--py,0px)-var(--tab-focus-extra))]",
  "ui-selected:ui-focus-visible:px-[calc(var(--px,0px)-var(--tab-focus-extra))]",
  "ui-selected:ui-focus-visible:border-(--ak-outline)",
  "ui-selected:ui-focus-visible:ring-(--ak-outline)",
  "ui-selected:ui-focus-visible:[--folder-edge:var(--ak-outline)]",
  "ui-selected:ui-focus-visible:[--folder-extra:var(--tab-focus-extra)]",
);

export const tab = cv({
  extend: [button],
  class: [
    // Sixth in the root's stack, over the panel and the gliders.
    "z-6",
    // Only the selected tab paints at rest. The others keep their layer, which
    // their hover paint reads, and show the surface behind them.
    "not-ui-selected:bg-transparent",
    // The selected tab reads the root's surface and lifts off it, below: a
    // folder with the lighten, so it turns white on a light surface, as the
    // panel does, and a flat or bevel pill with the offset. The other tabs
    // read the strip they sit on and take no lift, so their hover lifts them
    // one step off the strip.
    "not-ui-selected:ak-layer-color-(--ak-layer-parent)",
    "not-ui-selected:ak-layer-lighten-0",
    "not-ui-selected:ak-layer-offset-0",
    // The selected tab already reads as active, so hovering it must not shift
    // its layer the way a button hover does.
    "ui-selected:ui-hover:ak-state-0",
    // Each kind marks keyboard focus its own way, below, in place of the
    // button's ring: outside the box, that ring crosses the seam of a selected
    // folder and is cut by the strip's scroll clip. The browser's own ring
    // goes with it.
    "ui-focus-visible:outline-none",
  ],
  variants: {
    /**
     * Sets how the tab paints. A `flat` tab is a plain button that lifts off
     * the strip when selected, a `bevel` tab raises the selected tab with the
     * gradient and inner shadow of a push button, and a `folder` tab drops its
     * bottom corners and merges into the panel below. Whatever the kind, an
     * unselected tab shows the surface behind it until hovered: a flat or bevel
     * tab then paints its whole box, a folder tab a pill inside it.
     */
    $kind(value?: "flat" | "bevel" | "folder") {
      if (value == null) return;
      if (value === "folder") return tabFolder;
      if (value === "bevel") {
        return [tabBox, "ui-selected:ui-bevel-button"];
      }
      return tabBox;
    },
  },
  defaultVariants: {
    $kind: "folder",
    // The tab lifts off the root's surface rather than the strip's, so its
    // selected fill matches the panel, which lifts the same way off the same
    // surface.
    $layer: "var(--tabs-layer)",
    // The lift the selected tab takes; the classes above keep it off the other
    // tabs. A folder lightens one step, as the panel it merges into does. A
    // flat or bevel pill takes an offset of one and a half instead, the
    // separation a raised pill gets on either theme, and stays ahead of a
    // hovered neighbour's one step.
    $lightnessOffset(_defaultValue, variants) {
      if (variants.$kind === "folder") return false;
      return 1.5;
    },
    $lighten(defaultValue, variants) {
      if (variants.$kind === "folder") return defaultValue ?? true;
      return false;
    },
    // The radius comes from the frame nesting, concentric with the strip.
    $rounded: "unset",
    // The kinds mark keyboard focus themselves, so the button's ring stays off.
    // Its colour stays on: the selected folder's edge takes it.
    $focus: false,
    $focusColor: "brand",
    // A folder tab takes the root's edge, so the selected one merges with the
    // panel. The other kinds have none, like the button they are.
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
     * Adds `folder` to the glider's `flat`, `bevel` and `bar`: the glider takes
     * the shape of a selected folder tab, curves included, and reaches down to
     * the panel. A `bar` also gives the tab it marks its hover back.
     */
    $kind: {
      // A bar underlines the selected tab, which keeps its own fill: the wipe
      // the glider's selected state gives a covered tab has nothing to make
      // room for under a rule, and that fill is where keyboard focus paints.
      bar: ["supports-anchor:[.control:has(~&)]:ui-selected:bg-(--ak-layer)!"],
      folder: [
        "ui-folder",
        gliderCover,
        // The curves take the root's radius, as the tab's do.
        "[--folder-radius:var(--tabs-radius)]",
        tabStartCurve,
        // Only the selected folder glider reaches over the seam, as far as the
        // tab would. A hover or focus glider covers the tab.
        "ui-selected:[--glider-reach:calc(var(--tabs-float)+var(--folder-reach,0px))]",
        // A selected folder glider sits above the focus glider, unlike a flat
        // or bevel cover, so the focus pill slides under it while the edge
        // below marks the focus. Fifth in the root's stack.
        "ui-selected:z-5",
        // The edge turns to the focus colour at once, as the tab's own does
        // and as the curves do, so the glider's colour transition comes off
        // its list.
        "ui-selected:transition-[inset-inline,height,width,outline,display]",
        // A selected folder glider marks keyboard focus on the tab it covers
        // as the tab marks it on itself: the edge takes the focus colour and
        // grows inward by the same extra width. The glider is sized from the
        // tab's box and has no padding to give back, so only its edge moves,
        // and the tab's own mark paints in the same place over it. The colour
        // is the one the tab's focus reads, from the same utilities.
        "ak-outline ak-outline-brand",
        "ui-selected:[.control[aria-selected='true']:is(:focus-visible,[data-focus-visible])~&]:[--tab-focus-extra:max(1px,calc(2px-var(--ak-frame-border)-var(--ak-frame-ring)),round(up,calc((var(--ak-frame-border)+var(--ak-frame-ring))/2),1px))]",
        "ui-selected:[.control[aria-selected='true']:is(:focus-visible,[data-focus-visible])~&]:border-t-[calc(var(--ak-frame-border)+var(--tab-focus-extra))]",
        "ui-selected:[.control[aria-selected='true']:is(:focus-visible,[data-focus-visible])~&]:border-x-[calc(var(--ak-frame-border)+var(--tab-focus-extra))]",
        "ui-selected:[.control[aria-selected='true']:is(:focus-visible,[data-focus-visible])~&]:border-(--ak-outline)",
        "ui-selected:[.control[aria-selected='true']:is(:focus-visible,[data-focus-visible])~&]:ring-(--ak-outline)",
        "ui-selected:[.control[aria-selected='true']:is(:focus-visible,[data-focus-visible])~&]:[--folder-edge:var(--ak-outline)]",
        "ui-selected:[.control[aria-selected='true']:is(:focus-visible,[data-focus-visible])~&]:[--folder-extra:var(--tab-focus-extra)]",
      ],
    },
    $state: {
      // The glider's own selected state clears the covered tab's edge as a
      // border-*, and the edge a tab inherits may be a ring-* instead.
      selected: [
        "supports-anchor:[.control:has(~&)]:ui-selected:ring-transparent",
        // Third in the root's stack, over the panel and the hover glider and
        // under the focus glider, which covers a flat or bevel cover as it
        // covers the tab. A folder cover goes above the focus glider, and a
        // bar keeps the glider's own place on top. Each state sets its own
        // place because the glider's classes sort by value, not by state.
        "z-3",
      ],
      focus: [
        "z-4",
        // A focus glider is the brand pill of the tab it covers rather than the
        // ring the glider draws elsewhere: it paints the fill, and the covered
        // tab, which keeps the brand layer for its label, paints no pill or box
        // of its own. A folder's pill is a pseudo-element placed on its own; a
        // flat tab has none, and giving it one would add a flex gap to the
        // box. With no tab in focus there is no anchor, so the glider leaves
        // rather than fall to the group's start.
        "outline-none",
        // Focus moves between tabs through a moment with no tab focused, and
        // a glider that left the page then could not travel. So the pill is
        // anchored to the active tab as well, which passes from one tab to
        // the next in one step, and it stays in the page, unseen rather than
        // taken out, while no tab has keyboard focus. Its box stays on the
        // active tab, so it travels when focus moves, appears in place when
        // focus enters the strip, and goes at once when focus leaves.
        "[.control[data-active-item]:has(~&)]:[--glider-focus:--glider-focus]",
        "not-peer-ui-focus-visible:invisible",
        // The glider's travel stays on the list and its leaving comes off it:
        // a hover glider waits to leave so the pointer can cross a gap, but
        // focus leaves the strip in one move, and the pill goes with it.
        "supports-anchor:transition-[inset-inline,height,width]",
        "supports-anchor:[.control.ui-folder:has(~&)]:not-ui-selected:ui-focus-visible:after:bg-transparent!",
        "supports-anchor:[.control:not(.ui-folder):has(~&)]:ui-focus-visible:bg-transparent!",
        // The label's colour follows the glider on its way, rather than turn
        // before it arrives. This list replaces the tab's own, so the press
        // rides on it at its own duration (see $transition in active.ts).
        "supports-anchor:[.control:has(~&)]:transition-[color,var(--active-transition)]",
        "supports-anchor:[.control:has(~&)]:duration-[var(--duration-tabs),var(--active-duration)]",
        "supports-anchor:[.control:has(~&)]:ease-tabs",
        // A selected folder, or the folder cover standing in for it, sits
        // above the glider, so the pill slides under it and the edge marks
        // the focus. A flat or bevel cover sits below, so the pill covers it.
      ],
      hover: "z-2",
    },
  },
  defaultVariants: {
    $kind: "folder",
    // A selected cover stands in for the tab, so it lifts off the surface the
    // selected tab reads, the root's. A hover cover lifts off the strip, as a
    // hovered tab does, a focus cover is the brand pill a focused tab paints,
    // and a bar carries its colour off the strip, so those keep the glider's
    // layer.
    $layer(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      if (variants.$state === "hover") return defaultValue;
      if (variants.$state === "focus") return "brand";
      return "var(--tabs-layer)";
    },
    // The glider's own lifts arrive as the default value, and the tab scheme
    // replaces them for the painted covers: a selected cover lifts as the tab
    // it stands in for does, a folder with the lighten below and a flat or
    // bevel pill with an offset of one and a half, a hovered tab lifts one step
    // off the strip, and a focused tab paints the brand layer with no lift. A
    // bar carries its colour another way, so it keeps the glider's values.
    $lightnessOffset(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      if (variants.$state === "hover") return true;
      if (variants.$state !== "selected") return false;
      if (variants.$kind === "folder") return false;
      return 1.5;
    },
    // The focused tab's pill keeps its contrast with a brand surface behind the
    // strip, and so does the cover that stands in for it.
    $contrast(defaultValue, variants) {
      if (variants.$state !== "focus") return defaultValue;
      return defaultValue ?? true;
    },
    // A selected cover lifts as the tab it stands in for does: a folder
    // lightens one step, with the panel, and a flat or bevel pill takes the
    // offset above instead.
    $lighten(defaultValue, variants) {
      if (variants.$kind === "bar") return defaultValue;
      if (variants.$state !== "selected") return defaultValue;
      if (variants.$kind === "folder") return defaultValue ?? true;
      return false;
    },
    // A selected folder glider takes the root's edge, as the tab does, and
    // frame leaves the edge variants unset for it. The other kinds keep the
    // glider's own ring, and a hover or focus glider has no edge to show.
    $border(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      if (variants.$state !== "selected") return defaultValue;
      return defaultValue ?? "inherit";
    },
    // A hover or focus glider is the pill a hovered or focused folder tab
    // paints for itself, inset from the tab's box by the strip's inset. The
    // frame takes the margin off its nested radius, so the corners stay
    // concentric on their own. A selected glider covers the whole tab.
    $m(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      if (variants.$state === "selected") return defaultValue;
      if (variants.$state === "none") return defaultValue;
      return defaultValue ?? "var(--tab-inset)";
    },
  },
});

export const tabList = cv({
  extend: [buttonGroup],
  class: [
    // The strip ends flat where the panel begins.
    "rounded-b-none!",
    // The panel's edge tucks into the strip by its width, border or ring, so
    // the strip pads that much more below the tabs, and the row keeps one
    // padding above the seam as it keeps one below the root's edge. The width
    // is the root's, and so is the edge the tab and the panel inherit, but each
    // of them picks border or ring for itself, so the strip leaves the reach
    // over the seam to the folder.
    "[--tabs-float:var(--ak-frame-padding)]",
    "[--tabs-dock:calc(var(--tabs-float)+var(--tabs-bordering))]",
    // Below the seam the strip runs on under the panel by the notch, so its
    // surface shows through the panel's rounded corners, and by the pixels a
    // ring folder's box runs past the seam.
    "pb-[calc(var(--tabs-dock)+var(--tabs-notch,0px)+var(--tabs-over,0px))]",
    // The panel paints over the strip, so the strip cannot open the stacking
    // context a glider group does, or its tabs could not paint over the panel.
    // The root opens one for all of them instead.
    "z-auto",
    // A folder tab takes the root's edge. A strip thinner than that edge would
    // set the tab's edge beside the root's, so the strip merges the row with
    // the root's edge: it pulls the row up by the difference and the tabs land
    // on the edge. Only a folder merges; a flat or bevel strip keeps its tabs
    // inside the edge. Of that pull, the frame margin below spends only the
    // part an edge that takes room asks for, a border rather than a ring, so
    // the radius nested in the strip stays concentric and the seam below keeps
    // its place.
    "[--tabs-merge:calc(max(0px,calc(var(--tabs-bordering)-var(--tabs-float)))*var(--tabs-folder,0))]",
    "[--tabs-pull:calc(max(0px,calc(var(--tabs-border)-var(--tabs-float)))*var(--tabs-folder,0))]",
    // The strip's box reaches over the root's whole edge, ring included, so
    // that the scroll clip below never cuts a tab edge that lands on it, and
    // pads the row back to where the merge puts it. The box ends on the root's
    // outermost curve, so the clip follows that curve and spares the corner of
    // a tab that takes it.
    "-mt-[calc(var(--tabs-padding)+var(--tabs-bordering))]",
    "-mx-[calc(var(--tabs-padding)+var(--tabs-bordering))]",
    "pt-[calc(var(--tabs-bordering)+var(--tabs-float)-var(--tabs-merge))]",
    "px-[calc(var(--tabs-bordering)+var(--tabs-float)-var(--tabs-merge))]",
    "rounded-ss-[calc(var(--tabs-radius)+var(--tabs-ring))]!",
    "rounded-se-[calc(var(--tabs-radius)+var(--tabs-ring))]!",
    // The box reaches over the root's edge, so the strip paints its surface
    // inside the edge instead of over its whole box, cornered like the root's
    // inner corners.
    "ui-tabs-well",
    // A hovered folder tab, and the glider covering one, paint a pill this far
    // inside the tab's box: past the merge, then a fifth of the font size.
    "[--tab-inset:calc(0.2em+var(--tabs-merge))]",
    // A tab's end curve is painted one root radius past its box. This spacer
    // keeps the last one inside the scroll clip, whether the tabs fill the
    // strip or overflow it, so it must not give way to them.
    "after:w-(--tabs-radius) after:shrink-0",
    // Trailing tabs stay reachable by pointer when the strip overflows.
    "overflow-x-auto overflow-y-clip overscroll-x-contain scrollbar-none",
    // A tab scrolled into view brings its end curve, painted one root radius
    // past its box. The frame's own scroll padding is the strip's padding,
    // which is thinner, and sorts before this one.
    "scroll-px-(--tabs-radius)",
    // The panel reads this timeline to square the corner a scrolled-off tab is
    // cut at; the root scopes the name for it.
    "[scroll-timeline:--tabs-scroll_inline]",
  ],
  defaultVariants: {
    // The strip paints the root's surface half a step darker, a well the tabs
    // sit in. The selected tab and the panel lift off the root itself, so the
    // two stand out of the well together.
    $layer: true,
    $darken: 0.5,
    $cover: true,
    $p: "unset",
    $rounded: "unset",
    // The cover adds this margin to its stretch and takes it off the radius, so
    // the radius nested in the strip stays concentric with the root's where the
    // row lands. The classes above move the box itself further.
    $m: "calc(-1 * var(--tabs-pull))",
  },
});

export const tabPanels = cv({
  extend: [frame],
  class: [
    // First in the root's stack, over the strip's surface and under the tabs.
    "relative z-1 overflow-clip",
    // The panel's top edge, border or ring, tucks under the strip by its width,
    // where the selected tab or the glider covers it, and the panel runs up
    // over the notch the strip leaves under its top corners and over the
    // pixels the strip keeps for a ring folder's box.
    "-mt-[calc(var(--tabs-notch,0px)+var(--tabs-bordering)+var(--tabs-over,0px))]",
    // The top corners round by the notch the root publishes, which is none
    // under flat or bevel tabs or a bar, or with the root's $panelRoundedTop
    // off. The start corner shrinks to meet the first tab's curve while that
    // tab is a selected folder.
    "rounded-ss-[calc(min(var(--tabs-notch,0px),var(--tabs-meet,var(--tabs-notch,0px)))*var(--tabs-round-s,1))]",
    "rounded-se-[calc(var(--tabs-notch,0px)*var(--tabs-round-e,1))]",
    // Each top corner squares while the strip's content continues past that
    // side, so a tab cut at the strip's edge meets a straight corner.
    "ui-tabs-round",
    // The start corner animates only beside a selected glider, whose travel it
    // follows. Without anchor support the glider is not shown.
    "ease-tabs",
    "supports-anchor:[.tabs:has(.glider.selected)_&]:transition-[border-radius]",
    "supports-anchor:[.tabs:has(.glider.selected)_&]:duration-(--duration-tabs)",
  ],
  defaultVariants: {
    // The panel lifts as the selected tab does, so the two read as one sheet.
    $lighten: true,
    $p: 3,
    $cover: true,
    // The edge is the root's, as on the tab.
    $border: "inherit",
  },
});
