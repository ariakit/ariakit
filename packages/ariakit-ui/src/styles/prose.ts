import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";

/**
 * A column with text-relative vertical spacing. Nested columns reset the gap.
 */
export const proseColumn = cv({
  class: [
    "ui-prose-column",
    "flex-col",
    // Stays a class, so that the display of `listDisclosureContentBody` still
    // comes after it and replaces it.
    "flex",
    // Stays a class to come after the gap of `ui-nav-rows`, which it replaces.
    "gap-(--prose-gap)",
  ],
  variants: {
    /**
     * Sets the vertical gap between children. Numbers scale the spacing token.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--prose-gap": getSpacingValue(value) },
      };
    },
  },
});

/**
 * A prose column with readable text spacing and low-specificity text styles.
 */
export const prose = cv({
  extend: [proseColumn],
  class: [
    "ui-prose",
    // Stays a class to come after the --_ak-text-alpha of `ink`, which it
    // replaces.
    "ak-dark:ak-ink-75 ak-light:ak-ink-90",
  ],
});
