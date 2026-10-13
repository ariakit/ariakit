import { cv } from "clava";
import { control, controlLabel, controlSlot } from "./control.ts";
import { isLayerColor } from "./layer.ts";

/** A compact badge with a tinted surface and rounded edge. */
export const badge = cv({
  extend: [control],
  class: [
    "font-medium",
    // Keep badges aligned with surrounding text while allowing flex and grid
    // placement.
    "inline-flex",
    // Keep one-line counts at least square, including padding and borders.
    "min-w-[calc(1lh+(var(--ak-frame-padding,0px)+var(--ak-frame-border,0px))*2)]",
  ],
  defaultVariants: {
    $layer: true,
    $rounded: "full",
    $size: "xs",
    $p: 1,
    $px(defaultValue, variants) {
      // Replace only the text frame default; explicit padding still wins.
      if (defaultValue !== "md") return defaultValue;
      if (variants.$rounded === "full") return "lg";
      return defaultValue;
    },
    $border: true,
    $borderType: "inset",
    $edgeWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$edgeRaw) return defaultValue;
      // Colored badges keep a tinted edge; neutral badges show it only at high
      // contrast.
      if (isLayerColor(variants.$layer)) return "medium";
      return "adaptive";
    },
    $edge(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? variants.$layer;
    },
    $edgeHue(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // Copy the layer hue unless the caller chose a different edge color. The
      // computed $edge may not be resolved yet.
      if (variants.$edge != null && variants.$edge !== variants.$layer) {
        return defaultValue;
      }
      return variants.$hue;
    },
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // Only neutral badges shift away from their parent surface.
      if (variants.$layer === "transparent") return false;
      if (isLayerColor(variants.$layer)) return false;
      return true;
    },
    $mix(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // Blend colored badges into the parent surface for a lighter tint.
      return defaultValue ?? 15;
    },
    $text: true,
    $textPush: 60,
    $textWarm: 20,
    $textChroma(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? "vivid";
    },
  },
  refine({ variants, addClass }) {
    if (!isLayerColor(variants.$layer)) return;
    if (variants.$edgeRaw) return;
    if (variants.$edgeLightnessMin != null) return;
    if (variants.$edgeLightnessMax != null) return;
    // Keep low-contrast hues such as yellow distinct from their tinted surface
    // with a minimum 40-point lightness difference.
    addClass("ak-light:ak-edge-max-l-60 ak-dark:ak-edge-min-l-60");
  },
});

/** Badge text with capital-height alignment. */
export const badgeLabel = cv({
  extend: [controlLabel],
  class: [
    // Trim browser-dependent font metrics to center the capitals. Padding
    // restores the line height only where text-box is supported; untrimmable
    // elements still gain padding.
    // https://github.com/ariakit/ariakit/issues/7592
    "[text-box:cap_alphabetic] supports-[text-box:cap_alphabetic]:py-[calc((1lh-1cap)/2)]",
    // Compensate for padding rounded down to the browser layout unit.
    "min-h-lh",
  ],
  variants: {
    /**
     * Truncates the label to one line with an ellipsis. Uses `overflow-x: clip`
     * because Firefox does not trim scroll containers created by `overflow:
     * hidden`.
     */
    $truncate(value?: boolean) {
      if (!value) return;
      // Without a scroll container, the flex item needs an explicit minimum
      // width.
      return "min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap";
    },
  },
});

/** A text-aligned slot for badge icons and other content. */
export const badgeSlot = controlSlot;
