import { cv } from "clava";
import { edge } from "./edge.ts";
import { isLayerColor } from "./layer.ts";

/** A code chip that scales with the surrounding text. */
export const code = cv({
  extend: [edge],
  class: [
    // Keep a consistent x-height across platform monospace fonts.
    "font-mono [font-size-adjust:0.48]",
    "px-1 py-[0.18em] rounded ring",
    // A layer supplies the edge channel; raw edges keep their full opacity.
    "ring-(--ak-edge)",
    // Break overflowing tokens without reducing min-content width. Preserve
    // decoration on each fragment.
    "wrap-break-word box-decoration-clone",
  ],
  defaultVariants: {
    // Offset only neutral chips; transparent or colored chips keep their chosen
    // surface.
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!variants.$layer) return;
      if (variants.$layer === "transparent") return false;
      if (isLayerColor(variants.$layer)) return false;
      return true;
    },
    $edgeWeight(defaultValue, variants) {
      // Without a layer, no edge channel reaches the ring. A raw edge keeps its
      // full alpha.
      if (!variants.$layer) return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      return defaultValue ?? 15;
    },
    $mix(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? 15;
    },
  },
  refine({ variants, addClass }) {
    // Neutral chips keep surrounding text colors, such as links. Colored and
    // inverted chips need the layer's contrast-adjusted text.
    if (variants.$invert) return;
    if (isLayerColor(variants.$layer)) return;
    addClass("text-inherit");
  },
});
