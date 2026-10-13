import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import {
  disclosure,
  disclosureButton,
  disclosureContentBody,
} from "./disclosure.ts";
import { edge } from "./edge.ts";
import { layer } from "./layer.ts";
import { textFrame } from "./text-frame.ts";

// Lightness offsets for counter chips and empty check slots. Plain bullets and
// dashes have no surface offset.
const COUNTER_LIGHTNESS = 2.5;
const SLOT_LIGHTNESS = 1;

/** A list with adaptive item spacing, markers, and optional guides. */
export const list = cv({
  class: [
    "list grid gap-(--list-gap) [counter-reset:list]",
    "[--list-gap-base:var(--list-gap-root,--spacing(4))]",
    // Prose supplies the default gap. Explicit `$gap` wins through the style
    // attribute; nested lists win by specificity.
    "in-[.prose]:[--list-gap-base:var(--list-gap-root,var(--prose-gap))]",
    "[--list-item-padding:--spacing(1)]",
    "[--list-gap:calc(var(--list-gap-base)*0.5-var(--list-item-padding))]",
    "[--list-item-gap:calc(var(--list-gap)+var(--list-item-padding)*0.5)]",
    // Nested lists halve the base gap. This selector outranks the prose rule.
    "[:is(&_&)]:[--list-gap-base:calc(var(--list-gap-root,--spacing(4))*0.5)]",
    // Reset inherited flags so nested lists start with their own state.
    "[--list-blocks:0] [--list-last-row:0]",
    "[&>li:last-of-type]:[--list-last-row:1]",
    // A surface-colored halo hides the guide around each marker.
    "[--list-guide-gap:--spacing(1)]",
    // Block content increases item spacing; nested lists inherit this mode.
    "ui-list-blocks:[--list-blocks:1]",
    "ui-list-blocks:[--list-item-padding:--spacing(2)]",
    "ui-list-blocks:[--list-gap:calc(var(--list-gap-base)*0.75-var(--list-item-padding))]",
    // The sections variant is registered last, so its gap overrides block
    // mode.
    "ui-list-sections:[--list-gap:calc(var(--list-gap-base)*1-var(--list-item-padding))]",
  ],
  variants: {
    /**
     * Uses numbered markers by default. The component chooses the list element.
     */
    $ordered: {
      true: "",
      false: "",
    },
    /**
     * Sets the row marker: `counter`, `bullet`, or `dash`. Defaults to counters
     * for ordered lists, bullets when `$guide` is `true`, and dashes otherwise.
     */
    $marker: {
      counter: "[--list-marker:counter] [--list-counter:1] [--list-glyph:0]",
      bullet: "[--list-marker:bullet] [--list-counter:0] [--list-glyph:1]",
      dash: "[--list-marker:dash] [--list-counter:0] [--list-glyph:1]",
    },
    /**
     * Joins adjacent markers with a guide. `auto` enables guides for counters
     * in block mode.
     */
    $guide: {
      auto: "[--list-guide:calc(var(--list-counter)*var(--list-blocks))]",
      true: "[--list-guide:1]",
      false: "[--list-guide:0]",
    },
    /**
     * Sets the base gap between items before the mode formulas apply. A nested
     * list halves it. Numbers scale the spacing token.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-gap-root": getSpacingValue(value) },
      };
    },
    /** Sets the item frame padding. Numbers scale the spacing token. */
    $itemPadding(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-item-padding": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $ordered: false,
    $guide: "auto",
    // Always resolve the marker to reset inherited list flags.
    $marker(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$ordered) return "counter";
      if (variants.$guide === true) return "bullet";
      return "dash";
    },
  },
});

/** Shared padding and line height for list items and disclosure rows. */
const listRow = cv({
  extend: [textFrame],
  class: [
    "relative",
    // Freeze line height as a length so larger child text stays aligned with
    // the marker.
    "leading-[1lh]",
    // Copy the non-inheriting frame border into a channel the guide can
    // inherit.
    "[--list-row-border:var(--ak-frame-border)]",
  ],
  defaultVariants: {
    $layer: false,
    $rounded: "xl",
    $p: "var(--list-item-padding)",
  },
});

/** A list row with space for a marker and optional block content. */
export const listItem = cv({
  extend: [listRow],
  class: [
    // Reserve one line box for the marker plus the control text inset. The
    // longhand overrides frame padding by stylesheet order.
    "ps-[calc(var(--px)+1lh)]",
    "ui-list-item-blocks:grid ui-list-item-blocks:gap-(--list-item-gap)",
  ],
});

/** A layout-free wrapper for list content. Use a span to avoid block mode. */
export const listItemContent = cv({
  // Markers must come first: Firefox and Safari otherwise read nested counters.
  // This wrapper restores :first-child for content. Use a span; a div would
  // force block mode.
  class: "contents",
});

/** A list marker that can show a number, bullet, dash, check, or progress. */
export const listItemMarker = cv({
  extend: [edge],
  class: [
    "list-marker absolute pointer-events-none grid place-items-center",
    // Match the checkbox stroke so checks remain clear inside a filled marker.
    "[&>svg]:size-[60%] [&>svg]:stroke-3",
    // The halo hides the guide behind each marker, regardless of its shape.
    "z-3 outline-(--ak-layer-parent) outline-(length:--list-guide-gap,0px)",
    // Preserve a canvas-colored halo and system-colored marks; automatic
    // forced colors would remove fills and thicken the halo.
    "forced-colors:forced-color-adjust-none forced-colors:outline-[Canvas]",
    "forced-colors:[--ak-edge:CanvasText]",
    // Bullets and dashes override these marker dimensions by stylesheet order.
    "[--list-marker-inset:0.2em]",
    "[--list-marker-size:calc(1lh-var(--list-marker-inset)*2)]",
    "top-(--ak-frame-padding) inset-s-(--ak-frame-padding) m-(--list-marker-inset)",
    // Outside a list, ignore inherited frame padding and fill the one-line
    // host.
    "not-in-[.list]:top-0 not-in-[.list]:inset-s-0",
    "w-(--list-marker-size) h-(--list-marker-size) rounded-full",
    "ui-list-counter:[counter-increment:list]",
    "ui-list-counter:before:content-[counter(list)]",
    "ui-list-counter:before:absolute ui-list-counter:before:inset-0",
    "ui-list-counter:before:text-center ui-list-counter:before:font-semibold",
    "ui-list-counter:before:leading-(--list-marker-size)",
    "ui-list-counter:before:[font-size-adjust:0.45]",
    // Counters override the thick progress arc with a thin ring around the
    // number.
    "[--progress-thickness:calc(30%+0.25%*var(--contrast,0))]",
    "ui-list-counter:[--progress-thickness:0.15em]",
  ],
  variants: {
    /**
     * Sets the check state: `"none"` shows the plain marker, `false` an empty
     * slot, and `true` a completed slot. Defaults to `"none"` unless
     * `$progress` is set.
     */
    $checked: {
      none: [
        "forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
        "forced-colors:ui-list-counter:ring forced-colors:ui-list-counter:ring-inset",
        "ui-list-dash:top-[calc(0.5lh+var(--ak-frame-padding))]",
        "ui-list-dash:inset-s-[calc(0.25lh+var(--ak-frame-padding))]",
        "ui-list-dash:w-[0.5lh] ui-list-dash:h-auto",
        "ui-list-dash:m-0 ui-list-dash:rounded-none ui-list-dash:border-b",
        // Use a filled disc; thick rounded borders can leave a hole. The size
        // equals seven pixels at a 16px font size.
        "[--list-bullet-size:0.4375em]",
        "ui-list-bullet:top-[calc(0.5lh-var(--list-bullet-size)/2+var(--ak-frame-padding))]",
        "ui-list-bullet:inset-s-[calc(0.5lh-var(--list-bullet-size)/2+var(--ak-frame-padding))]",
        "ui-list-bullet:w-(--list-bullet-size) ui-list-bullet:h-(--list-bullet-size)",
        // Paint the translucent edge over the marker surface so the guide
        // cannot show through.
        "ui-list-bullet:m-0 ui-list-bullet:bg-linear-to-b",
        "ui-list-bullet:from-(--ak-edge) ui-list-bullet:to-(--ak-edge)",
      ],
      true: [
        "before:hidden",
        "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
      ],
      false: [
        "ring ring-inset ui-list-counter:ring-0",
        "forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
        "forced-colors:ui-list-counter:ring",
      ],
    },
    /**
     * Sets the progress between `0` and `1` shown by the circular fill child.
     */
    $progress(value?: number | string) {
      if (value == null) return;
      return {
        style: { "--progress-value": `${value}` },
      };
    },
  },
  defaultVariants: {
    $checked(_defaultValue, variants) {
      if (variants.$progress == null) return "none";
      return Number(variants.$progress) === 1;
    },
    $layer(defaultValue, variants) {
      if (variants.$checked !== true) return defaultValue;
      // Replace only the layer recipe's default; preserve explicit extender
      // defaults.
      if (defaultValue !== true) return defaultValue;
      return "brand";
    },
    $contrast(defaultValue, variants) {
      if (variants.$checked !== true) return defaultValue;
      return defaultValue ?? 50;
    },
    $lightnessOffset(defaultValue, variants) {
      if (variants.$checked === true) return defaultValue;
      // CSS flags select the marker surface because class variants cannot
      // override a style attribute. Zero fallbacks support standalone markers.
      return (
        defaultValue ??
        (variants.$checked === false
          ? `calc(var(--list-counter, 0) * ${COUNTER_LIGHTNESS} + var(--list-glyph, 0) * ${SLOT_LIGHTNESS})`
          : `calc(var(--list-counter, 0) * ${COUNTER_LIGHTNESS})`)
      );
    },
    $edgeWeight(defaultValue, variants) {
      if (variants.$checked === true) return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      return defaultValue ?? (variants.$checked === false ? 25 : "bold");
    },
  },
});

/** A line between list markers that fades after the final item. */
export const listItemGuide = cv({
  extend: [layer],
  class: [
    // Keep the guide below markers and above disclosure content.
    "list-guide absolute pointer-events-none z-2",
    "forced-colors:forced-color-adjust-none forced-colors:[--ak-layer:CanvasText]",
    "[--list-guide-width:calc(var(--list-guide,0)*1px)]",
    "w-(--list-guide-width)",
    // Join marker centers across the row, its borders, and the gap. Clamp
    // negative gaps to zero, as grid layout does.
    "top-[calc(var(--ak-frame-padding)+0.5lh)]",
    "inset-s-[calc(var(--ak-frame-padding)+0.5lh-var(--list-guide-width)/2)]",
    "h-[calc(100%+max(0px,var(--list-gap))+var(--list-row-border,0px)*2)]",
    "ui-list-last-row:bg-transparent ui-list-last-row:bg-linear-to-b",
    "ui-list-last-row:from-(--ak-layer)",
    "ui-list-last-row:from-[calc(100%-1rem)]",
    "ui-list-last-row:to-transparent",
    "ui-list-last-row:h-[calc(100%-var(--ak-frame-padding)-0.5lh)]",
  ],
  defaultVariants: {
    // Match the counter chip surface.
    $lightnessOffset: COUNTER_LIGHTNESS,
  },
});

/** A disclosure row with list spacing, a marker, and an optional guide. */
export const listDisclosure = cv({
  // Clava applies the shared frame once. The final listRow supplies radius and
  // padding defaults.
  extend: [disclosure, listRow],
  defaultVariants: {
    // Restore the transparent layer that listRow disables.
    $layer: "transparent",
    // With a guide, indent content to the row text. The unpadded root still
    // supplies the frame channels.
    $indent:
      "calc(var(--py) + (var(--px) - var(--py) + 1lh) * var(--list-guide))",
    $leadingIcon: false,
  },
});

/** A disclosure button aligned with the list marker and text columns. */
export const listDisclosureButton = cv({
  extend: [disclosureButton],
  class: [
    "[--disclosure-ps:calc(var(--px)+1lh)]",
    // Hover and press surfaces cover the guide; the marker stays above both.
    "z-3",
  ],
});

/** Disclosure content with the spacing of other list items. */
export const listDisclosureContentBody = cv({
  extend: [disclosureContentBody],
  class: [
    "grid gap-(--list-item-gap)",
    "in-[.list]:pbs-[calc(var(--list-item-gap)-var(--ak-frame-padding))]",
  ],
});
