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
    "tabs",
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
    // The strip is a child of the root, or of tabListCarousel in the root.
    "has-[>.tabs-strip>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-child(1_of_.control),>*>.tabs-strip>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-child(1_of_.control)]:[--tabs-meet:calc((var(--tabs-indent)+min(var(--tabs-indent),var(--tabs-bordering)))/2)]",
    // A stretched strip has no room after its last tab, so a selected last
    // folder meets the panel in the same way at the end.
    "has-[>.tabs-strip.tabs-stretch>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-last-child(1_of_.control),>*>.tabs-strip.tabs-stretch>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-last-child(1_of_.control)]:[--tabs-meet-end:calc((var(--tabs-indent)+min(var(--tabs-indent),var(--tabs-bordering)))/2)]",
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
// no curve, like an adapted one.
const tabCutCurves = cx(
  "[.tabs-folder-cut>.tabs-strip>&,.tabs-folder-cut>*>.tabs-strip>&]:ui-selected:before:[--folder-radius:min(var(--tabs-radius),var(--tabs-meet,var(--tabs-radius))*1000000)]",
  "[.tabs-folder-cut>.tabs-strip>&,.tabs-folder-cut>*>.tabs-strip>&]:ui-selected:after:[--folder-radius:min(var(--tabs-radius),var(--tabs-meet-end,var(--tabs-radius))*1000000)]",
  "[.tabs-folder-cut>.tabs-strip>&,.tabs-folder-cut>*>.tabs-strip>&]:ui-selected:before:[--folder-cut:calc(var(--tabs-radius)-2*var(--tabs-meet,var(--tabs-radius))-var(--tabs-bordering))]",
  "[.tabs-folder-cut>.tabs-strip>&,.tabs-folder-cut>*>.tabs-strip>&]:ui-selected:after:[--folder-cut:calc(var(--tabs-radius)-2*var(--tabs-meet-end,var(--tabs-radius))-var(--tabs-bordering))]",
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

/** A tab with flat, bevel, or folder styling and keyboard focus feedback. */
export const tab = cv({
  extend: [button],
  class: [
    "z-6",
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
    $layer: "var(--tabs-layer)",
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
      if (variants.$kind === "folder") return defaultValue ?? true;
      return false;
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
 * Tab label text with optional truncation. Set `data-text` to the label text to
 * show the label of a selected tab in a heavier weight without moving the tabs,
 * as `buttonLabel` describes. Without `data-text`, the label keeps the normal
 * weight.
 */
export const tabLabel = buttonLabel;

/** A divider between tabs. Defaults to the `sm` size. */
export const tabSeparator = cv({
  extend: [buttonSeparator],
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

// The strip that joins the panel. A segmented list stands on its own.
const tabStrip = cx(
  "tabs-strip flex",
  // In tabListCarousel, share the first grid cell with the scroll buttons and
  // the strip color that it paints behind the strip.
  "row-start-1 col-start-1",
  "rounded-b-none!",
  // Add the root edge width below the tabs so the panel can overlap it.
  // Each folder accounts for its own border when crossing the seam.
  "[--tabs-float:var(--ak-frame-padding)]",
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
  // When the root edge is wider than strip padding, pull tabs onto it. Folder
  // borders lie on a root ring too, so its width also affects the frame margin
  // and concentric radius.
  "[--tabs-merge:calc(max(0px,calc(var(--tabs-bordering)-var(--tabs-float)))*var(--tabs-folder,0))]",
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
  // Inset hover surfaces beyond the edge overlap by one fifth of the font.
  "[--tab-inset:calc(0.2em+var(--tabs-merge))]",
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

/** A panel surface whose top edge and corners join the selected tab. */
export const tabPanels = cv({
  extend: [frame],
  class: [
    "relative z-1 overflow-clip",
    tabsBorder,
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
    "[.tab-list-carousel:has(>.carousel-fade)~&]:ui-tabs-open-start",
    "[.tab-list-carousel:has(>.carousel-fade>.ui-folder:is([aria-selected='true'],[data-selected='true']):nth-last-child(1_of_.control))~&]:ui-tabs-open-end",
  ],
  defaultVariants: {
    // Lighten from the layer around the root, like selected tabs, not from the
    // root layer, which is the strip color.
    $layer: "var(--tabs-layer)",
    $lighten: true,
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
