import { cv } from "clava";
import { control, controlLabel, controlSlot } from "./control.ts";
import { isLayerColor } from "./layer.ts";

export const badge = cv({
  extend: [control],
  class: "font-medium",
  defaultVariants: {
    $rounded: "full",
    $size: "xs",
    $p: 1,
    $px: "lg",
    $border: true,
    $borderType: "inset",
    $edgePush: 0,
    $edgeWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A colored badge carries a tinted ring that always shows. A plain one
      // keeps the adaptive hairline, which shows up only in high-contrast mode.
      if (isLayerColor(variants.$layer)) return "medium";
      return "adaptive";
    },
    $edge(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? variants.$layer;
    },
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A transparent badge has nothing to lift off, and a colored badge
      // paints its own color, so it must not shift off it. A plain badge has
      // no color of its own and lifts off the surface it sits on instead.
      if (variants.$layer === "transparent") return false;
      if (isLayerColor(variants.$layer)) return false;
      return true;
    },
    $mix(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // Blend the color back toward the surface behind it, so a colored
      // badge reads as a tint rather than a solid fill.
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
    // The tinted edge keeps the color's own lightness, at a fifth of its
    // alpha over a pale tint of the same hue. A light hue such as yellow all
    // but vanishes there, so the edge stays at least 40% of the lightness
    // scale away from the surface, on whichever side the surface is. One
    // rule for every hue, and no hue is a special case.
    addClass("ak-light:ak-edge-max-l-60 ak-dark:ak-edge-min-l-60");
  },
});

export const badgeLabel = controlLabel;

export const badgeSlot = controlSlot;
