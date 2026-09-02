import { cv } from "clava";

export const focus = cv({
  variants: {
    /**
     * Whether to show a focus ring when it receives keyboard focus and how
     * thick it should be.
     */
    $focus: {
      1: "ui-focus-visible:outline",
      true: "ui-focus-visible:outline-2",
      2: "ui-focus-visible:outline-2",
      3: "ui-focus-visible:outline-3",
    },
    /**
     * Marks keyboard focus by painting the brand layer on the element itself
     * instead of drawing a ring around it, and turns `$focus` off. Rows of a
     * composite widget use this: only one row is focused at a time, so the
     * filled row reads as the current one, and a ring on every row that the
     * arrow keys pass through would read as a second selection.
     */
    $focusHighlight: [
      "ui-focus-visible:ak-layer-brand ui-focus-visible:ak-layer-contrast",
      // The row still takes real DOM focus, so the browser's own focus ring
      // goes along with the one this replaces.
      "ui-focus-visible:outline-none",
    ],
    /**
     * The color of the focus ring.
     */
    $focusColor: {
      unset: "",
      brand: "ak-outline ak-outline-brand",
    },
    /**
     * The offset of the focus ring.
     */
    $focusOffset: {
      none: "",
      1: "outline-offset-1",
      2: "outline-offset-2",
    },
  },
  defaultVariants: {
    $focusColor(defaultValue, variants) {
      if (variants.$focus) {
        return defaultValue ?? "brand";
      }
      return defaultValue;
    },
    $focusOffset(defaultValue, variants) {
      if (variants.$focus) {
        return defaultValue ?? 1;
      }
      return defaultValue;
    },
  },
  refine({ variants, setVariants }) {
    if (!variants.$focusHighlight) return;
    // The highlight replaces the ring, so the ring variants have nothing
    // left to draw. Clearing them here rather than in a computed default
    // also covers the values the caller passed.
    setVariants({ $focus: false, $focusColor: "unset", $focusOffset: "none" });
  },
});
