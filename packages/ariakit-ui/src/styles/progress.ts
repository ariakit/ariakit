import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";

/** Shared track geometry, color, and value for linear and circular progress. */
const progressBase = cv({
  extend: [frame],
  class: [
    "ui-progress-base",
    // Forced colors remove shadow edges; an outer outline keeps the track
    // visible without covering the fill.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
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
     * registration in progress.css enables fill animation.
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
  class: "ui-progress",
});

/** A circular progress track with room for content in its center. */
export const progressCircular = cv({
  extend: [progressBase],
  class: [
    "ui-progress-circular after:ak-layer",
    // An outline preserves the inner ring edge in forced colors.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:after:outline",
  ],
});

/** Shared color and motion settings for progress fills. */
const progressFillBase = cv({
  extend: [frame],
  class: [
    "ui-progress-fill-base",
    // Stays a class to come after the classes of a caller, so that the reduced
    // motion rule still applies.
    "motion-reduce:duration-0",
    // Use system highlight colors without losing the circular gradient in
    // forced colors.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
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
  class: "ui-progress-fill",
});

/** A circular progress arc with determinate and indeterminate animations. */
export const progressCircularFill = cv({
  extend: [progressFillBase],
  class: [
    "ui-progress-circular-fill",
    // Stays a class to come after the background-color of `layer`, which it
    // replaces.
    "bg-transparent",
  ],
  defaultVariants: {
    // The arc supplies its own radius; a frame context would round it again.
    $frame: false,
  },
});
