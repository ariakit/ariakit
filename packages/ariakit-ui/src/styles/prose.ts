import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";

/**
 * Lays children out on a shared vertical rhythm. The gap is declared as well
 * as spent, so a nested column resets the gap of the one around it instead
 * of inheriting it, and an em keeps it proportional to the text it holds.
 */
export const proseColumn = cv({
  class: "flex flex-col gap-(--prose-gap) [--prose-gap:1.25em]",
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
    // against this. Font-size utilities sort alphabetically, so a plain
    // `text-2xl` from a caller loses to `text-base`. Override with a
    // variant-prefixed size such as `@5xl:text-lg/loose`.
    "text-base/relaxed ak-dark:ak-ink-75 ak-light:ak-ink-90",
    // The plain markup an author writes inline, for the elements this folder
    // has no component for. The whole selector sits in `:where()`, so these
    // rules carry no specificity and a class on the element always wins.
    // Paragraphs re-derive the ink so they stay readable inside a child that
    // paints its own surface.
    "[:where(&_p)]:ak-dark:ak-ink-75 [:where(&_p)]:ak-light:ak-ink-90",
    "[:where(&_strong)]:ak-ink-100 [:where(&_strong)]:font-medium",
  ],
});
