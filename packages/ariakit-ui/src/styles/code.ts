import { cv } from "clava";
import { edge } from "./edge.ts";
import { isLayerColor } from "./layer.ts";

// A code chip drawn in em, so it scales with the text it sits in.
export const code = cv({
  extend: [edge],
  class: [
    // A code element is monospace by default, but the chip sits inside body
    // text. The adjust pins its x-height, so the chip keeps one optical size
    // whichever monospace font the platform falls back to.
    "font-mono [font-size-adjust:0.48]",
    "px-1 py-[0.18em] rounded ring",
    // The layer colors the ring on a chip that has one. A chip without a layer
    // takes the edge color of the surface around it instead of the full-alpha
    // text color that the ring falls back to.
    "ring-(--ak-edge)",
    // A long token breaks where it would overflow its line, and every fragment
    // keeps its padding, radius and ring. Breaking only on overflow keeps the
    // chip's min-content width, so an auto-sized column does not shrink around
    // it.
    "wrap-break-word box-decoration-clone",
  ],
  defaultVariants: {
    // The chip separates from the surface around it. A transparent chip keeps
    // its ring only, and a colored chip paints its own color, so it must not
    // shift off it. Without a layer there is no surface to shift.
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
      // Blend the color back toward the surface behind it, so a colored chip
      // reads as a tint rather than a solid fill.
      return defaultValue ?? 15;
    },
  },
  refine({ variants, addClass }) {
    // The layer sets a text color on the element it paints. A neutral chip is a
    // small offset of the surface around it, so it keeps the ink of the
    // surrounding text, such as a link color. A colored or inverted chip has a
    // surface of its own, and the ink the layer computes for it is the readable
    // one.
    if (variants.$invert) return;
    if (isLayerColor(variants.$layer)) return;
    addClass("text-inherit");
  },
});
