import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";
import { progress } from "./progress.ts";

/**
 * Holds a native range input and the track, fill, and thumb drawn under it. The
 * parts share one grid cell. The input stays on top with no paint, so the
 * pointer, the keyboard, and forms use the native control.
 */
export const slider = cv({
  class: "ui-slider",
  variants: {
    /**
     * Sets the position of the value from `0`, at the minimum, to `1`, at the
     * maximum. The fill and the thumb follow it.
     */
    $value(value?: number | string) {
      if (value == null) return;
      return { style: { "--slider-value": `${value}` } };
    },
    /**
     * Sets the size of the thumb. The drawn thumb and the thumb of the native
     * input take it, so the pointer sets the value that the drawn thumb shows.
     * Numbers scale the spacing token.
     */
    $thumbSize(value?: string | number) {
      if (value == null) return;
      return { style: { "--slider-thumb-size": getSpacingValue(value) } };
    },
  },
  defaultVariants: {
    $thumbSize: 5,
  },
});

/**
 * The native range input of a slider. It has no paint, and its thumb has the
 * size of the drawn thumb, so the value under the pointer is the value that the
 * drawn thumb shows. Forced colors show the native control instead.
 */
export const sliderInput = cv({
  class: [
    "ui-slider-input",
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:opacity-100 forced-colors:appearance-auto",
    "forced-colors:[&::-webkit-slider-thumb]:appearance-auto",
  ],
});

/**
 * The track of a slider, which holds its fill and its thumb. The thumb takes
 * its color against the track, like the fill, so the two match.
 */
export const sliderTrack = cv({
  extend: [progress],
  class: [
    "ui-slider-track",
    // The thumb is wider than the track.
    // Stays a class to come after the overflow of `ui-progress`, which it
    // replaces.
    "overflow-visible",
    // Stays a class to come after the display of `ui-progress`, which it
    // replaces.
    "forced-colors:hidden",
  ],
});

/** The filled part of a slider track, from its start to the thumb center. */
export const sliderFill = cv({
  extend: [frame],
  class: "ui-slider-fill ui-slider-disabled-part",
  defaultVariants: {
    $layer: "brand",
    $contrast: 50,
  },
});

/** The thumb of a slider, at the value of its input. */
export const sliderThumb = cv({
  extend: [frame],
  class: [
    "ui-slider-thumb",
    // Stays a class to come after another class here that sets the inset, which
    // it replaces.
    "top-1/2",
    // A percentage resolves against the width of the track, which is the width
    // of the input. The logical side puts the minimum on the right in RTL, like
    // the input.
    // Stays a class, so that another class here that sets the inset still comes
    // after it and replaces it.
    "inset-s-[calc(var(--slider-value,0)*(100%-var(--slider-thumb-size)))]",
    "ak-outline ak-outline-brand ui-slider-disabled-part",
  ],
  defaultVariants: {
    // The thumb takes the color of the fill, so the two read as one shape.
    $layer: "brand",
    $contrast: 50,
    $rounded: "full",
    $forceRounded: true,
    $p: "none",
  },
});
