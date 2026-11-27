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
import { carousel, carouselStepClasses } from "./carousel.ts";
import { focus } from "./focus.ts";
import { frame } from "./frame.ts";
import { gliderFollower, gliderHolder } from "./glider.ts";
import { hover } from "./hover.ts";
import { hasLayerBackground } from "./layer.ts";
import { isSegmentedKind, segmentKindClasses } from "./segment.ts";
import { hasSelectedSurface, selectedHoverClass } from "./selected.ts";
import { slotFrame } from "./slot-frame.ts";

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
    "ui-glider-scope",
    "ui-tabs",
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
        "ui-tabs--outer-edge-false",
        // Forced colors draw a transparent border in the text color, but keep
        // the system color of the page.
        // Stays a class to come after the classes of a caller, so that the
        // forced colors rule still applies.
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
      cut: "ui-tabs--folder-curve-cut",
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
      true: "ui-tabs--panel-rounded-top-true",
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
          class: "ui-tabs--indent-auto",
          style: { "--tabs-indent": TABS_AUTO_INDENT },
        };
      }
      // The marker lets the strip use this value in place of its own padding.
      return {
        class: "ui-tabs--indent",
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
      addClass("ui-tabs-edge-hidden-at-rest");
    }
    if (variants.$layer === "transparent" && !hasLayerBackground(variants)) {
      // A transparent root has no strip color of its own, so the strip paints
      // nothing and shows what is under it, such as tabs that the root lies
      // over.
      addClass("ui-tabs--strip-clear");
    }
    if (variants.$border !== false) return;
    // An explicit false must publish zero edge width instead of inheriting the
    // parent frame edge. Set the type because frame treats zero as no border,
    // and a zero-width ring can paint corner arcs in Firefox.
    setVariants({ $border: 0, $borderType: "border" });
  },
});

const tabBox = cx(
  "ui-tab--box",
  "ui-focus-visible:ak-layer-brand ui-focus-visible:ak-layer-contrast",
  "not-ui-selected:ui-focus-visible:ak-layer-brand",
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

const tabsBorder = cx("ui-tabs-border ak-edge-inherit");

// A folder border with the root edge width. On a root ring, it covers the ring
// instead of adding a second translucent edge. Like the panel, it paints the
// strip color beneath itself, so both draw the edge as over the strip on all
// sides, which differs from the root ring over the page. Under an edge hidden
// at rest, the folder paints its own surface there instead, so it leaves no
// line on the hidden ring, and its curves still cover the straight borders.
const tabsInheritedBorder = cx(
  "ak-frame-bordering-inherit ak-frame-backdrop",
  // Stays a class to come after the background-image of `tab`, which it
  // replaces.
  "[.ui-tabs-edge-hidden-at-rest>.ui-tab-strip>&,.ui-tabs-edge-hidden-at-rest>*>.ui-tab-strip>&]:ak-frame-backdrop-(--ak-layer)",
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

const tabFolder = cx(
  "ui-tab--folder ui-folder",
  tabsBorder,
  // Forced colors remove the fill, the only mark of a selected folder under a
  // root with no edge, so the selected folder keeps an edge there. A root with
  // an edge keeps its own width.
  // https://github.com/ariakit/ariakit/issues/7519
  "ui-selected:forced-colors:ak-frame-border-[length:max(1px,var(--border-width,1px))]",
  // Use brand contrast so the focus surface remains distinct on a
  // brand-colored strip.
  "not-ui-selected:ui-focus-visible:ak-layer-brand",
);

// The strip padding shows above and below the tabs, so folders take it from
// their own padding, and padding on Tabs makes the strip only a little taller.
// They keep at least 1.5 spacing steps.
const TAB_FOLDER_PADDING =
  "round(max(var(--spacing) * 1.5, var(--spacing) * 2 - var(--tabs-float, 0px)), 1px)";

/** A tab with flat, bevel, or folder styling and keyboard focus feedback. */
export const tab = cv({
  extend: [button],
  class: [
    "ui-tab",
    // Stays a class to come after the z-index of `control`, which it replaces.
    "z-6",
    // Unselected tabs use the strip surface without a lift. Selected tabs use
    // the root surface to match the panel.
    "not-ui-selected:ak-layer-color-(--ak-layer-parent)",
    "not-ui-selected:ak-layer-lighten-0 not-ui-selected:ak-layer-offset-0",
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
    $p(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      // Replace only the control padding, so an extender's default stays.
      if (defaultValue !== 2) return defaultValue;
      return TAB_FOLDER_PADDING;
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
    "ui-tab-remove",
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

/** A divider between tabs. Defaults to the `sm` size. */
export const tabSeparator = cv({
  extend: [buttonSeparator],
  class: "ui-tab-separator",
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

const tabStrip = cx(
  "ui-tab-strip",
  "ui-tabs-float",
  // Stays a class to come after the start margin of `ui-tab-strip` beside a
  // control of a tab row, which it replaces.
  "[.ui-tab-list-carousel>&&]:[@container_style(--tab-list-followed:0)]:mb-(--ak-frame-margin)",
  // Stays a class to come after the --carousel-inset of `carouselFrameClass`,
  // which it replaces.
  "[--carousel-inset:calc(var(--carousel-overhang)+max(var(--carousel-button-space),var(--carousel-clear))+var(--carousel-fade-size))]",
  // Scroll the tab clear of the fade and the buttons, and its outer curve into
  // view too. This overrides the smaller frame scroll padding.
  // Stays a class to come after the scroll-padding of `carouselFrameClass`,
  // which it replaces.
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
        return "flex isolate ui-segment-group";
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
      return "ui-tab-list--layout-stretch after:hidden [&>.ui-control]:basis-0 [&>.ui-control]:min-w-0 [&>.ui-control]:grow [&>.ui-control]:[--stretch-px-scale:0.75]";
    },
    /**
     * Fades the tabs at each end of a list that scrolls while more tabs lie
     * that way, and fully behind a visible scroll button. The color of a strip
     * or a segmented list stays, but a border on a strip, such as a divider
     * below the tabs, fades with them. A segmented list without padding doesn't
     * scroll, so it has no fades. Defaults to `true`.
     */
    $fade: {
      true: "ui-carousel-faded ui-tab-list--fade-true",
      false: "ui-carousel-no-fade",
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
  class: "ui-tab-list-carousel",
  defaultVariants: {
    $kind: "row",
    // The strip reaches over the root padding and edge, where the fade and the
    // scroll buttons start.
    $bleed: "calc(var(--tabs-padding) + var(--tabs-bordering))",
  },
});

const tabRowSticky = cx(
  "ui-tab-row--sticky",
  // Forced colors drop shadows, so a border draws the edge there, and the frame
  // keeps its cover in the canvas color, which also covers the content behind
  // the tabs and in the margin above the row.
  // Stays a class to come after the classes of a caller, so that the forced
  // colors rule still applies.
  "forced-colors:after:border-(length:--tabs-bordering)",
  "forced-colors:after:forced-color-adjust-none forced-colors:after:border-[CanvasText]",
  "forced-colors:after:shadow-[0_0_0_100vmax_Canvas]",
  // With a glider in the strip, the row follows the selected box like the
  // panels do, so the corners of the frame change with the box while it
  // travels. The frame is a pseudo-element, so it takes the corners from the
  // row by inheritance. The parts of the row reset them, so a frame of the
  // travel restyles those parts but not the tabs inside them. The place of the
  // box counts the parts of the row before and after the strip, so a control
  // there keeps the corners round, and they shrink with a control that folds
  // away. The row is the parent of the strip, so the glider of the strip still
  // finds the followers of the tabs, the row included.
  gliderHolder,
  // Stays a class to keep its order with the classes of the elements that it
  // styles.
  "[&>*]:[--tab-row-corner-s:initial] [&>*]:[--tab-row-corner-e:initial]",
  "[&>*]:[--tab-row-radius-s:initial] [&>*]:[--tab-row-radius-e:initial]",
);

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
  class: "ui-glider-row ui-tab-row ui-tabs-float",
  variants: {
    /**
     * Keeps the row at the top of the scroll area while the page scrolls the
     * panels under it. A frame below the row then keeps the edge and the
     * corners of the panels in view, down to the end of the scroll area, and
     * the strip color covers the content that scrolls past the frame. The tabs
     * are at least as tall as the scroll area, so short panels fill the frame.
     * Use it for tabs that fill a page down to its end, with
     * `$outerEdge={false}` and `$darken={false}` on `tabs`, because the outer
     * edge would scroll with the page, and the cover has the strip color. The
     * scroll area is the screen, or a size container, between the sticky bars
     * of a shell. Another scroll area can set `--scrollport-height`,
     * `--scrollport-start`, and `--scrollport-end`. To keep a space around the
     * row and the frame, set `$m` on `tabs`. That space takes presses above the
     * row and below the frame, so a press there doesn't reach the content that
     * the strip color covers. The row covers the start of the scroll area, and
     * CSS can't give its height to the panels, so a control that gets the focus
     * can stay under the row. Give the scroll area a start scroll padding, such
     * as `scroll-pbs-*` on the page or on the size container, a little taller
     * than the row and the space above it, so the browser scrolls a focused
     * control into the frame. Leave room there for the focus ring and for the
     * border and the padding of a field. With `$m`, also give the scroll area
     * an end scroll padding as tall as that margin, such as `scroll-pbe-*`,
     * because the margin below the frame covers the content too. The frame also
     * covers the edge of the panels, where their focus ring would be, so give
     * each tab panel a tab stop, such as a field. Ariakit then keeps the focus
     * off the tab panel. Defaults to `false`.
     */
    $sticky: {
      true: tabRowSticky,
      false: "relative",
    },
  },
  defaultVariants: {
    $sticky: false,
  },
});

// Like the tabs, a part of a tab row moves onto a root edge wider than the
// space above it, and keeps its corners concentric with the root there.
const TAB_ROW_PART_MARGIN = "calc(-1 * var(--tabs-merge))";

const tabRowPart = cx(
  "ui-tab-row-part",
  // Stays a class to come after the margin of `control`, which it replaces.
  "[&.ak-frame]:mb-0",
);

/**
 * A button in a `tabRow`, beside the tab strip. It looks like a tab that is not
 * selected: the same height, text strength, hover surface, and corners. Set the
 * same `$kind` as the tabs.
 */
export const tabRowButton = cv({
  extend: [tab],
  class: tabRowPart,
  defaultVariants: {
    $m: TAB_ROW_PART_MARGIN,
  },
});

/**
 * A static part of a `tabRow`, such as a logo or a title beside the tab strip.
 * It has the box of a folder tab that is not selected: the same padding, and a
 * clear border with the width of the root edge. Its slots and text then line up
 * with those of the tabs and the buttons in the row when they have the same
 * `$p`. It has no hover surface and no focus.
 */
export const tabRowFrame = cv({
  extend: [slotFrame],
  class: [
    "ui-tab-row-frame",
    tabRowPart,
    "ak-frame-bordering-inherit ak-frame-backdrop",
  ],
  defaultVariants: {
    $p: TAB_FOLDER_PADDING,
    $m: TAB_ROW_PART_MARGIN,
  },
});

/**
 * A panel surface whose top edge and corners join the selected tab. It shows a
 * focus ring on its edge when it, or a tab panel in it, has the keyboard focus.
 */
export const tabPanels = cv({
  extend: [frame, focus],
  class: [
    "ui-tab-panels",
    // The root sets the meet when the selection moves to or from an outer
    // folder. The panels read it, but their content doesn't, so the panels
    // reset it for their children. Otherwise, Chrome restyles all the content
    // of the panels, which inherits the change.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "[&>*]:[--tabs-meet:initial] [&>*]:[--tabs-meet-end:initial]",
    tabsBorder,
    // With a glider in the strip, a selected folder is where the box is. A
    // first folder sits at twice the meet from the start of the strip, so the
    // corners take the meet from the place of the box, and change with it
    // while it travels. Other selected tabs don't meet the panel.
    gliderFollower,
  ],
  variants: {
    // A tab panel without a tab stop inside takes the keyboard focus, so the
    // panels show its ring then too, like focusWithin for a control with a
    // nested input.
    $focus: {
      1: "ui-tab-panels--focus-1",
      true: "ui-tab-panels--focus-true",
      2: "ui-tab-panels--focus-2",
      3: "ui-tab-panels--focus-3",
    },
  },
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
    $focus: true,
    $focusOffset: "unset",
  },
  refine({ variants, addClass }) {
    if (!inheritsTabsBorder(variants)) return;
    // The root layer, which is the strip color, is the backdrop by default.
    // Under an edge hidden at rest, the border lies on the hidden root ring,
    // outside the root, so it paints the layer around the root.
    addClass(
      "ak-frame-bordering-inherit ak-frame-backdrop [.ui-tabs-edge-hidden-at-rest>&]:ak-frame-backdrop-(--tabs-layer)",
    );
  },
});
