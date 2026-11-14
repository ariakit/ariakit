import { cv } from "clava";
import { getScaledStyleClass } from "../utils/styles.ts";
import {
  nav,
  navGroupLabel,
  navItem,
  navLink,
  navLinkGuide,
  navLinkGuideBar,
  navLinkMarker,
  navList,
} from "./nav.ts";
import { text } from "./text.ts";

/**
 * A table of contents: a navigation region whose rows sit along a guide that
 * bends into nested lists. The bar on the guide covers the rows whose sections
 * are on screen: the style component measures the rows and sets the range of
 * the bar, which glides when the range changes. `$size` sets the font size of
 * the label and the rows, which also scales their padding and the guide. It
 * defaults to `sm`.
 *
 * The guide, the bar, and the markers are those of a navigation: `$guide` sets
 * the look of the guide and defaults to `smooth`, and `false` shows the indent
 * only, with no guide and no bar. `$barWidth` sets the thickness of the bar and
 * defaults to 1px. `$marker` sets the marker of the top-level rows,
 * `$markerHighlight` sets how a marker shows that the bar covers it, and
 * `$indent`, `$markerSize`, and `$bulletSize` size them. The dots are smaller
 * than the bullets of a list by default.
 */
export const toc = cv({
  extend: [nav, text],
  class: "toc",
  defaultVariants: {
    $size: "sm",
    // The navigation has no guide by default.
    $guide: () => "smooth" as const,
    // Smaller than the bullet of a list, for the smaller rows. A whole number
    // of pixels stays centered on the guide.
    $bulletSize: "round(0.375em, 1px)",
    // As thin as the guide, which the bar covers along many rows.
    $barWidth: 1,
    $gap: 0.5,
    $itemPadding: 1.5,
  },
});

/** The title above the rows, which names the table of contents. */
export const tocLabel = cv({
  extend: [navGroupLabel],
  class: "toc-label",
});

/**
 * A list of rows. The outermost list has its own box, which leaves room for the
 * guide and can scroll its rows, and each nested list indents its rows.
 */
export const tocList = cv({
  extend: [navList],
  class: "toc-list",
  defaultVariants: {
    $gutter: true,
  },
});

/** A list item that holds a link and the nested list of its rows. */
export const tocItem = cv({
  extend: [navItem],
  class: "toc-item",
});

/**
 * A table of contents link. The current link gets a lighter surface and full
 * ink, and keeps the normal weight, so long labels don't wrap differently while
 * the page scrolls. Bold marks it, and full ink and bold mark its parents, on
 * request.
 */
export const tocLink = cv({
  extend: [navLink],
  class: [
    "toc-link",
    // Forced colors remove the selected surface.
    "ui-selected:forced-colors:ak-frame-border-[length:max(1px,var(--border-width,1px))]",
  ],
  variants: {
    /**
     * Shows the current link in a heavier weight. A heavier label can wrap
     * differently and move the rows after it.
     */
    $selectedBold: {
      true: "ui-selected:font-[calc(500+var(--contrast))]",
      false: "ui-selected:font-normal",
    },
    /**
     * Sets text strength from `0` to `100` for the links whose nested rows hold
     * the current link. The value inherits into slots.
     */
    $parentInk(value?: (string & {}) | number | false) {
      // A parent's list item holds a nested list with the current link. The
      // aria-current check matches the ui-selected variant.
      return getScaledStyleClass({
        value,
        allowZero: true,
        property: "--parent-ink",
        class:
          "[li:has(>.nav-list_[aria-current]:not([aria-current=''],[aria-current=false]))>&]:ak-ink-(--parent-ink)",
      });
    },
    /**
     * Shows the links whose nested rows hold the current link in a heavier
     * weight.
     */
    $parentBold:
      "[li:has(>.nav-list_[aria-current]:not([aria-current=''],[aria-current=false]))>&]:font-[calc(500+var(--contrast))]",
  },
  defaultVariants: {
    // The guide, bar, and marker pieces sit inside the link, so press scaling
    // would pull them out of line with the pieces of the other rows.
    $active: false,
  },
});

/**
 * A hidden piece of a link that draws its part of the guide. The edge variants
 * give it a color of its own, `$line` sets the line style, and `$radius` sets
 * the radius of the curves, which the bar piece of the link must also get.
 */
export const tocLinkGuide = cv({
  extend: [navLinkGuide],
  class: "toc-link-guide",
});

/**
 * A hidden piece of a link that draws its part of the bar over the guide: the
 * bar of a navigation link on a guide. The style component measures the inset
 * of the piece from the edges of its row to place the bar.
 */
export const tocLinkBar = cv({
  extend: [navLinkGuideBar],
  class: "toc-link-bar",
  defaultVariants: {
    // The style component sets one range on all pieces.
    $glide: true,
  },
});

/** A hidden marker on the guide at a row: the marker of a navigation link. */
export const tocLinkMarker = cv({
  extend: [navLinkMarker],
  class: "toc-link-marker",
  defaultVariants: {
    $glide: true,
  },
});
