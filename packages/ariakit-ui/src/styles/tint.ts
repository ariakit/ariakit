import { cv } from "clava";
import { isLayerColor, layer } from "./layer.ts";
import { text } from "./text.ts";

/**
 * Colors for a surface with a `tint` or a `solid` kind. Each kind only changes
 * the default of other variants, so these still override it. An extender sets
 * the default kind and the layer color of each kind.
 */
export const tint = cv({
  extend: [layer, text],
  variants: {
    /**
     * Sets how the surface is painted. `tint` blends the `$layer` color into
     * the parent surface and colors the text and the icons inside. `solid`
     * fills the surface with the `$layer` color.
     */
    $kind: { tint: "", solid: "" },
  },
  defaultVariants: {
    $mix(defaultValue, variants) {
      if (variants.$kind !== "tint") return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // Blend colored surfaces into the parent surface for a lighter tint.
      return defaultValue ?? 15;
    },
    $text(defaultValue, variants) {
      if (variants.$kind !== "tint") return defaultValue;
      return defaultValue ?? true;
    },
    $textPush(defaultValue, variants) {
      if (variants.$kind !== "tint") return defaultValue;
      return defaultValue ?? 20;
    },
    $textWarm(defaultValue, variants) {
      if (variants.$kind !== "tint") return defaultValue;
      return defaultValue ?? 20;
    },
    $textChroma(defaultValue, variants) {
      if (variants.$kind !== "tint") return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? "vivid";
    },
  },
});
