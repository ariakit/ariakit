import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";
import { layer } from "./layer.ts";

const progressBase = cv({
  variants: {
    /**
     * Sets the progress between `0` and `1`. The value lives in a registered
     * custom property that inherits, so the fill element can read and
     * transition it.
     */
    $value(value?: number | string) {
      if (value == null) return;
      return {
        style: { "--progress-value": `${value}` },
      };
    },
    /**
     * Sets the track thickness. Numbers scale the spacing token.
     */
    $thickness(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--progress-thickness": getSpacingValue(value) },
      };
    },
  },
});

export const progress = cv({
  extend: [frame, progressBase],
  class: [
    "relative block overflow-clip ring ring-inset",
    // Full width so the track doesn't collapse inside flex parents;
    // constrain with max-w-* since a plain w-* utility loses to it by
    // stylesheet order.
    "w-full",
    "[--progress-thickness:--spacing(2)] h-(--progress-thickness)",
    "[--progress-ring:var(--ak-edge)]",
    // Native <progress> element support, mirroring the wrapper structure.
    "[&::-webkit-progress-bar]:ak-frame [&::-webkit-progress-bar]:ak-layer",
    "[&::-webkit-progress-bar]:ring-(--progress-ring)",
    "[&::-webkit-progress-bar]:ring [&::-webkit-progress-bar]:ring-inset",
    "[&::-webkit-progress-value]:ak-layer",
    "[&::-webkit-progress-value]:ak-layer-brand",
    "[&::-webkit-progress-value]:ak-layer-contrast",
    "[&::-webkit-progress-value]:ak-layer-contrast-50",
    "[&::-webkit-progress-value]:ak-frame",
    "[&::-webkit-progress-value]:block [&::-webkit-progress-value]:h-full",
    "[&::-webkit-progress-value]:starting:w-0!",
    "[&::-webkit-progress-value]:transition-[width]",
    "[&::-webkit-progress-value]:duration-1000",
    "motion-reduce:[&::-webkit-progress-value]:duration-0",
  ],
  defaultVariants: {
    // The track sits well off the surface like the legacy ak-layer-12.
    $lightnessOffset: 2.4,
    $borderWeight: "adaptive",
    $rounded: "full",
    $forceRounded: true,
    $p: "none",
  },
});

export const progressFill = cv({
  extend: [frame],
  class: [
    "block h-full w-[calc(var(--progress-value)*100%)]",
    // Animate from empty on first paint; the registered property makes the
    // width calc transition smoothly.
    "starting:w-0! transition-[width] duration-1000 motion-reduce:duration-0",
  ],
  defaultVariants: {
    $layer: "brand",
    $contrast: 50,
  },
});

export const progressCircular = cv({
  extend: [frame, progressBase],
  class: [
    "relative size-full ring ring-inset",
    "[--progress-thickness:--spacing(2)]",
    "[--progress-layer-parent:var(--ak-layer-parent)]",
    "[--progress-ring:var(--ak-edge)]",
    // The ::after disc paints the parent layer back over the center, leaving
    // only the ring-shaped track visible.
    "after:content-[''] after:absolute after:rounded-full after:ring",
    "after:ak-layer after:ak-layer-color-(--progress-layer-parent)",
    "after:ring-(--progress-ring) after:inset-(--progress-thickness)",
  ],
  defaultVariants: {
    $lightnessOffset: 2.4,
    $borderWeight: "adaptive",
    $rounded: "full",
    $forceRounded: true,
    $p: "none",
  },
});

export const progressCircularFill = cv({
  extend: [layer],
  class: [
    "absolute inset-0 rounded-full bg-transparent",
    // Transitioning the registered value property animates the conic sweep.
    "transition-[--progress-value] duration-1000 motion-reduce:duration-0",
    "starting:[--progress-value:0]!",
    // The feather offsets soften the conic edge and the mask edge by a
    // fraction so the arc doesn't alias.
    "[--feather-px:0.5px] [--feather-deg:1deg]",
    "bg-[conic-gradient(from_0deg,var(--ak-layer)_0turn,var(--ak-layer)_calc(var(--progress-value)*1turn-var(--feather-deg)),transparent_calc(var(--progress-value)*1turn+var(--feather-deg)),transparent_1turn)]",
    // Mask everything but the outer ring so the conic reads as an arc.
    "[mask-image:radial-gradient(farthest-side,transparent_calc(100%-var(--progress-thickness)-var(--feather-px)),#000_calc(100%-var(--progress-thickness)+var(--feather-px)))]",
  ],
  defaultVariants: {
    $layer: "brand",
    $contrast: 50,
  },
});
