import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";

/**
 * Lays children out on a shared vertical rhythm. The gap is declared as well as
 * spent, so a nested column resets the gap of the one around it instead of
 * inheriting it. The spacing step is em-based, so the rhythm stays proportional
 * to the text the column holds.
 */
export const proseColumn = cv({
  class: "flex flex-col gap-(--prose-gap) [--prose-gap:--spacing(5)]",
  variants: {
    /**
     * Sets the gap between the children that drives the vertical rhythm.
     * Numbers scale the spacing token.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--prose-gap": getSpacingValue(value) },
      };
    },
  },
});

export const prose = cv({
  extend: [proseColumn],
  class: [
    // The marker other components select on, such as the list gap in
    // list.ts. A plain class needs neither a flag nor a custom variant the
    // reader would have to install.
    "prose",
    // The typographic origin: descendants size themselves in em and lh
    // against this. The size sits in `:where()`, so it has no specificity and
    // any text-* or leading-* class on the element wins, whatever order
    // Tailwind gives the two.
    "[:where(&)]:text-base/relaxed ak-dark:ak-ink-75 ak-light:ak-ink-90",
    // The plain markup an author writes inline, for the elements this folder
    // has no component for. The whole selector sits in `:where()`, so these
    // rules carry no specificity and a class on the element always wins.
    // Paragraphs and list items re-derive the ink inside a child that paints
    // its own surface, so body copy keeps the muted tone of the column rather
    // than taking that layer's full ink.
    "[:where(&_:is(p,li))]:ak-dark:ak-ink-75",
    "[:where(&_:is(p,li))]:ak-light:ak-ink-90",
    "[:where(&_strong)]:ak-ink-100 [:where(&_strong)]:font-medium",
  ],
});
