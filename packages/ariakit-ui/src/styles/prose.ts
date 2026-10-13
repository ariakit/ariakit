import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";

/**
 * A column with text-relative vertical spacing. Nested columns reset the gap.
 */
export const proseColumn = cv({
  class: "flex flex-col gap-(--prose-gap) [--prose-gap:--spacing(5)]",
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
    "prose",
    // Use zero specificity so text size and line-height utilities can override
    // these defaults.
    "[:where(&)]:text-base/relaxed ak-dark:ak-ink-75 ak-light:ak-ink-90",
    // Keep markup defaults at zero specificity. Paragraphs and list items
    // restore muted ink inside nested surfaces.
    "[:where(&_:is(p,li))]:ak-dark:ak-ink-75",
    "[:where(&_:is(p,li))]:ak-light:ak-ink-90",
    "[:where(&_strong)]:ak-ink-100 [:where(&_strong)]:font-medium",
  ],
});
