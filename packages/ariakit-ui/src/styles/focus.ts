import { cv } from "clava";

/** Keyboard focus rings with configurable color, width, and offset. */
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
    /** The color of the focus ring. */
    $focusColor: {
      unset: "",
      brand: "ak-outline ak-outline-brand",
    },
    /** The offset of the focus ring. Use `unset` to omit offset styling. */
    $focusOffset: {
      unset: "",
      0: "outline-offset-0",
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
});

/**
 * A focus ring with an optional layer highlight. The highlight requires a layer
 * on the element; text-only elements can use `focus`.
 */
export const focusHighlight = cv({
  extend: [focus],
  variants: {
    /**
     * Marks keyboard focus with a brand-colored layer and disables the focus
     * ring.
     */
    $focusHighlight: [
      "ui-focus-visible:ak-layer-brand ui-focus-visible:ak-layer-contrast",
      "ui-focus-visible:outline-none",
    ],
  },
  refine({ variants, setVariants }) {
    if (!variants.$focusHighlight) return;
    // Clear explicit caller ring values as well as defaults when using a
    // highlight.
    setVariants({ $focus: false, $focusColor: "unset", $focusOffset: "unset" });
  },
});

/**
 * A keyboard focus ring for a control with a nested input. Extend alongside
 * `focus` or a recipe that includes it; both `$focus` maps emit and must use
 * the same widths.
 */
export const focusWithin = cv({
  variants: {
    /**
     * Whether to show a focus ring when an input inside the element receives
     * keyboard focus, and how thick it should be.
     */
    $focus: {
      1: "ui-focus-visible-within:outline",
      true: "ui-focus-visible-within:outline-2",
      2: "ui-focus-visible-within:outline-2",
      3: "ui-focus-visible-within:outline-3",
    },
  },
});
