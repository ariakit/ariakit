import { cv } from "clava";
import { control, controlLabel, controlSlot } from "./control.ts";
import { isLayerColor } from "./layer.ts";

export const badge = cv({
  extend: [control],
  class: [
    "font-medium",
    // A badge sits in a line of text as often as in a row of items, so it keeps
    // its content width and the baseline of the text around it. A flex or grid
    // parent lays it out as any other item.
    "inline-flex",
  ],
  defaultVariants: {
    $rounded: "full",
    $size: "xs",
    $p: 1,
    $px: "lg",
    $border: true,
    $borderType: "inset",
    $edgeWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // $edgeRaw asks for the edge color exactly as given.
      if (variants.$edgeRaw) return defaultValue;
      // A colored badge carries a tinted ring that always shows. A plain one
      // keeps the adaptive hairline, which shows up only in high-contrast mode.
      if (isLayerColor(variants.$layer)) return "medium";
      return "adaptive";
    },
    // A colored badge rings itself in its own color, and the edge push default
    // for a named color keeps that color's lightness. A plain badge has no
    // color of its own, so its ring takes the full push away from the surface,
    // where any weight shows.
    $edge(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? variants.$layer;
    },
    $edgeHue(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // The ring copies the layer color, not the layer, so a hue set on the
      // layer has to reach the ring on its own. An edge color passed by the
      // caller keeps its own hue. The computed $edge above may still be unset
      // here, so only a present, different value counts as the caller's.
      if (variants.$edge != null && variants.$edge !== variants.$layer) {
        return defaultValue;
      }
      return variants.$hue;
    },
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A transparent badge has nothing to lift off, and a colored badge paints
      // its own color, so it must not shift off it. A plain badge has no color
      // of its own and lifts off the surface it sits on instead.
      if (variants.$layer === "transparent") return false;
      if (isLayerColor(variants.$layer)) return false;
      return true;
    },
    $mix(defaultValue, variants) {
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // Blend the color back toward the surface behind it, so a colored badge
      // reads as a tint rather than a solid fill.
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
    // The tinted edge keeps the color's own lightness, at a fifth of its alpha
    // over a pale tint of the same hue. A light hue such as yellow all but
    // vanishes there, so the edge stays at least 40% of the lightness scale
    // away from the surface, on whichever side the surface is. One rule for
    // every hue, and no hue is a special case.
    addClass("ak-light:ak-edge-max-l-60 ak-dark:ak-edge-min-l-60");
  },
});

export const badgeLabel = controlLabel;

export const badgeSlot = controlSlot;
