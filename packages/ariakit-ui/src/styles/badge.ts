import { cv } from "clava";
import { control, controlLabel, controlSlot } from "./control.ts";
import { isFrameBorderColor } from "./frame.ts";

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
    $borderWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // Legacy colored ak-badge-* always drew a visible tinted ring
      // (ak-edge-20); plain badges keep the adaptive high-contrast-only
      // hairline, which legacy plain ak-badge had no equivalent for.
      if (typeof variants.$layer === "string") return "medium";
      return "adaptive";
    },
    $text: true,
    $textPush: 60,
    $textWarm: 20,
    $textChroma(defaultValue, variants) {
      if (typeof variants.$layer !== "string") return defaultValue;
      return defaultValue ?? "vivid";
    },
    $lightnessOffset(defaultValue, variants) {
      if (typeof variants.$layer === "string") return false;
      return defaultValue ?? true;
    },
    $mix(defaultValue, variants) {
      if (typeof variants.$layer !== "string") {
        return defaultValue;
      }
      return defaultValue ?? 15;
    },
    $borderColor(defaultValue, variants) {
      if (typeof variants.$layer !== "string") return defaultValue;
      if (!isFrameBorderColor(variants.$layer)) return defaultValue;
      return defaultValue ?? variants.$layer;
    },
  },
});

export const badgeLabel = controlLabel;

export const badgeSlot = controlSlot;
