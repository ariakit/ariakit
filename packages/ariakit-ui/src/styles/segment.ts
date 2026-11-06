import { cv, cx } from "clava";
import { frame } from "./frame.ts";
import { hasSelectedSurface, selected } from "./selected.ts";

/** Checks whether an item `$kind` is one of the segmented kinds. */
export function isSegmentedKind(kind?: string) {
  if (kind === "segmented") return true;
  return kind === "segmented-flat";
}

// ui-selected reads the state from the element or from a native input in a
// label, so every host shares these rules.
const segmentBase = cx(
  // Only the selected segment paints at rest. Hover restores the layer.
  "not-ui-selected:bg-transparent",
  "not-ui-selected:ak-layer-color-(--ak-layer-parent)",
  "not-ui-selected:ak-layer-lighten-0",
  "not-ui-selected:ak-layer-offset-0",
  "not-ui-selected:ui-hover:bg-(--ak-layer)",
  // A press can't change a settled segment, so its surface doesn't react. It
  // keeps its selected offset, which the hover state would otherwise replace.
  "ui-settled:ui-hover:ak-state-(--selected-offset,0)",
  // Segments size to their text, so a heavier thumb would move the segments
  // after it. Only a label with data-text turns heavier, because it keeps that
  // width. This sorts after the zero-specificity button weight, so it wins, and
  // a weight class on the segment still wins over both.
  "ui-base:font-normal",
);

/** The classes of each segmented kind, for extenders that replace `$kind`. */
export const segmentKindClasses = {
  // The bevel without the button states, which would react to hover and press.
  segmented: cx(segmentBase, "ui-selected:ui-bevel"),
  "segmented-flat": segmentBase,
};

/**
 * Adds the segmented kinds to a button-like item. The selected item is the
 * thumb of a `segmentGroup`.
 */
export const segment = cv({
  extend: [frame, selected],
  variants: {
    /**
     * Sets the selected surface: `segmented` raises the thumb with a bevel, and
     * `segmented-flat` keeps it flat with a shadow. Both lighten the thumb.
     */
    $kind: segmentKindClasses,
    /**
     * Casts a large shadow from the selected surface, which the group clips.
     * It's on by default for `segmented-flat`.
     */
    $selectedShadow:
      "ui-selected:shadow-[0_2px_2em_oklch(0_0_0/0.3)] ak-dark:ui-selected:shadow-[0_2px_2em_oklch(0_0_0/0.9)]",
  },
  defaultVariants: {
    // Computed defaults run after static ones, so these replace the defaults of
    // extenders, such as a tab. Caller values still win.
    $layer(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      return "var(--segmented-surface)";
    },
    $lightnessOffset(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      return false;
    },
    // Idle segments dim their text, which inherits into slots. Hover and the
    // thumb restore full ink.
    $ink(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      return defaultValue ?? 80;
    },
    $selectedInk(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      return defaultValue ?? 100;
    },
    $selectedPush(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      return false;
    },
    $selectedShadow(defaultValue, variants) {
      if (variants.$kind !== "segmented-flat") return defaultValue;
      return defaultValue ?? true;
    },
    $lighten(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      if (variants.$layer !== "var(--segmented-surface)") return false;
      if (variants.$invert) return false;
      // An offset darkens the thumb on light surfaces, so it replaces the lift.
      if (hasSelectedSurface(variants)) return false;
      return true;
    },
    $rounded(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      if (defaultValue !== "unset") return defaultValue;
      return "md";
    },
    // The edge shows only in high contrast, unless the caller sets a weight.
    $border(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      return defaultValue ?? true;
    },
    $edgeWeight(defaultValue, variants) {
      if (!isSegmentedKind(variants.$kind)) return defaultValue;
      return defaultValue ?? "adaptive";
    },
  },
  refine({ variants, addClass }) {
    if (!isSegmentedKind(variants.$kind)) return;
    if (variants.$invert) {
      // Only the thumb inverts. Idle segments keep the color of the group, so
      // their text stays readable on it.
      addClass([
        "not-ui-selected:[--layer-lightness-multiplier:1]",
        "not-ui-selected:ak-layer-push-0",
        // The lightness bounds of an inverted surface would move the idle layer
        // away from the group, such as from a black group in high contrast.
        "not-ui-selected:ak-layer-min-0",
        "not-ui-selected:ak-layer-max-100",
      ]);
    }
    if (variants.$edgeWeight === "adaptive") {
      addClass([
        "not-ui-selected:border-transparent",
        "not-ui-selected:ring-0",
        // Forced colors paint a transparent border, which would hide the only
        // mark of the selected segment. This includes disabled segments, which
        // otherwise take the system disabled color.
        "not-ui-selected:forced-colors:border-[Canvas]!",
        // Extenders can keep a faint edge on disabled items.
        "[--disabled-border:transparent]!",
      ]);
      return;
    }
    // Segments with visible edges keep them while disabled, so the row of cells
    // stays closed.
    addClass([
      "[--disabled-border:var(--ak-edge)]",
      // Every cell has an edge and the fill fades in high contrast, so a second
      // edge pixel marks the selected cell. High contrast widens it and moves
      // its color to the text color. Forced colors remove shadows and fills but
      // keep outlines, so an inset outline marks it there.
      "inset-ring-[color-mix(in_oklab,currentColor_calc(var(--contrast)*1%),var(--ak-edge))]",
      "ui-selected:inset-ring-[calc(1px+var(--contrast)*0.01px)]",
      "ui-selected:forced-colors:outline-2",
      // The focus ring replaces this mark, so focus stays visible.
      "ui-selected:forced-colors:not-ui-focus-visible-within:-outline-offset-4",
    ]);
  },
});

/**
 * The classes of the segmented group kind, for extenders that replace `$kind`.
 */
export const segmentGroupClass = cx(
  // The thumb takes the surface around the group, so it stands out from the
  // darker group on light and dark surfaces.
  "[--segmented-surface:var(--ak-layer-parent)]",
  // Zero specificity lets the stretch layout and caller widths win.
  "ui-base:w-fit",
);

/**
 * Adds the segmented kind to a group of segments. A group with padding that
 * doesn't fit its container scrolls, so every segment stays reachable. A
 * stretched group shares its width and truncates labels instead. Without
 * padding, scrolling would clip focus rings, so the group doesn't scroll,
 * except a horizontal `Nav`, which always scrolls.
 */
export const segmentGroup = cv({
  extend: [frame],
  variants: {
    /**
     * Holds segmented items on a darker surface that clips their shadow. Set
     * `$layer="transparent"` for an edge instead of the surface, or `$border`
     * for an edge around it.
     */
    $kind: {
      segmented: segmentGroupClass,
    },
  },
  defaultVariants: {
    $layer(defaultValue, variants) {
      if (variants.$kind !== "segmented") return defaultValue;
      return true;
    },
    $darken(defaultValue, variants) {
      if (variants.$kind !== "segmented") return defaultValue;
      // Replaces the default of extenders, such as a tab list.
      if (variants.$layer !== true) return false;
      return defaultValue ?? 0.5;
    },
    // The group clips at its padding box, and a focus ring reaches 3px past a
    // segment at any text size, so this is the smallest padding that fits it.
    $p(defaultValue, variants) {
      if (variants.$kind !== "segmented") return defaultValue;
      return "3px";
    },
    $border(defaultValue, variants) {
      if (variants.$kind !== "segmented") return defaultValue;
      // The edge is all that marks a group without a surface.
      return defaultValue ?? variants.$layer === "transparent";
    },
    $edgeWeight(defaultValue, variants) {
      if (variants.$kind !== "segmented") return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      return defaultValue ?? "light";
    },
  },
  refine({ variants, addClass }) {
    if (variants.$kind !== "segmented") return;
    // Without padding, the focus ring of a cell reaches past the group, and
    // nothing can clip the shadow of the thumb.
    if (variants.$p === "none") {
      addClass("[&>.control]:ui-selected:shadow-none");
      return;
    }
    // Scrolling also clips the shadow at the padding box. The focus ring fits
    // in the padding.
    addClass([
      // A group with no overflow stays still under a sideways swipe.
      "max-w-full overflow-x-auto overflow-y-clip overscroll-x-none",
      "scrollbar-none scroll-px-(--ak-frame-padding)",
      // Segments keep their width, so the group scrolls instead of truncating
      // them. Stretched segments start at zero width, so this doesn't stop them
      // from sharing the row.
      "[&>.control]:shrink-0",
    ]);
  },
});
