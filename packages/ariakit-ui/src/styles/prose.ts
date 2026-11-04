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
    // these defaults. A sized shell main sets the token to 1em, which resolves
    // against the parent here, so the column follows the text around it. A
    // unitless line height keeps smaller text inside in proportion.
    "ui-base:text-(length:--prose-size,1rem)/[1.75]",
    "ak-dark:ak-ink-75 ak-light:ak-ink-90",
    // Keep markup defaults at zero specificity. Paragraphs and list items
    // restore muted ink inside nested surfaces.
    "[:where(&_:is(p,li))]:ak-dark:ak-ink-75",
    "[:where(&_:is(p,li))]:ak-light:ak-ink-90",
    "[:where(&_strong)]:ak-ink-100 [:where(&_strong)]:font-medium",
    // A heading starts a new part of the column, so it adds space above the gap.
    // Adjacent headings stay closer. Zero specificity lets caller mt-* classes
    // win, and em values follow the size of each heading.
    "[:where(&>:not(h1,h2,h3,h4,h5,h6)+:is(h1,h2,h3,h4,h5,h6))]:mt-4",
    // A column after a popout, feature, or full band between two columns, such
    // as a code block, a figure, or a callout in an article, continues the same
    // text, so its first heading starts a new part too.
    "[:where(:is(.shell-popout,.shell-feature,.shell-full)+&>:is(h1,h2,h3,h4,h5,h6):first-child)]:mt-4",
    "[:where(&>:is(h1,h2,h3,h4,h5,h6)+:is(h1,h2,h3,h4,h5,h6))]:mt-[0.35em]",
    // Tighten only the space after a heading, so later children keep the gap.
    // The margin is negative while the gap is larger than this space.
    "[:where(&>:is(h1,h2,h3,h4,h5,h6)+.heading-description)]:mt-[calc(var(--spacing)*3.5-var(--prose-gap))]",
    // A short lead sits closer together than the paragraphs below it. A direct
    // property keeps the leading fallbacks of text-* classes.
    "[:where(&>.heading-description)]:[line-height:1.625]",
  ],
});
