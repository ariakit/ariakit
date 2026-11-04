import { cv, cx } from "clava";
import {
  button,
  buttonBar,
  buttonGroup,
  buttonLabel,
  buttonSeparator,
  buttonSlot,
} from "./button.ts";
import { frame } from "./frame.ts";
import {
  SEGMENT_GROUP_CLASS,
  SEGMENT_KIND_CLASSES,
  isSegmentedKind,
} from "./segment.ts";
import { hasSelectedSurface, selectedHoverClass } from "./selected.ts";

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
    // Copy root geometry before descendant frames replace it; edge widths do
    // not inherit.
    "[--tabs-padding:var(--ak-frame-padding)]",
    "[--tabs-radius:var(--ak-frame-radius)]",
    "[--tabs-border:var(--ak-frame-border)]",
    "[--tabs-ring:var(--ak-frame-ring)]",
    "[--tabs-bordering:calc(var(--tabs-border)+var(--tabs-ring))]",
    "[--tabs-layer:var(--ak-layer)]",
    // Nested tabs set their own values instead of inheriting them.
    "[--tabs-meet:initial] [--tabs-meet-end:initial] [--tabs-folder:initial]",
    // A selected first folder meets the panel halfway across the available
    // padding and border. Rings may overlap at this seam; an opaque backing
    // would separate them from underlying shadows.
    "has-[>:first-child>.ui-folder[aria-selected='true']:nth-child(1_of_.control)]:[--tabs-meet:calc((var(--tabs-padding)+min(var(--tabs-padding),var(--tabs-border)))/2)]",
    // A stretched strip has no room after its last tab, so a selected last
    // folder meets the panel in the same way at the end.
    "has-[>:first-child.tabs-stretch>.ui-folder[aria-selected='true']:nth-last-child(1_of_.control)]:[--tabs-meet-end:calc((var(--tabs-padding)+min(var(--tabs-padding),var(--tabs-border)))/2)]",
    // Scope the scroll timeline so the sibling panel can follow it.
    "[timeline-scope:--tabs-scroll]",
    // Only the tabs of this root's own strip count, not those of nested tabs.
    "has-[>*>.ui-folder]:[--tabs-folder:1]",
    // Reserve the ring folder's three-pixel overhang so focusing a tab does
    // not scroll the strip vertically.
    "[--tabs-over:calc(max(0px,calc(min(var(--tabs-ring)*1000000,3px)-var(--tabs-ring)))*var(--tabs-folder,0))]",
  ],
  variants: {
    /**
     * Hides the root edge while tabs and panels keep theirs. Preserves edge
     * width so seams and corners remain aligned.
     */
    $edgeHidden: "border-transparent ring-transparent",
    /**
     * Rounds panel corners under folder tabs. The first selected folder reduces
     * the start corner, and the last selected folder of a stretched strip
     * reduces the end corner. Scrolling squares each clipped side. Other tab
     * kinds and `false` keep square corners.
     */
    $panelRoundedTop: {
      true: "[--tabs-notch:calc(var(--tabs-radius)*var(--tabs-folder,0))]",
      // An explicit zero keeps nested tabs from inheriting the outer notch.
      false: "[--tabs-notch:0px]",
    },
  },
  defaultVariants: {
    $rounded: "xl",
    $p: 1,
    $border: true,
    $panelRoundedTop: true,
  },
  refine({ variants, setVariants }) {
    if (variants.$border !== false) return;
    // An explicit false must publish zero edge width instead of inheriting the
    // parent frame edge. Set the type because frame treats zero as no border.
    setVariants({ $border: 0, $borderType: "auto" });
  },
});

// The side curves of a selected folder shrink where it meets the panel corner.
const tabCurves = cx(
  "ui-selected:before:[--folder-radius:min(var(--tabs-radius),var(--tabs-meet,var(--tabs-radius)))]",
  "ui-selected:after:[--folder-radius:min(var(--tabs-radius),var(--tabs-meet-end,var(--tabs-radius)))]",
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

// Selected folders join the panel; unselected folders use an inset hover
// surface.
const tabFolder = cx(
  "ui-folder",
  tabCurves,
  // Borders meet the root edge inside the box; rings need an offset so their
  // outside edge lands at the same position.
  "mt-[min(var(--tabs-merge),var(--ak-frame-ring))]",
  "first:ms-[min(var(--tabs-merge),var(--ak-frame-ring))]",
  // Extend selected folders over the panel seam. Extra bottom padding and a
  // negative margin preserve label position and row height.
  "[--tab-reach:calc(var(--tabs-float)+var(--folder-reach,0px))]",
  "ui-selected:pb-[calc(var(--py)+var(--tab-reach))]",
  "ui-selected:-mb-(--tab-reach)",
  "not-ui-selected:border-transparent not-ui-selected:ring-0",
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
      if (value === "segmented") return SEGMENT_KIND_CLASSES.segmented;
      if (value === "segmented-flat") {
        return SEGMENT_KIND_CLASSES["segmented-flat"];
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
    $border(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      return defaultValue ?? "inherit";
    },
  },
  refine({ variants, addClass }) {
    // Every kind paints its selected tab, including folders that lighten it to
    // match the panel, so hover keeps that surface.
    if (!hasSelectedSurface(variants)) {
      addClass(selectedHoverClass);
    }
    if (variants.$kind === "folder") return;
    if (variants.$border != null) return;
    // Keep the forced-colors fallback edge only on the selected tab.
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

/** A divider between tabs. */
export const tabSeparator = buttonSeparator;

/**
 * A thin bar inside a flat or bevel tab that marks it while selected. The tab
 * keeps its hover surface.
 */
export const tabBar = buttonBar;

// The strip that joins the panel. A segmented list stands on its own.
const tabStrip = cx(
  "flex",
  "rounded-b-none!",
  // Add the root edge width below the tabs so the panel can overlap it.
  // Each folder accounts for its own border or ring when crossing the seam.
  "[--tabs-float:var(--ak-frame-padding)]",
  "[--tabs-dock:calc(var(--tabs-float)+var(--tabs-bordering))]",
  // Continue below the seam to fill rounded panel corners and ring overhang.
  "pb-[calc(var(--tabs-dock)+var(--tabs-notch,0px)+var(--tabs-over,0px))]",
  // Keep the strip out of a separate stacking context so tabs can paint
  // above the panel.
  "z-auto",
  // When the folder edge is wider than strip padding, pull tabs onto the
  // root edge. Only border width affects the frame margin and concentric
  // radius.
  "[--tabs-merge:calc(max(0px,calc(var(--tabs-bordering)-var(--tabs-float)))*var(--tabs-folder,0))]",
  "[--tabs-pull:calc(max(0px,calc(var(--tabs-border)-var(--tabs-float)))*var(--tabs-folder,0))]",
  // Extend the scroll box over the root edge so tab edges and corners remain
  // unclipped.
  "-mt-[calc(var(--tabs-padding)+var(--tabs-bordering))]",
  "-mx-[calc(var(--tabs-padding)+var(--tabs-bordering))]",
  "pt-[calc(var(--tabs-bordering)+var(--tabs-float)-var(--tabs-merge))]",
  "px-[calc(var(--tabs-bordering)+var(--tabs-float)-var(--tabs-merge))]",
  "rounded-ss-[calc(var(--tabs-radius)+var(--tabs-ring))]!",
  "rounded-se-[calc(var(--tabs-radius)+var(--tabs-ring))]!",
  // Paint within the root edge, though the scroll box extends beyond it.
  "ui-tabs-well",
  // Inset hover surfaces beyond the edge overlap by one fifth of the font.
  "[--tab-inset:calc(0.2em+var(--tabs-merge))]",
  // Reserve a non-shrinking spacer for the final folder curve. Beside a rounded
  // panel corner, it also keeps that curve clear of the corner, less the strip
  // padding that already separates them.
  "after:w-[max(var(--tabs-radius),calc(var(--tabs-radius)+var(--tabs-notch,0px)-var(--tabs-float)+var(--tabs-merge)))] after:shrink-0",
  "overflow-x-auto overflow-y-clip overscroll-x-contain scrollbar-none",
  // Scroll the tab's outer curve into view too. This overrides the smaller
  // frame scroll padding.
  "scroll-px-(--tabs-radius)",
  "[scroll-timeline:--tabs-scroll_inline]",
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
        return ["flex isolate", SEGMENT_GROUP_CLASS];
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
      return "tabs-stretch after:hidden [&>.control]:basis-0 [&>.control]:min-w-0 [&>.control]:grow [&>.control]:[--stretch-px-scale:0.75] [&>.ui-folder:last-child]:me-[min(var(--tabs-merge),var(--ak-frame-ring))]";
    },
  },
  defaultVariants: {
    $kind: "strip",
    $joined(defaultValue, variants) {
      if (variants.$kind === "segmented") return defaultValue;
      return false;
    },
    // Darken the strip half a step so tabs and panels stand out together.
    $layer: true,
    $darken: 0.5,
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
      return "calc(-1 * var(--tabs-pull))";
    },
  },
  refine({ variants, addClass }) {
    if (variants.$kind !== "segmented") return;
    if (variants.$layout !== "stretch") return;
    addClass("w-full");
  },
});

/** A panel surface whose top edge and corners join the selected tab. */
export const tabPanels = cv({
  extend: [frame],
  class: [
    "relative z-1 overflow-clip",
    // Overlap the strip notch, root edge, and reserved ring overhang so the
    // selected folder covers the seam.
    "-mt-[calc(var(--tabs-notch,0px)+var(--tabs-bordering)+var(--tabs-over,0px))]",
    // Use root corner geometry, reducing the start radius beside the first
    // selected folder, and the end radius beside a last one in a stretched
    // strip.
    "rounded-ss-[calc(min(var(--tabs-notch,0px),var(--tabs-meet,var(--tabs-notch,0px)))*var(--tabs-round-s,1))]",
    "rounded-se-[calc(min(var(--tabs-notch,0px),var(--tabs-meet-end,var(--tabs-notch,0px)))*var(--tabs-round-e,1))]",
    "ui-tabs-round",
  ],
  defaultVariants: {
    $lighten: true,
    $p: 3,
    $cover: true,
    $border: "inherit",
  },
});
