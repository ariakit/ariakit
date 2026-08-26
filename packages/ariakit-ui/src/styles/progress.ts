import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";

const progressBase = cv({
  extend: [frame],
  class: "relative",
  variants: {
    /**
     * Sets the progress between `0` and `1`. The value goes to
     * `--progress-value`, which must be registered as an inheriting
     * `<number>` so the fill can transition it.
     */
    $value(value?: number | string) {
      if (value == null) return;
      return {
        style: { "--progress-value": `${value}` },
      };
    },
    /**
     * Sets the track thickness: the bar height, or the ring width when
     * circular. Numbers scale the spacing token.
     */
    $thickness(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--progress-thickness": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $lightnessOffset: 2,
    $borderWeight: "adaptive",
    // A border would grow the track, so the edge is a ring drawn inside it.
    $borderType: "inset",
    $border: true,
    $rounded: "full",
    $forceRounded: true,
    $p: "none",
    $thickness: 2,
  },
});

export const progress = cv({
  extend: [progressBase],
  class: "block overflow-clip h-(--progress-thickness) w-full",
});

export const progressCircular = cv({
  extend: [progressBase],
  class: [
    "size-full",
    // ak-layer on the ::after below recomputes --ak-layer-parent and --ak-edge
    // for the pseudo-element, so the disc reads both from copies taken here.
    "[--progress-layer-parent:var(--ak-layer-parent)]",
    "[--progress-edge:var(--ak-edge)]",
    // The ::after disc paints the parent layer back over the center, leaving
    // only the ring-shaped track visible.
    "after:absolute after:rounded-full",
    "after:ak-layer after:ak-layer-color-(--progress-layer-parent)",
    "after:ring-(length:--border-width) after:ring-(--progress-edge)",
    "after:inset-(--progress-thickness)",
  ],
});

const progressFillBase = cv({
  extend: [frame],
  // The fill animates toward each new value.
  class: "duration-1000 motion-reduce:duration-0",
  defaultVariants: {
    $layer: "brand",
    $contrast: 50,
  },
});

export const progressFill = cv({
  extend: [progressFillBase],
  class: [
    "block h-full w-[calc(var(--progress-value)*100%)]",
    // Animate from empty on first paint; the registered property makes the
    // width calc transition smoothly.
    "starting:w-0! transition-[width]",
  ],
});

export const progressCircularFill = cv({
  extend: [progressFillBase],
  class: [
    "absolute inset-0 rounded-full bg-transparent",
    // Transitioning the registered value property animates the conic sweep.
    "transition-[--progress-value] starting:[--progress-value:0]!",
    // The feather offsets soften the conic edge and the mask edge by a
    // fraction so the arc doesn't alias.
    "[--feather-px:0.5px] [--feather-deg:1deg]",
    "bg-[conic-gradient(from_0deg,var(--ak-layer)_0turn,var(--ak-layer)_calc(var(--progress-value)*1turn-var(--feather-deg)),transparent_calc(var(--progress-value)*1turn+var(--feather-deg)),transparent_1turn)]",
    // Mask everything but the outer ring so the conic reads as an arc.
    "mask-[radial-gradient(farthest-side,transparent_calc(100%-var(--progress-thickness)-var(--feather-px)),#000_calc(100%-var(--progress-thickness)+var(--feather-px)))]",
  ],
  defaultVariants: {
    // The arc paints its own background and rounds itself, so it must not open
    // a frame context that would round it again.
    $frame: false,
  },
});
