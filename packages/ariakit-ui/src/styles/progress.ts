import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";

/** Shared track geometry, color, and value for linear and circular progress. */
const progressBase = cv({
  extend: [frame],
  class: [
    "relative",
    // Forced colors remove shadow edges; an outer outline keeps the track
    // visible without covering the fill.
    "forced-colors:outline",
  ],
  variants: {
    /** Sets the track edge type; forced colors use the outer outline. */
    $borderType: {
      // The outer outline supplies the forced-colors edge without shrinking the
      // fill.
      inset: "forced-colors:ak-frame-border-0!",
    },
    /**
     * Sets progress from `0` to `1`. The inherited `--progress-value`
     * registration in ui.css enables fill animation.
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
    $edgeWeight: "adaptive",
    // An inset ring preserves the track dimensions.
    $borderType: "inset",
    $border: true,
    $rounded: "full",
    $forceRounded: true,
    $p: "none",
    $thickness: 2,
  },
});

/** A linear progress track that fills its available width. */
export const progress = cv({
  extend: [progressBase],
  class: "block overflow-clip h-(--progress-thickness) w-full",
});

/** A circular progress track with room for content in its center. */
export const progressCircular = cv({
  extend: [progressBase],
  class: [
    "size-full grid place-items-center",
    // Copy the parent color and edge before the pseudo-element recomputes
    // them.
    "[--progress-layer-parent:var(--ak-layer-parent)]",
    "[--progress-edge:var(--ak-edge)]",
    // The center disc restores the parent surface. Isolation keeps it above
    // the track and below child content.
    "isolate after:absolute after:-z-1 after:rounded-full",
    "after:ak-layer after:ak-layer-color-(--progress-layer-parent)",
    "after:ring-(length:--border-width) after:ring-(--progress-edge)",
    "after:inset-(--progress-thickness)",
    // An outline preserves the inner ring edge in forced colors.
    "forced-colors:after:outline",
  ],
});

/** Shared color and motion settings for progress fills. */
const progressFillBase = cv({
  extend: [frame],
  class: [
    "duration-1000 motion-reduce:duration-0",
    // Use system highlight colors without losing the circular gradient in
    // forced colors.
    "forced-colors:forced-color-adjust-none forced-colors:[--ak-layer:Highlight]",
  ],
  defaultVariants: {
    $layer: "brand",
    $contrast: 50,
  },
});

/** A linear progress fill with determinate and indeterminate animations. */
export const progressFill = cv({
  extend: [progressFillBase],
  class: [
    "block h-full w-[calc(var(--progress-value)*100%)]",
    // Animate from empty on first paint.
    "not-data-indeterminate:starting:w-0! transition-[width]",
    // Center the resting segment under reduced motion.
    "data-indeterminate:w-1/3 data-indeterminate:translate-x-full",
    // Keep the same origin in RTL; reverse only the animation direction.
    "data-indeterminate:absolute data-indeterminate:left-0",
    "motion-safe:data-indeterminate:animate-ui-progress",
    "rtl:data-indeterminate:[animation-direction:reverse]",
  ],
});

/** A circular progress arc with determinate and indeterminate animations. */
export const progressCircularFill = cv({
  extend: [progressFillBase],
  class: [
    "absolute inset-0 rounded-full bg-transparent",
    // Hit testing ignores the mask, so allow pointer input through to center
    // content.
    "pointer-events-none",
    "transition-[--progress-value] not-data-indeterminate:starting:[--progress-value:0]!",
    "data-indeterminate:[--progress-value:0.25]",
    "motion-safe:data-indeterminate:animate-spin",
    // Soften aliased edges. Reduce angular feathering at both endpoints to
    // avoid a faint arc at zero or a seam at one.
    "[--feather-px:0.5px]",
    "[--feather-deg:min(1deg,var(--progress-value)*1turn,(1-var(--progress-value))*1turn)]",
    "bg-[conic-gradient(from_0deg,var(--ak-layer)_0turn,var(--ak-layer)_calc(var(--progress-value)*1turn-var(--feather-deg)),transparent_calc(var(--progress-value)*1turn+var(--feather-deg)),transparent_1turn)]",
    "mask-[radial-gradient(farthest-side,transparent_calc(100%-var(--progress-thickness)-var(--feather-px)),#000_calc(100%-var(--progress-thickness)+var(--feather-px)))]",
  ],
  defaultVariants: {
    // The arc supplies its own radius; a frame context would round it again.
    $frame: false,
  },
});
