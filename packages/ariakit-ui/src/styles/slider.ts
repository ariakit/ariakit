import { cv, cx } from "clava";
import { frame } from "./frame.ts";
import { progress } from "./progress.ts";

/**
 * Holds a native range input and the track, fill, and thumb drawn under it. The
 * parts share one grid cell. The input stays on top with no paint, so the
 * pointer, the keyboard, and forms use the native control.
 */
export const slider = cv({
  class: [
    "slider grid w-full items-center",
    "[--slider-thumb-size:--spacing(5)]",
  ],
  variants: {
    /**
     * Sets the position of the value from `0`, at the minimum, to `1`, at the
     * maximum. The fill and the thumb follow it.
     */
    $value(value?: number | string) {
      if (value == null) return;
      return { style: { "--slider-value": `${value}` } };
    },
  },
});

/**
 * The native range input of a slider. It has no paint, and its thumb has the
 * size of the drawn thumb, so the value under the pointer is the value that the
 * drawn thumb shows. Forced colors show the native control instead.
 */
export const sliderInput = cv({
  class: [
    "col-start-1 row-start-1 m-0 w-full h-(--slider-thumb-size)",
    "appearance-none bg-transparent opacity-0 cursor-pointer",
    "disabled:cursor-not-allowed",
    // Browsers map the pointer to a value over the width of the input less the
    // width of the thumb, so the thumb must match the drawn thumb.
    "[&::-webkit-slider-thumb]:appearance-none",
    "[&::-webkit-slider-thumb]:size-(--slider-thumb-size)",
    "[&::-moz-range-thumb]:size-(--slider-thumb-size)",
    "[&::-moz-range-thumb]:border-0",
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
    "col-start-1 row-start-1 pointer-events-none",
    // The thumb is wider than the track.
    "overflow-visible forced-colors:hidden",
  ],
});

// The fill and the thumb are children of the track, which follows the input.
// Child combinators keep a disabled or focused element before the slider from
// matching them.
const sliderDisabledPart = cx(
  "[.slider>input:disabled~*>&]:ak-disabled",
  "[.slider>input:disabled~*>&]:ak-layer-fade-80",
  "[.slider>input:disabled~*>&]:ak-layer-contrast-0",
);

/** The filled part of a slider track, from its start to the thumb center. */
export const sliderFill = cv({
  extend: [frame],
  class: [
    "block h-full",
    "w-[calc(var(--slider-thumb-size)/2+var(--slider-value,0)*(100%-var(--slider-thumb-size)))]",
    sliderDisabledPart,
  ],
  defaultVariants: {
    $layer: "brand",
    $contrast: 50,
  },
});

/** The thumb of a slider, at the value of its input. */
export const sliderThumb = cv({
  extend: [frame],
  class: [
    "absolute top-1/2 -translate-y-1/2 size-(--slider-thumb-size) shadow-sm",
    // A percentage resolves against the width of the track, which is the width
    // of the input. The logical side puts the minimum on the right in RTL, like
    // the input.
    "inset-s-[calc(var(--slider-value,0)*(100%-var(--slider-thumb-size)))]",
    "ak-outline ak-outline-brand outline-offset-2",
    "[.slider>input:focus-visible~*>&]:outline-2",
    sliderDisabledPart,
    "[.slider>input:disabled~*>&]:shadow-none",
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
