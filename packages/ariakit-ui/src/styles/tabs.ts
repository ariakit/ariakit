import { cv, cx } from "clava";
import { getPaddingValue } from "../utils/styles.ts";
import {
  button,
  buttonBar,
  buttonGroup,
  buttonLabel,
  buttonSeparator,
  buttonSlot,
} from "./button.ts";
import {
  carousel,
  carouselNoFadeClass,
  carouselStepClasses,
} from "./carousel.ts";
import { frame } from "./frame.ts";
import { gliderFollower } from "./glider.ts";
import { hover } from "./hover.ts";
import { hasLayerBackground } from "./layer.ts";
import {
  isSegmentedKind,
  segmentGroupClass,
  segmentKindClasses,
} from "./segment.ts";
import { hasSelectedSurface, selectedHoverClass } from "./selected.ts";

interface TabsEdgeVariants {
  $edgeWeight?: unknown;
}

// The space that a full panel corner and a full folder curve need side by side.
const TABS_FULL_MEET = "(var(--tabs-notch,0px) + var(--tabs-radius))";

// Fits that space between the outer root edge and the first folder. The folder
// also sits past the root edge, by at most the indent, so the indent leaves
// that edge out. A root edge wider than the indent pulls the folder onto it, so
// the folder sits twice the indent away, and half of the space is enough.
const TABS_AUTO_INDENT = `max(${TABS_FULL_MEET} - var(--tabs-bordering), ${TABS_FULL_MEET} / 2)`;

/** Whether the tabs root edge is hidden at rest by its weight. */
function hidesTabsEdge(variants: TabsEdgeVariants) {
  if (variants.$edgeWeight === "adaptive") return true;
  if (variants.$edgeWeight === 0) return true;
  return false;
}

/**
 * A tab container that shares its surface, edges, and geometry with the tab
 * strip and panels.
 */
export const tabs = cv({
  extend: [frame],
  class: [
    // The panels follow a glider in the strip, so they are in its scope.
    "tabs glider-scope",
    // The padding of the strip and the panels follows the text size.
    "ui-spacing-em",
    // Keep one stack for the strip, panel (1), and tabs (6), so selected tabs
    // cover the panel seam.
    "isolate",
    // Let the root shrink in flex and grid layouts so overflowing tabs can
    // scroll.
    "min-w-0",
    // Without padding, a root edge drawn as a ring leaves nothing between the
    // root and the strip or panels. In block flow, their negative margins
    // would then collapse through the root and move the root instead.
    "ui-base:flow-root",
    // Copy root geometry before descendant frames replace it; edge widths do
    // not inherit.
    "[--tabs-padding:var(--ak-frame-padding)]",
    "[--tabs-radius:var(--ak-frame-radius)]",
    "[--tabs-border:var(--ak-frame-border)]",
    "[--tabs-ring:var(--ak-frame-ring)]",
    "[--tabs-bordering:calc(var(--tabs-border)+var(--tabs-ring))]",
    // The root layer is the strip color, so the strip inherits it and the
    // panel draws its border over it. Selected tabs and the panel lighten from
    // the layer around the root instead.
    "[--tabs-layer:var(--ak-layer-parent)]",
    // The darkened layer would paint the strip color under the root's own
    // edge. The strip paints it inside the edge.
    "bg-transparent!",
    // The space where a selected outer folder meets the panel. Without
    // $indent, it follows the root padding.
    "[--tabs-indent:var(--tabs-padding)]",
    // Nested tabs set their own values instead of inheriting them.
    "[--tabs-meet:initial] [--tabs-meet-end:initial] [--tabs-folder:initial]",
    // A selected first folder shares the available indent and edge with the
    // panel corner, which takes up to half. The panel border covers a root
    // ring too.
    // The strip is a child of the root, or of tabListCarousel in the root. In a
    // tabRow, the strip counts only when no control sits before it, because a
    // first folder beside a control is not at the corner of the root.
    "has-[>.tabs-strip>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-child(1_of_.control),>*>.tabs-strip:nth-child(1_of_:not(.carousel-button-area))>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-child(1_of_.control)]:[--tabs-meet:calc((var(--tabs-indent)+min(var(--tabs-indent),var(--tabs-bordering)))/2)]",
    // A stretched strip has no room after its last tab, so a selected last
    // folder meets the panel in the same way at the end, unless a control of a
    // tabRow sits after the strip.
    "has-[>.tabs-strip.tabs-stretch>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-last-child(1_of_.control),>*>.tabs-strip.tabs-stretch:nth-last-child(1_of_:not(.carousel-button-area))>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-last-child(1_of_.control)]:[--tabs-meet-end:calc((var(--tabs-indent)+min(var(--tabs-indent),var(--tabs-bordering)))/2)]",
    // Scope the scroll timeline so the sibling panel can follow it.
    "[timeline-scope:--tabs-scroll]",
    // Only the tabs of this root's own strip count, not those of nested tabs.
    "has-[>.tabs-strip>.ui-folder,>*>.tabs-strip>.ui-folder]:[--tabs-folder:1]",
  ],
  variants: {
    /**
     * Shows the root edge around the strip and panels. With `false`, only the
     * selected folder and the panels draw the edge. The root keeps the edge
     * width, so seams and corners stay aligned. Pair it with `$darken={false}`
     * so that the strip also takes the color around the root. Defaults to
     * `true`.
     */
    $outerEdge: {
      false: [
        "border-transparent ring-transparent",
        // Forced colors draw a transparent border in the text color, but keep
        // the system color of the page.
        "forced-colors:border-[Canvas]",
      ],
    },
    /**
     * Sets how the curve of a selected outer folder fits beside the panel
     * corner. `cut` keeps the full curve and cuts it at the root edge, as if
     * the root clipped its overflow. The panel corner then stays square until
     * the full curve fits, and rounds with the space left after it. `adapt`
     * shrinks the curve and the corner together so that both fit the indent.
     * Defaults to `cut`, or to `adapt` with `$outerEdge={false}`. An explicit
     * `cut` there still draws the edge along the cut.
     */
    $folderCurve: {
      adapt: "",
      // The strip tabs and panels of this root read the marker.
      cut: "tabs-folder-cut",
    },
    /**
     * Rounds panel corners under folder tabs. The first selected folder reduces
     * the start corner, and the last selected folder of a stretched strip
     * reduces the end corner. A strip that fades keeps the corners round while
     * it scrolls. The reduced start corner opens as the first folder fades out,
     * and the end corner squares while a selected last folder leaves the end,
     * until the fade hides it. Without the fade, scrolling squares each clipped
     * side. Other tab kinds and `false` keep square corners.
     */
    $panelRoundedTop: {
      true: "[--tabs-notch:calc(var(--tabs-radius)*var(--tabs-folder,0))]",
      // An explicit zero keeps nested tabs from inheriting the outer notch.
      false: "[--tabs-notch:0px]",
    },
    /**
     * Sets the space between the root edge and the strip ends, where a selected
     * outer folder meets the panel. Unlike `$p`, it keeps the space above the
     * tabs and their radius. Without it, the strip ends use the strip padding
     * and the panel corners use the root padding. `auto` makes this space and
     * the root edge together as wide as the panel corner radius plus the folder
     * curve radius, so both stay full beside a selected outer folder. Like
     * other values, it takes the place of the padding there instead of adding
     * to it. It has no effect on tabs without folders. `none` removes the
     * space. Numbers multiply the spacing token and round to a whole pixel.
     */
    $indent(value?: "none" | "auto" | (string & {}) | number) {
      if (value == null) return;
      if (value === "auto") {
        // With this marker, the strip uses the value only beside folders, which
        // have the curves that it makes room for.
        return {
          class: "tabs-indent-auto",
          style: { "--tabs-indent": TABS_AUTO_INDENT },
        };
      }
      // The marker lets the strip use this value in place of its own padding.
      return {
        class: "tabs-indent",
        style: {
          "--tabs-indent": getPaddingValue(value === "none" ? 0 : value),
        },
      };
    },
  },
  defaultVariants: {
    $rounded: "xl",
    $p: "none",
    $border: true,
    // Not transparent like other frames, so an explicit transparent layer can
    // opt out of the strip color below.
    $layer: true,
    // Darken the strip half a step so tabs and panels stand out together. A
    // transparent root keeps the layer around it, for tabs whose strip darkens
    // itself, or that have none. An extender's default stays.
    $darken(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$layer === "transparent") return;
      return 0.5;
    },
    // That darkening would swap the adaptive edge to a border on light surfaces
    // and a ring on dark ones.
    $borderType(defaultValue) {
      if (defaultValue === "auto") return "appearance";
      return defaultValue;
    },
    $outerEdge: true,
    // The root edge shows the line that cuts a curve. Without it, nothing
    // explains the cut, so the curve shrinks to fit instead. An extender's
    // default stays.
    $folderCurve(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$outerEdge === false) return "adapt";
      return "cut";
    },
    $panelRoundedTop: true,
  },
  refine({ variants, setVariants, addClass }) {
    if (hidesTabsEdge(variants)) {
      // The panel and folders paint another surface under their borders, where
      // the strip color would show as a line around the hidden edge.
      addClass("tabs-edge-hidden-at-rest");
    }
    if (variants.$border !== false) return;
    // An explicit false must publish zero edge width instead of inheriting the
    // parent frame edge. Set the type because frame treats zero as no border,
    // and a zero-width ring can paint corner arcs in Firefox.
    setVariants({ $border: 0, $borderType: "border" });
  },
});

// Where a selected folder meets the panel corner, its side curve takes the
// space that the corner leaves, so a square corner leaves all of it.
const tabCurves = cx(
  "ui-selected:before:[--folder-radius:min(var(--tabs-radius),calc(2*var(--tabs-meet,var(--tabs-radius))-min(var(--tabs-notch,0px),var(--tabs-meet,var(--tabs-radius)))))]",
  "ui-selected:after:[--folder-radius:min(var(--tabs-radius),calc(2*var(--tabs-meet-end,var(--tabs-radius))-min(var(--tabs-notch,0px),var(--tabs-meet-end,var(--tabs-radius)))))]",
);

// A cut curve keeps the full radius and drops the part past the outer side of
// the root edge, where the curve paints the edge across the cut. A selected
// outer folder starts twice the meet from that side, and its border is as wide
// as the root edge, so the curve passes the side by the radius less both. A
// folder on that side, with no meet, has no room past its own border, so it has
// no curve, like an adapted one. The box of a glider in the strip paints the
// selected folder, so it takes the same curve.
const tabCutCurves = cx(
  "[.tabs-folder-cut>.tabs-strip>&,.tabs-folder-cut>*>.tabs-strip>&,.tabs-folder-cut>.tabs-strip_&.glider-box,.tabs-folder-cut>*>.tabs-strip_&.glider-box]:ui-selected:before:[--folder-radius:min(var(--tabs-radius),var(--tabs-meet,var(--tabs-radius))*1000000)]",
  "[.tabs-folder-cut>.tabs-strip>&,.tabs-folder-cut>*>.tabs-strip>&,.tabs-folder-cut>.tabs-strip_&.glider-box,.tabs-folder-cut>*>.tabs-strip_&.glider-box]:ui-selected:after:[--folder-radius:min(var(--tabs-radius),var(--tabs-meet-end,var(--tabs-radius))*1000000)]",
  "[.tabs-folder-cut>.tabs-strip>&,.tabs-folder-cut>*>.tabs-strip>&,.tabs-folder-cut>.tabs-strip_&.glider-box,.tabs-folder-cut>*>.tabs-strip_&.glider-box]:ui-selected:before:[--folder-cut:calc(var(--tabs-radius)-2*var(--tabs-meet,var(--tabs-radius))-var(--tabs-bordering))]",
  "[.tabs-folder-cut>.tabs-strip>&,.tabs-folder-cut>*>.tabs-strip>&,.tabs-folder-cut>.tabs-strip_&.glider-box,.tabs-folder-cut>*>.tabs-strip_&.glider-box]:ui-selected:after:[--folder-cut:calc(var(--tabs-radius)-2*var(--tabs-meet-end,var(--tabs-radius))-var(--tabs-bordering))]",
);

// Forced colors remove the fill, the only mark of a selected folder under a
// root with no edge, so the selected folder keeps an edge there. A root with an
// edge keeps its own width.
// https://github.com/ariakit/ariakit/issues/7519
const tabSelectedEdge = cx(
  "ui-selected:forced-colors:ak-frame-border-[length:max(1px,var(--border-width,1px))]",
);

// Restore each tab's layer on hover. Focus uses the brand layer with matching
// specificity and removes the selected lift.
const tabBox = cx(
  "not-ui-selected:ui-hover:bg-(--ak-layer)",
  "ui-focus-visible:ak-layer-brand ui-focus-visible:ak-layer-contrast",
  "not-ui-selected:ui-focus-visible:ak-layer-brand",
  "ui-focus-visible:ak-layer-offset-0",
  // The selected lift is a state offset or push, which the idle offset reset
  // above leaves. A lifted focus fill can fall under 3:1 against the strip.
  // The hover rule that keeps the selected offset needs its own reset.
  // https://github.com/ariakit/ariakit/issues/8101
  "ui-selected:ui-focus-visible:ak-state-0",
  "ui-selected:ui-focus-visible:ui-hover:ak-state-0",
  "ui-selected:ui-focus-visible:ak-state-push-0",
  // The hover offset is also a state offset, which can move the focus fill of
  // an unselected tab under 3:1 against the strip.
  // https://github.com/ariakit/ariakit/issues/8111
  "not-ui-selected:ui-focus-visible:ui-hover:ak-state-0",
  "not-ui-selected:ui-focus-visible:bg-(--ak-layer)",
);

// The layer around the root, which selected folders and panels take by default.
const TABS_LAYER = "var(--tabs-layer)";

/**
 * Checks whether a selected folder or a panel keeps the layer around the tabs,
 * or the layer of its parent with `true` or `transparent`, which it lightens by
 * default. A color of its own, such as `brand`, or another modifier, such as
 * `$darken`, replaces the lighten.
 */
function keepsTabsLayer(variants: Parameters<typeof hasLayerBackground>[0]) {
  const { $layer } = variants;
  const parentLayer =
    $layer === TABS_LAYER || $layer === true || $layer === "transparent";
  if (!parentLayer) return false;
  // With a transparent layer, only a modifier paints. The lighten is left out,
  // as it holds the default of the recipe that this extends.
  const others = { ...variants, $layer: "transparent", $lighten: false };
  return !hasLayerBackground(others);
}

// The root edge color, and its width for an explicit $borderType and forced
// colors.
const tabsBorder = cx(
  "ak-edge-inherit",
  "[--border-width:var(--tabs-bordering)]",
);

// A folder border with the root edge width. On a root ring, it covers the ring
// instead of adding a second translucent edge. Like the panel, it paints the
// strip color beneath itself, so both draw the edge as over the strip on all
// sides, which differs from the root ring over the page. Under an edge hidden
// at rest, the folder paints its own surface there instead, so it leaves no
// line on the hidden ring, and its curves still cover the straight borders.
const tabsInheritedBorder = cx(
  "ak-frame-bordering-inherit ak-frame-backdrop",
  "[.tabs-edge-hidden-at-rest>.tabs-strip>&,.tabs-edge-hidden-at-rest>*>.tabs-strip>&]:ak-frame-backdrop-(--ak-layer)",
);

interface TabsBorderVariants {
  $border?: unknown;
  $borderType?: unknown;
}

/**
 * Whether a folder tab or panel draws the root edge as its border. An explicit
 * width or border type draws its own border instead.
 */
function inheritsTabsBorder(variants: TabsBorderVariants) {
  if (variants.$border != null) return false;
  if (variants.$borderType != null) return false;
  return true;
}

// Selected folders join the panel; unselected folders use an inset hover
// surface.
const tabFolder = cx(
  "ui-folder",
  // The box of a glider paints the selected folder, wherever it is. It takes
  // the meet from its own place, so its curves change while it travels. Beside
  // a control of a tab row, that place holds the control, so the box keeps its
  // full curve there.
  "[&.glider-box]:[--tabs-meet:calc(var(--glider-start)/2)]",
  "[.tabs-stretch_&.glider-box]:[--tabs-meet-end:calc(var(--glider-end)/2)]",
  tabsBorder,
  tabCurves,
  tabCutCurves,
  // Extend selected folders over the panel seam. Extra bottom padding and a
  // negative margin preserve label position and row height.
  "[--tab-reach:calc(var(--tabs-float)+var(--folder-reach,0px))]",
  "ui-selected:pb-[calc(var(--py)+var(--tab-reach))]",
  "ui-selected:-mb-(--tab-reach)",
  "not-ui-selected:border-transparent",
  "not-ui-selected:ui-hover:border-transparent",
  tabSelectedEdge,
  // Inset the unselected hover and focus surface from the padding box,
  // accounting for border width and concentric corners.
  "[--tab-inset-x:calc(var(--tab-inset)-var(--ak-frame-border))]",
  "not-ui-selected:after:-z-1",
  "not-ui-selected:after:inset-(--tab-inset-x)",
  "not-ui-selected:after:bottom-(--tab-inset)",
  "not-ui-selected:after:rounded-[max(0px,calc(var(--ak-frame-radius)-var(--tab-inset)))]",
  "not-ui-selected:ui-hover:after:bg-(--ak-layer)",
  "not-ui-selected:ui-focus-visible:after:bg-(--ak-layer)",
  // Use brand contrast so the focus surface remains distinct on a
  // brand-colored strip.
  "not-ui-selected:ui-focus-visible:ak-layer-brand",
  "not-ui-selected:ui-focus-visible:ak-layer-contrast",
  // Thicken the selected focus edge inward to at least 2px or 1.5 times its
  // resting width. Limit growth to available padding so layout stays fixed;
  // folder curves use the same extra width.
  "ui-selected:ui-focus-visible:[--tab-focus-extra:min(max(1px,calc(2px-var(--ak-frame-border)),round(up,calc(var(--ak-frame-border)/2),1px)),var(--py,0px),var(--px,0px))]",
  "ui-selected:ui-focus-visible:border-t-[calc(var(--ak-frame-border)+var(--tab-focus-extra))]",
  "ui-selected:ui-focus-visible:border-x-[calc(var(--ak-frame-border)+var(--tab-focus-extra))]",
  "ui-selected:ui-focus-visible:pt-[calc(var(--py,0px)-var(--tab-focus-extra))]",
  "ui-selected:ui-focus-visible:px-[calc(var(--px,0px)-var(--tab-focus-extra))]",
  "ui-selected:ui-focus-visible:border-(--ak-outline)",
  "ui-selected:ui-focus-visible:[--folder-edge:var(--ak-outline)]",
  "ui-selected:ui-focus-visible:[--folder-extra:var(--tab-focus-extra)]",
);

// A tab that was added to a tab list grows in from no width, and a tab that
// closes shrinks to no width before it's removed. The `Tab` style component
// sets data-enter and data-leave for the time of each transition. The names are
// those of Ariakit disclosure content, but data-enter doesn't stay here: a tab
// only has it while it grows in after its tab list mounted, so tabs don't
// animate when the page loads. Like disclosure content, the width only animates
// where the browser can interpolate to a keyword, and reduced motion turns it
// off.
const tabMotion = cx(
  "[[data-enter],[data-leave]]:[interpolate-size:allow-keywords]",
  // This list replaces the press transition for that time.
  "[[data-enter],[data-leave]]:transition-[width,min-width,flex-grow,padding,margin,border-width,opacity]",
  "[[data-enter],[data-leave]]:duration-0",
  "motion-safe:supports-[interpolate-size:allow-keywords]:[[data-enter],[data-leave]]:duration-200",
  "[[data-enter],[data-leave]]:ease-out",
  // The tab doesn't clip, so a selected folder keeps its curves. Its parts
  // shrink with it and clip their own content instead.
  "[&:is([data-enter],[data-leave]):not(:has(>.tab-remove))]:min-w-0",
  // A tab that can close has a minimum width, so a press on a short tab
  // doesn't land on the close mark by accident. That width enters and leaves
  // with the tab.
  // Zero specificity lets a min-width class on the tab win, and the tabs of a
  // stretched strip still shrink to fit it.
  "[:where(&:has(>.tab-remove))]:min-w-[8em]",
  "[&:has(>.tab-remove)]:data-enter:starting:min-w-0",
  "[&:has(>.tab-remove)]:data-leave:min-w-0",
  "[&:is([data-enter],[data-leave])>*]:min-w-0",
  "[&:is([data-enter],[data-leave])>*]:shrink",
  "[&:is([data-enter],[data-leave])>*]:overflow-clip",
  "[&:is([data-enter],[data-leave])>*]:whitespace-nowrap",
  // The size that a tab enters from and leaves to. It also gives back the gap
  // of its list, so the tabs after it don't jump when it's removed.
  "data-enter:starting:w-0 data-leave:w-0",
  "data-enter:starting:grow-0! data-leave:grow-0!",
  "data-enter:starting:px-0! data-leave:px-0!",
  "data-enter:starting:border-x-0! data-leave:border-x-0!",
  "data-enter:starting:-me-(--group-gap,0px) data-leave:-me-(--group-gap,0px)",
  "data-enter:starting:opacity-0 data-leave:opacity-0",
  "data-leave:pointer-events-none",
);

/** A tab with flat, bevel, or folder styling and keyboard focus feedback. */
export const tab = cv({
  extend: [button],
  class: [
    "z-6",
    tabMotion,
    // Only selected tabs paint at rest; retain other layers for hover.
    "not-ui-selected:bg-transparent",
    // Unselected tabs use the strip surface without a lift. Selected tabs use
    // the root surface to match the panel.
    "not-ui-selected:ak-layer-color-(--ak-layer-parent)",
    "not-ui-selected:ak-layer-lighten-0",
    "not-ui-selected:ak-layer-offset-0",
  ],
  variants: {
    /**
     * Sets the selected tab shape: `flat` lifts the surface, `bevel` adds
     * depth, and `folder` joins the panel. Unselected folder tabs use an inset
     * hover surface; other kinds fill the box. The segmented kinds go inside a
     * segmented `TabList`.
     */
    $kind(
      value?: "flat" | "bevel" | "folder" | "segmented" | "segmented-flat",
    ) {
      if (value == null) return;
      if (value === "segmented") return segmentKindClasses.segmented;
      if (value === "segmented-flat") {
        return segmentKindClasses["segmented-flat"];
      }
      // Tab kinds supply their own focus indicators. The button ring would
      // cross the folder seam and be clipped by the strip.
      const noRing = "ui-focus-visible:outline-none";
      // Tabs size to their text, so a heavier selected tab would move the tabs
      // after it. Only a label with data-text turns heavier, because it keeps
      // that width. This sorts after the zero-specificity button weight, so it
      // wins, and a weight class on the tab still wins over both.
      const weight = "ui-base:font-normal";
      if (value === "folder") return [tabFolder, noRing, weight];
      if (value === "bevel") {
        return [tabBox, noRing, weight, "ui-selected:ui-bevel-button"];
      }
      return [tabBox, noRing, weight];
    },
  },
  defaultVariants: {
    $kind: "folder",
    $layer: TABS_LAYER,
    // Flat and bevel tabs lift 1.5 steps, above the one-step hover state.
    // Folders use the same lightening as the panel.
    $selectedOffset(defaultValue, variants) {
      if (isSegmentedKind(variants.$kind)) return defaultValue;
      if (variants.$kind === "folder") return false;
      return 1.5;
    },
    $lightnessOffset: false,
    // The strip padding shows above and below the tabs, so folders take it from
    // their own padding, and padding on Tabs makes the strip only a little
    // taller. They keep at least 1.5 spacing steps.
    $p(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      // Replace only the control padding, so an extender's default stays.
      if (defaultValue !== 2) return defaultValue;
      return "round(max(var(--spacing) * 1.5, var(--spacing) * 2 - var(--tabs-float, 0px)), 1px)";
    },
    // Idle tabs dim their text, which inherits into slots, like navigation
    // links. Hover and selection restore full ink.
    $ink: 80,
    $selectedInk: 100,
    $lighten(defaultValue, variants) {
      if (isSegmentedKind(variants.$kind)) return defaultValue;
      if (variants.$kind !== "folder") return false;
      // A default of an extending recipe wins over the layer check.
      if (defaultValue != null) return defaultValue;
      return keepsTabsLayer(variants);
    },
    $rounded: "unset",
    // Disable the button ring but keep its color for the folder focus edge.
    // Segmented tabs share the ring of the other segments.
    $focus(_defaultValue, variants) {
      return isSegmentedKind(variants.$kind);
    },
    $focusColor: "brand",
    // A width from $border would otherwise draw a ring on light surfaces.
    // Folders keep a border, so it joins the panel.
    $borderType(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      if (defaultValue === "auto") return "border";
      return defaultValue;
    },
  },
  refine({ variants, addClass }) {
    // Every kind paints its selected tab, including folders that lighten it to
    // match the panel, so hover keeps that surface.
    if (!hasSelectedSurface(variants)) {
      addClass(selectedHoverClass);
    }
    if (variants.$kind === "folder" && inheritsTabsBorder(variants)) {
      // Unselected folders have no visible border or fill, so they skip the
      // surface that the border paints beneath it.
      addClass([tabsInheritedBorder, "not-ui-selected:bg-none"]);
    }
    if (variants.$border != null) return;
    // Replace the 1px forced-colors fallback edge on unselected tabs. Folders
    // keep the root edge width, so an edgeless root keeps them borderless.
    if (variants.$kind === "folder") {
      addClass(
        "not-ui-selected:forced-colors:ak-frame-border-(--border-width)",
      );
      return;
    }
    addClass("not-ui-selected:forced-colors:ak-frame-border-0");
  },
});

/** A tab slot for an icon, avatar, badge, or shortcut. */
export const tabSlot = buttonSlot;

/**
 * The close mark of a tab that can close, after its label. It takes the pointer
 * like a button, with its own hover surface over the hover surface of the tab,
 * but it is not a control: a tab can't hold one, so the tab closes itself from
 * the keyboard.
 */
export const tabRemove = cv({
  extend: [tabSlot, hover],
  class: [
    "tab-remove",
    // The icon keeps the text size in a box as tall as the line.
    "[--slot-icon-size:1em]",
  ],
  defaultVariants: {
    // A line-tall square sits as far from the side of the tab as from its top,
    // and gives the pointer more room than the icon.
    $size: "xl",
    $square: true,
    // A round hover surface sets the mark apart from the corners of the tab.
    $rounded: "full",
    // The mark has room around its icon, so it sits closer to the label.
    $mx: "closeGap",
    $ink: 60,
    $hoverInk: 100,
    $hoverOffset: true,
  },
});

/**
 * Tab label text with optional truncation. Set `data-text` to the label text to
 * show the label of a selected tab in a heavier weight without moving the tabs,
 * as `buttonLabel` describes. Without `data-text`, the label keeps the normal
 * weight.
 */
export const tabLabel = buttonLabel;

// The outer tab of a strip and a control of a tab row beside it are not
// siblings, so the separator between them can't find them as the elements
// beside it. A separator after the strip follows its last tab, and the first
// separator in the strip follows the control before the strip.
const tabRowSeparatorShy = cx(
  "[.tabs-strip:has(>.control:nth-last-child(1_of_.control):is(:hover,.ui-hovered,:focus-visible,[aria-selected='true']))+&,.tabs-strip:has(>.control:nth-last-child(1_of_.control):is(:hover,.ui-hovered,:focus-visible,[aria-selected='true']))+.carousel-button-area+&]:opacity-(--separator-shy-opacity)",
  "[.tab-row>.control:is(:hover,.ui-hovered,:focus-visible)+.tabs-strip>&:first-child,.tab-row>.control:is(:hover,.ui-hovered,:focus-visible)+.carousel-button-area+.tabs-strip>&:first-child]:opacity-(--separator-shy-opacity)",
);

/** A divider between tabs. Defaults to the `sm` size. */
export const tabSeparator = cv({
  extend: [buttonSeparator],
  class: [
    tabRowSeparatorShy,
    // The separator of a tab that enters or leaves shows with the tab.
    "[&:has(+[data-leave])]:opacity-0",
    "[&:has(+[data-enter])]:starting:opacity-0",
  ],
  defaultVariants: {
    // A mark as tall as the font, not the line, sits lighter beside short tab
    // labels.
    $size: "sm",
  },
});

/**
 * A thin bar inside a flat or bevel tab that marks it while selected. The tab
 * keeps its hover surface.
 */
export const tabBar = buttonBar;

// The space that the strip keeps above its tabs, and how far the tabs move onto
// a root edge that is wider than that space. A tab row sets the same values for
// the controls beside the strip, which sit like its tabs.
const tabsFloat = cx(
  "[--tabs-float:var(--ak-frame-padding)]",
  // Folder borders lie on a root ring too, so its width also affects the frame
  // margin and concentric radius.
  "[--tabs-merge:calc(max(0px,calc(var(--tabs-bordering)-var(--tabs-float)))*var(--tabs-folder,0))]",
  // Inset hover surfaces beyond the edge overlap by one fifth of the font.
  "[--tab-inset:calc(0.2em+var(--tabs-merge))]",
);

// Beside a control of a tab row, the strip is not at the end of the row, so it
// drops the margin, the padding, and the corner that it has over the root edge.
// A strip that fades keeps a gutter as wide as a folder curve there, and
// reaches under the control by that width. The control then sits as close to
// the outer tab as a tab would, and the curve of a selected outer folder shows
// under the control. The fade hides the tabs that scroll into the gutter, and
// behind a scroll button, which sits after the gutter. Without the fade,
// nothing would hide them, so the strip has no gutter: the tabs and the curve
// of an outer folder end at the control.
const tabStripInRow = cx(
  // The row keeps the space below the tabs as its own padding. The selector
  // names the strip and both classes of the row, so it outranks the bottom
  // margins of a strip in tabListCarousel.
  "[.tab-list-carousel.tab-row>&.tabs-strip]:-mb-(--tab-row-below)",
  "[.tab-row>:not(.carousel-button-area)~&]:ms-0",
  "[.tab-row>:not(.carousel-button-area)~&]:ps-0",
  "[.tab-row>:not(.carousel-button-area)~&]:rounded-ss-none!",
  "[.tab-row>:not(.carousel-button-area)~&.carousel-fade]:-ms-(--tabs-radius)",
  "[.tab-row>:not(.carousel-button-area)~&.carousel-fade]:ps-(--tabs-radius)",
  "[.tab-row>&:has(~:not(.carousel-button-area))]:me-0",
  "[.tab-row>&:has(~:not(.carousel-button-area))]:pe-0",
  "[.tab-row>&:has(~:not(.carousel-button-area))]:rounded-se-none!",
  "[.tab-row>&:has(~:not(.carousel-button-area))]:after:w-0",
  // The spacer is a flex item, so the gap of the strip would add to the gap of
  // the row between the last tab and the control.
  "[.tab-row>&:has(~:not(.carousel-button-area))]:after:-ms-(--group-gap,0px)",
  "[.tab-row>&.carousel-fade:has(~:not(.carousel-button-area))]:-me-(--tabs-radius)",
  // No panel corner lies below this end, so the spacer only holds the curve.
  "[.tab-row>&.carousel-fade:has(~:not(.carousel-button-area))]:after:w-(--tabs-radius)",
  // A stretched strip has no spacer, so its padding is the gutter.
  "[.tab-row>&.tabs-stretch.carousel-fade:has(~:not(.carousel-button-area))]:pe-(--tabs-radius)",
  "[.tab-row>:not(.carousel-button-area)~&.carousel-fade]:[--carousel-cover-start:calc(var(--tabs-radius)+var(--carousel-button-space))]",
  "[.tab-row>&.carousel-fade:has(~:not(.carousel-button-area))]:[--carousel-cover-end:calc(var(--tabs-radius)+var(--carousel-button-space))]",
  "[.tab-row>:not(.carousel-button-area)~&.carousel-fade]:scroll-ps-[calc(var(--carousel-cover-start)+var(--carousel-fade-size))]",
  "[.tab-row>&.carousel-fade:has(~:not(.carousel-button-area))]:scroll-pe-[calc(var(--carousel-cover-end)+var(--carousel-fade-size))]",
);

// The strip that joins the panel. A segmented list stands on its own.
const tabStrip = cx(
  "tabs-strip flex",
  // In tabListCarousel, share the first grid cell with the scroll buttons and
  // the strip color that it paints behind the strip.
  "row-start-1 col-start-1",
  "rounded-b-none!",
  // Add the root edge width below the tabs so the panel can overlap it.
  // Each folder accounts for its own border when crossing the seam.
  tabsFloat,
  "[--tabs-dock:calc(var(--tabs-float)+var(--tabs-bordering))]",
  // A root indent replaces the strip padding only beside the outer tabs.
  "[--tabs-float-x:var(--tabs-float)] [.tabs-indent>&,.tabs-indent>*>&]:[--tabs-float-x:var(--tabs-indent)]",
  // An automatic indent only makes room for folder curves, so other tabs keep
  // the strip padding.
  "[.tabs-indent-auto>&,.tabs-indent-auto>*>&]:[--tabs-float-x:calc(var(--tabs-float)+(var(--tabs-indent)-var(--tabs-float))*var(--tabs-folder,0))]",
  // Continue below the seam to fill rounded panel corners.
  "pb-[calc(var(--tabs-dock)+var(--tabs-notch,0px))]",
  // In tabListCarousel, the fade mask paints the strip in a layer of its own,
  // so the strip stacks above the panel for selected folders to cover the
  // seam. The strip paints no color there, so it covers nothing else.
  "[.tab-list-carousel>&]:relative [.tab-list-carousel>&]:z-2",
  // When the root edge is wider than strip padding, tabsFloat pulls the tabs
  // onto it. The sides do the same with their own padding.
  "[--tabs-merge-x:calc(max(0px,calc(var(--tabs-bordering)-var(--tabs-float-x)))*var(--tabs-folder,0))]",
  // Extend the scroll box over the root edge so tab edges and corners remain
  // unclipped.
  "-mt-[calc(var(--tabs-padding)+var(--tabs-bordering))]",
  "-mx-[calc(var(--tabs-padding)+var(--tabs-bordering))]",
  "pt-[calc(var(--tabs-bordering)+var(--tabs-float)-var(--tabs-merge))]",
  "px-[calc(var(--tabs-bordering)+var(--tabs-float-x)-var(--tabs-merge-x))]",
  "rounded-ss-[calc(var(--tabs-radius)+var(--tabs-ring))]!",
  "rounded-se-[calc(var(--tabs-radius)+var(--tabs-ring))]!",
  // Paint within the root edge, though the scroll box extends beyond it. In
  // tabListCarousel, which paints the strip color behind the strip, the fade
  // mask fades only the tabs.
  "ui-tabs-well [.tab-list-carousel>&]:bg-none!",
  // Frame rules give the strip a bottom margin when nothing follows it. In
  // tabListCarousel, the next button follows it, so the position of
  // tabListCarousel in the root decides instead.
  "[.tab-list-carousel>&]:mb-0",
  "[.tab-list-carousel:not(:has(~_*:not([hidden],template)))>&]:mb-(--ak-frame-margin)",
  // Reserve a non-shrinking spacer for the final folder curve. Beside a rounded
  // panel corner, it also keeps that curve clear of the corner, less the strip
  // padding that already separates them.
  "after:w-[max(var(--tabs-radius),calc(var(--tabs-radius)+var(--tabs-notch,0px)-var(--tabs-float-x)+var(--tabs-merge-x)))] after:shrink-0",
  "overflow-x-auto overflow-y-clip overscroll-x-contain scrollbar-none",
  // The panel follows --tabs-scroll from the root. The scroll buttons follow
  // --carousel from tabListCarousel, which hides that name from the panel.
  "[scroll-timeline-name:--tabs-scroll,--carousel] [scroll-timeline-axis:inline]",
  // The strip reaches over the root padding and edge, where the fade and the
  // scroll buttons start.
  "[--carousel-overhang:calc(var(--tabs-padding)+var(--tabs-bordering))]",
  "[--carousel-inset:calc(var(--carousel-overhang)+max(var(--carousel-button-space),var(--carousel-clear))+var(--carousel-fade-size))]",
  // Scroll the tab clear of the fade and the buttons, and its outer curve into
  // view too. This overrides the smaller frame scroll padding.
  "scroll-px-[max(var(--tabs-radius),var(--carousel-inset))]",
  tabStripInRow,
);

/**
 * A horizontally scrolling tab strip with content-sized or stretched tabs, or a
 * segmented control with `$kind="segmented"`.
 */
export const tabList = cv({
  extend: [buttonGroup],
  variants: {
    /**
     * Sets `strip` for a list that joins the panels, or `segmented` for a list
     * that stands on its own around segmented tabs.
     */
    $kind(value?: "strip" | "segmented") {
      if (value == null) return;
      if (value === "segmented") {
        // Without a Tabs root, the list contains the z-index of its tabs.
        return ["flex isolate", segmentGroupClass];
      }
      return tabStrip;
    },
    /**
     * Sets content-sized tabs with `horizontal`, or equal-width tabs with
     * `stretch`, which fill the strip and treat the last tab like the first.
     * Only horizontal strips are supported.
     */
    $layout(value?: "horizontal" | "stretch") {
      if (value !== "stretch") return;
      // Keep the strip width automatic so negative margins can extend it over
      // the root edge. Without the end spacer, the last tab mirrors the first:
      // same inset from the root edge, and a selected folder meets the panel.
      return "tabs-stretch after:hidden [&>.control]:basis-0 [&>.control]:min-w-0 [&>.control]:grow [&>.control]:[--stretch-px-scale:0.75]";
    },
    /**
     * Fades the tabs at each end of a list that scrolls while more tabs lie
     * that way, and fully behind a visible scroll button. The color of a strip
     * or a segmented list stays, but a border on a strip, such as a divider
     * below the tabs, fades with them. A segmented list without padding doesn't
     * scroll, so it has no fades. Defaults to `true`.
     */
    $fade: {
      true: [
        // A list outside a carousel, such as a strip outside tabListCarousel,
        // has no buttons and paints its own color, which a fade would fade too.
        "carousel-fade [.carousel>&]:ui-carousel-fade",
        // The fade keeps each end clear of the round panel corner below it, so
        // a tab that passes over the corner doesn't show.
        "[.tab-list-carousel>&]:[--carousel-clear:var(--tabs-notch,0px)]",
      ],
      false: carouselNoFadeClass,
    },
    /**
     * Sets how far a scroll button moves the list: `view`, the default, moves
     * it by the visible width less the fades and buttons, and `item` moves it
     * to the next tab. No press moves the list by less than the fade and button
     * cover, and a step that would leave less than that goes on to the end.
     */
    $step: carouselStepClasses,
  },
  defaultVariants: {
    $kind: "strip",
    // Replaces the static false default that the map's false key sets.
    $fade: true,
    $joined(defaultValue, variants) {
      if (variants.$kind === "segmented") return defaultValue;
      return false;
    },
    // The strip inherits the root layer, which Tabs darkens. A segmented list
    // stands on its own, so it darkens itself.
    $layer: true,
    $darken(defaultValue, variants) {
      if (variants.$kind === "segmented") return 0.5;
      return defaultValue;
    },
    $cover(defaultValue, variants) {
      if (variants.$kind === "segmented") return defaultValue;
      return true;
    },
    $p(defaultValue, variants) {
      if (variants.$kind === "segmented") return defaultValue;
      return "unset";
    },
    $rounded(defaultValue, variants) {
      if (variants.$kind === "segmented") return defaultValue;
      return "unset";
    },
    // Adjust nested frame rounding for the border overlap; the classes above
    // move the scroll box.
    $m(defaultValue, variants) {
      if (variants.$kind === "segmented") return defaultValue;
      return "calc(-1 * var(--tabs-merge))";
    },
  },
  refine({ variants, addClass }) {
    if (variants.$kind !== "segmented") return;
    if (variants.$layout !== "stretch") return;
    addClass("w-full");
  },
});

/**
 * A carousel root that holds a tab strip and its scroll buttons in one grid
 * cell, so the buttons center on the tabs whatever the display of the `tabs`
 * root. The strip fades its tabs at the ends, so this paints the strip color
 * behind the strip, with the same margins over the root edge.
 */
export const tabListCarousel = cv({
  extend: [carousel],
  class: [
    "tab-list-carousel",
    // The strip, the buttons, and the strip color stack with the panel, so
    // selected folders can cover the seam.
    "isolation-auto",
    // The strip stacks above the panel, so the buttons stack above the strip.
    "[--carousel-button-z:3]",
    // The button areas span the strip color, from over the root padding and
    // edge down to the panel, not past the strip.
    "[&>.carousel-button-area]:mb-0",
    // Shift the buttons from the middle of their areas onto the tabs. The strip
    // reaches below the tabs down to the panel by the notch and by the part of
    // the root edge that folders cover.
    "[--carousel-button-y:calc((var(--tabs-notch,0px)+max(0px,var(--tabs-bordering)-var(--tabs-padding))*var(--tabs-folder,0))/-2)]",
    // With the root padding and edge beside them, the buttons keep about as
    // much space from the side of the strip as from its top.
    "[--carousel-button-padding:--spacing(1)]",
    "before:row-start-1 before:col-start-1",
    "before:-mt-[calc(var(--tabs-padding)+var(--tabs-bordering))]",
    "before:-mx-[calc(var(--tabs-padding)+var(--tabs-bordering))]",
    "before:ui-tabs-well",
  ],
  defaultVariants: {
    $kind: "row",
    // The strip reaches over the root padding and edge, where the fade and the
    // scroll buttons start.
    $bleed: "calc(var(--tabs-padding) + var(--tabs-bordering))",
  },
});

/**
 * A row that holds a tab strip and the controls beside it, such as a button
 * that opens a tab, or the buttons of a window. It takes the place of the
 * `tabListCarousel` around the strip, so it also holds the scroll buttons of
 * the strip and paints the strip color behind the whole row. The controls are
 * outside the element with the `tablist` role. The strip takes the width of its
 * tabs and scrolls when the row is full, so a control after it stays next to
 * the last tab. An element with a `grow` class takes the free space, so the
 * controls after it sit at the end of the row. A margin class on a
 * `tabRowButton` can't do that, because the frame margin of the button wins.
 */
export const tabRow = cv({
  extend: [tabListCarousel],
  class: [
    // The parts lay out in one line, in place of the single grid cell of a
    // carousel root, which this follows in the stylesheet.
    // The glider of the strip counts the other parts of the row in the place
    // of its box, so the corners know how far the box is from each end.
    "tab-row glider-row flex! items-start",
    tabsFloat,
    // The controls keep the space of the tabs between them.
    "gap-(--tabs-float)",
    // The row is as tall as the tabs, so a part can center itself on them. The
    // strip reaches below the tabs, down to the panel, and the row keeps that
    // space as padding.
    "[--tab-row-below:calc(var(--tabs-float)+var(--tabs-bordering)+var(--tabs-notch,0px))]",
    "pb-(--tab-row-below)",
    // Like a strip with nothing after it, a row with nothing after it lies on
    // the bottom edge of the root.
    "[&:not(:has(~_*:not([hidden],template)))]:-mb-(--tabs-merge)",
    // Like the strip, a scroll button area reaches below the tabs, down to the
    // panel, so a scroll button taller than the tabs doesn't make the row
    // taller. The selector names both classes of the row, so it outranks the
    // bottom margin of tabListCarousel.
    "[&.tab-row>.carousel-button-area]:-mb-(--tab-row-below)",
    // The area starts over the root padding and edge, above the tabs, unless
    // the tabs lie on the edge, and ends below them. The button moves by half
    // of that difference, onto the middle of the tabs. The selector names the
    // row, so this rule wins over the shift of tabListCarousel.
    "[&.tab-row]:[--carousel-button-y:calc((var(--carousel-overhang)-var(--tabs-merge)-var(--tab-row-below))/2)]",
    // A separator centers on the tabs, which start on a root edge wider than
    // the space above them.
    "[&>.control-separator]:-mt-(--tabs-merge)",
    // The strip color fills the row behind the parts.
    "relative before:absolute before:inset-0",
    // The strip reaches under the parts beside it, so they stack above it to
    // show and to take the pointer. Zero specificity lets a class on a part
    // win.
    "[&>:not(.tabs-strip,.carousel-button-area)]:ui-base:relative",
    "[&>:not(.tabs-strip,.carousel-button-area)]:ui-base:z-3",
    // A scroll button area takes no room in the line. It lies over its end of
    // the strip, past the gutter that the strip keeps under a control.
    "[--tab-row-area:calc(var(--carousel-button-size)+2*var(--carousel-button-padding)+var(--tabs-float))]",
    "[&>.carousel-button-area]:flex-none",
    "[&>.carousel-button-area:has(+.tabs-strip)]:-me-(--tab-row-area)",
    "[&>.tabs-strip+.carousel-button-area]:-ms-(--tab-row-area)",
    // A stretched strip fills the row.
    "[&>.tabs-stretch]:grow",
  ],
});

/**
 * A button in a `tabRow`, beside the tab strip. It looks like a tab that is not
 * selected: the same height, text strength, hover surface, and corners. Set the
 * same `$kind` as the tabs.
 */
export const tabRowButton = cv({
  extend: [tab],
  class: [
    "flex-none",
    // The frame margin of the default moves the button onto the root edge only
    // at the top, and at an end of the row. The extra class outranks the frame
    // margin.
    "[&.ak-frame]:mb-0 [&.ak-frame]:not-first:ms-0 [&.ak-frame]:not-last:me-0",
  ],
  defaultVariants: {
    // Like the tabs, the button moves onto a root edge wider than the space
    // above it, and keeps its corners concentric with the root there.
    $m: "calc(-1 * var(--tabs-merge))",
  },
});

/** A panel surface whose top edge and corners join the selected tab. */
export const tabPanels = cv({
  extend: [frame],
  class: [
    "relative z-1 overflow-clip",
    tabsBorder,
    // With a glider in the strip, a selected folder is where the box is. A
    // first folder sits at twice the meet from the start of the strip, so the
    // corners take the meet from the place of the box, and change with it
    // while it travels. Other selected tabs don't meet the panel.
    gliderFollower,
    // Overlap the strip notch and root edge so the selected folder covers the
    // seam. The top margin and corners here apply only below a strip. A panel
    // with no strip before it keeps those of $cover, like the first frame.
    "not-first:-mt-[calc(var(--tabs-notch,0px)+var(--tabs-bordering))]",
    // Use root corner geometry, reducing the start radius beside the first
    // selected folder, and the end radius beside a last one in a stretched
    // strip. --tabs-round-s and --tabs-round-e square each corner while tabs
    // pass over it.
    "[--tabs-corner-s:calc(min(var(--tabs-notch,0px),var(--tabs-meet,var(--tabs-notch,0px)))*var(--tabs-round-s,1))]",
    "[--tabs-corner-e:calc(min(var(--tabs-notch,0px),var(--tabs-meet-end,var(--tabs-notch,0px)))*var(--tabs-round-e,1))]",
    // A cut folder curve keeps its full radius, so the corner takes only the
    // space past the curve.
    "[.tabs-folder-cut>&]:[--tabs-corner-s:calc(min(var(--tabs-notch,0px),max(0px,2*var(--tabs-meet,var(--tabs-radius))-var(--tabs-radius)))*var(--tabs-round-s,1))]",
    "[.tabs-folder-cut>&]:[--tabs-corner-e:calc(min(var(--tabs-notch,0px),max(0px,2*var(--tabs-meet-end,var(--tabs-radius))-var(--tabs-radius)))*var(--tabs-round-e,1))]",
    // With a glider in the strip, the corners take the meet from the place of
    // the box, which is half of its distance from the end of the row. Beside a
    // control of a tab row, that distance holds the control, so the corner
    // stays round, and it shrinks with a control that folds away. These
    // rules set the corners and not the meet, because the corners are
    // registered and don't inherit. A value that changes on each frame of the
    // travel would otherwise restyle everything in the panels on each frame.
    "[.tabs:has(>.tabs-strip>.ui-folder:is([aria-selected='true'],[data-selected='true']),>*>.tabs-strip>.ui-folder:is([aria-selected='true'],[data-selected='true']))>&]:data-glider-following:[--tabs-corner-s:calc(min(var(--tabs-notch,0px),var(--glider-start)/2)*var(--tabs-round-s,1))]",
    "[.tabs:has(>.tabs-strip.tabs-stretch>.ui-folder:is([aria-selected='true'],[data-selected='true']),>*>.tabs-strip.tabs-stretch>.ui-folder:is([aria-selected='true'],[data-selected='true']))>&]:data-glider-following:[--tabs-corner-e:calc(min(var(--tabs-notch,0px),var(--glider-end)/2)*var(--tabs-round-e,1))]",
    "[.tabs.tabs-folder-cut:has(>.tabs-strip>.ui-folder:is([aria-selected='true'],[data-selected='true']),>*>.tabs-strip>.ui-folder:is([aria-selected='true'],[data-selected='true']))>&]:data-glider-following:[--tabs-corner-s:calc(min(var(--tabs-notch,0px),max(0px,var(--glider-start)-var(--tabs-radius)))*var(--tabs-round-s,1))]",
    "[.tabs.tabs-folder-cut:has(>.tabs-strip.tabs-stretch>.ui-folder:is([aria-selected='true'],[data-selected='true']),>*>.tabs-strip.tabs-stretch>.ui-folder:is([aria-selected='true'],[data-selected='true']))>&]:data-glider-following:[--tabs-corner-e:calc(min(var(--tabs-notch,0px),max(0px,var(--glider-end)-var(--tabs-radius)))*var(--tabs-round-e,1))]",
    // Each corner opens from that radius to a full corner as --tabs-open-s or
    // --tabs-open-e grows, while the fade hides a selected outer folder.
    "not-first:rounded-ss-[calc(var(--tabs-corner-s)+(var(--tabs-notch,0px)-var(--tabs-corner-s))*var(--tabs-open-s,0))]",
    "not-first:rounded-se-[calc(var(--tabs-corner-e)+(var(--tabs-notch,0px)-var(--tabs-corner-e))*var(--tabs-open-e,0))]",
    // Square the corners while tabs pass over them. A strip that fades keeps
    // its ends clear of the corners instead, so they stay round. The start
    // corner opens as the fade hides a selected first folder. The end corner
    // squares while a selected last folder leaves the end, before the fade
    // hides it, and opens again once the fade does.
    "ui-tabs-round",
    // Beside a control of a tab row, no tab passes over the corner at that end,
    // so a strip without the fade keeps that corner round.
    "[.tab-row:has(>:not(.carousel-button-area)~.tabs-strip:not(.carousel-fade))~&]:[animation-name:none,ui-tabs-round-e]",
    "[.tab-row:has(>.tabs-strip:not(.carousel-fade)~:not(.carousel-button-area))~&]:[animation-name:ui-tabs-round-s,none]",
    "[.tab-row:has(>:not(.carousel-button-area)~.tabs-strip:not(.carousel-fade)):has(>.tabs-strip~:not(.carousel-button-area))~&]:[animation-name:none]",
    "[.tab-list-carousel:has(>.carousel-fade)~&]:ui-tabs-open-start",
    "[.tab-list-carousel:has(>.carousel-fade:nth-last-child(1_of_:not(.carousel-button-area))>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-last-child(1_of_.control))~&]:ui-tabs-open-end",
  ],
  defaultVariants: {
    // Lighten from the layer around the root, like selected tabs, not from the
    // root layer, which is the strip color. A color or another modifier
    // replaces the lighten.
    $layer: TABS_LAYER,
    $lighten(defaultValue, variants) {
      // A default of an extending recipe wins over the layer check.
      if (defaultValue != null) return defaultValue;
      return keepsTabsLayer(variants);
    },
    $p: 3,
    $cover: true,
    // A width from $border would otherwise draw a ring on light surfaces.
    $borderType(defaultValue) {
      if (defaultValue === "auto") return "border";
      return defaultValue;
    },
  },
  refine({ variants, addClass }) {
    if (!inheritsTabsBorder(variants)) return;
    // The root layer, which is the strip color, is the backdrop by default.
    // Under an edge hidden at rest, the border lies on the hidden root ring,
    // outside the root, so it paints the layer around the root.
    addClass([
      "ak-frame-bordering-inherit ak-frame-backdrop",
      "[.tabs-edge-hidden-at-rest>&]:ak-frame-backdrop-(--tabs-layer)",
    ]);
  },
});
