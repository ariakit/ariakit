import { cv } from "clava";
import type { VariantProps } from "clava";
import { control, controlLabel, controlSlot } from "./control.ts";
import { isEdgeColor } from "./edge.ts";
import type { layer } from "./layer.ts";

/**
 * Checks whether a `$layer` value tints the badge. `"ghost"` is the one
 * string the layer accepts that is not a color: it clears the layer instead
 * of coloring it, so a ghost badge takes the plain treatment.
 */
function isColoredLayer(value: VariantProps<typeof layer>["$layer"]) {
  return typeof value === "string" && value !== "ghost";
}

export const badge = cv({
  extend: [control],
  class: "font-medium",
  defaultVariants: {
    $rounded: "full",
    $size: "xs",
    $p: 1,
    $px: "lg",
    $gap: "lg",
    $border: true,
    $borderType: "inset",
    $edgeWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A colored badge carries a visible tinted ring. A plain one keeps the
      // adaptive hairline, which shows up only in high-contrast mode.
      if (isColoredLayer(variants.$layer)) return "medium";
      return "adaptive";
    },
    $edge(defaultValue, variants) {
      if (!isEdgeColor(variants.$layer)) return defaultValue;
      return defaultValue ?? variants.$layer;
    },
    $lightnessOffset(defaultValue, variants) {
      // A colored badge paints its own color, so it must not shift off it.
      // A plain badge has no color of its own and lifts off the surface it
      // sits on instead.
      if (isColoredLayer(variants.$layer)) return defaultValue ?? false;
      return defaultValue ?? true;
    },
    $mix(defaultValue, variants) {
      if (!isColoredLayer(variants.$layer)) return defaultValue;
      // Blend the color back toward the surface behind it, so a colored
      // badge reads as a tint rather than a solid fill.
      return defaultValue ?? 15;
    },
    $text: true,
    $textPush: 60,
    $textWarm: 20,
    $textChroma(defaultValue, variants) {
      if (!isColoredLayer(variants.$layer)) return defaultValue;
      return defaultValue ?? "vivid";
    },
  },
});

export const badgeLabel = controlLabel;

export const badgeSlot = controlSlot;
