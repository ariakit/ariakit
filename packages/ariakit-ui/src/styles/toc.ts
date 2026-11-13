import { cv } from "clava";
import {
  getPaddingValue,
  getScaledStyleClass,
  getSpacingValue,
} from "../utils/styles.ts";
import { edge, hasEdgeColor } from "./edge.ts";
import { font } from "./font.ts";
import { guide } from "./guide.ts";
import { nav, navGroupLabel, navLink } from "./nav.ts";

/**
 * A table of contents: a navigation region whose rows sit along a guide that
 * bends into nested lists. A thumb covers the guide along the rows whose
 * sections are on screen, between `--toc-thumb-start` and `--toc-thumb-end`,
 * which the style component sets on each thumb piece and marker in pixels from
 * the top of this element. `$size` sets the font size of the label and the
 * rows, which also scales their padding and the guide. It defaults to `sm`.
 */
export const toc = cv({
  extend: [nav, font],
  class: [
    "toc",
    "[--toc-guide-width:1px]",
    // Normalize the 0–100 contrast scale so high contrast adds only 20%, like
    // the bar of a nav link. Borders snap to device pixels, so a fractional
    // width would draw the thumb beside the guide instead of over it.
    "[--toc-thumb-width:round(calc(var(--toc-thumb-base-width,1px)*(1+0.2*var(--contrast,0)/100)),1px)]",
    // The ring of a marker draws inside the halo, so a wider thumb widens the
    // halo to keep the ring off the number.
    "[--toc-marker-halo:max(--spacing(1),var(--toc-thumb-width))]",
    // How far a number reaches from the guide. These stay unregistered, so they
    // resolve in the font of each element that reads them.
    "[--toc-number-size:calc(1lh-0.3em)]",
    "[--toc-number-reach:calc(var(--toc-number-size)/2+var(--toc-marker-halo))]",
    // Colors resolve against this element, so pieces inside a current link
    // keep the colors of the surface around the rows. The thumb takes the text
    // color at full strength.
    "[--toc-guide-color:var(--ak-edge)]",
    "[--toc-thumb-color:oklch(from_var(--ak-text)_l_c_h/1)]",
    "[--toc-halo-color:var(--ak-layer)]",
    "forced-colors:[--toc-guide-color:GrayText]",
    "forced-colors:[--toc-thumb-color:CanvasText]",
    "forced-colors:[--toc-halo-color:Canvas]",
  ],
  variants: {
    /**
     * Sets the look of the guide along the rows: `smooth` bends into nested
     * lists with curves, `diagonal` with slanted lines, `rail` keeps one
     * straight line for all levels, and `false` shows the indent only, with no
     * guide and no thumb. Defaults to `smooth`.
     */
    $guide: {
      // Guide pieces inherit these flags: whether rows bend between levels, and
      // whether a bend curves or runs straight.
      smooth: "toc-smooth [--toc-bends:1] [--guide-curve:1]",
      diagonal: "toc-diagonal [--toc-bends:1] [--guide-curve:0]",
      rail: [
        "toc-rail [--toc-bends:0] [--guide-curve:1]",
        // Numbers of a nested list stay on the guide of the outermost list, so
        // that list needs the gutter of an ordered toc.
        "[&:has(.toc-list-numbers)]:[--toc-gutter:calc(var(--toc-guide-offset)+var(--toc-number-reach))]",
      ],
      false: "toc-unguided",
    },
    /**
     * Sets how far the rows of a nested list move in from the rows of the list
     * that holds it, which is also the width of a bend of the guide. The indent
     * stops at the third level. Numbers scale the spacing token. Defaults to
     * `3`.
     */
    $indent(value?: string | number) {
      if (value == null) return;
      return { style: { "--toc-indent": getSpacingValue(value) } };
    },
    /**
     * Sets the thickness of the thumb and the marker rings. Numbers are pixels;
     * other values are CSS lengths. High contrast adds 20%, and the result
     * rounds to whole pixels. Defaults to 1px.
     */
    $thumbWidth(value?: number | (string & {})) {
      if (value == null) return;
      const width = typeof value === "number" ? `${value}px` : value;
      return { style: { "--toc-thumb-base-width": width } };
    },
    /**
     * Sets the padding of the rows, and the label lines up with them. Numbers
     * scale the spacing token and round to a whole pixel. Defaults to `1.5`.
     */
    $itemPadding(value?: string | number) {
      if (value == null) return;
      return { style: { "--nav-py": getPaddingValue(value) } };
    },
    /**
     * Numbers the top-level rows with markers on the guide. The `ordered` prop
     * of the style component sets it and renders an ordered list.
     */
    $ordered: {
      true: "toc-ordered [counter-reset:toc] [--toc-number-display:grid]",
      false: "",
    },
    /**
     * Sets how a number marker shows that the thumb covers it. `fill` fills the
     * marker with the thumb color. `ring` draws a ring in the thumb color
     * outside the marker, so the thumb runs through it. `false` leaves it as it
     * is. Needs an ordered list and a guide. Defaults to `fill`.
     */
    $markerHighlight: {
      fill: "toc-fill",
      ring: "toc-ring",
      false: "",
    },
  },
  defaultVariants: {
    $size: "sm",
    $guide: "smooth",
    $indent: 3,
    $markerHighlight: "fill",
    $gap: 0.5,
    $itemPadding: 1.5,
  },
  refine({ variants, addClass }) {
    // The guide sits in a gutter before the top-level rows. Number markers need
    // a wider gutter to stay inside the toc. Their halo and ring cut into the
    // surface and the focus ring of a row, which keeps the rows at the same
    // distance from the guide.
    if (variants.$guide !== false) {
      addClass([
        "[--toc-guide-offset:--spacing(2)]",
        variants.$ordered
          ? "[--toc-gutter:calc(var(--toc-guide-offset)+var(--toc-number-reach))]"
          : "[--toc-gutter:calc(var(--toc-guide-offset)+(--spacing(1)))]",
      ]);
      return;
    }
    // Without a guide, number markers sit apart from the rows.
    if (variants.$ordered) {
      addClass([
        "[--toc-guide-offset:calc(var(--toc-number-reach)+2px)]",
        "[--toc-gutter:calc(var(--toc-guide-offset)+var(--toc-number-reach))]",
      ]);
      return;
    }
    addClass("[--toc-guide-offset:0px] [--toc-gutter:0px]");
  },
});

/** The title above the rows, which names the table of contents. */
export const tocLabel = cv({
  extend: [navGroupLabel],
  // Line up with the text of the top-level rows after the guide gutter. The
  // gutter is a registered length, so it resolves in the font of the root, not
  // the smaller font of the label.
  class: "toc-label ms-(--toc-gutter,0px)",
});

/**
 * A list of rows. The outermost list leaves room for the guide, and each nested
 * list indents its rows. The indent and the bends stop at the third level, so
 * deeper rows line up with it.
 */
export const tocList = cv({
  class: [
    "toc-list grid grid-cols-[minmax(0,1fr)] content-start gap-(--nav-gap)",
    "ps-(--toc-gutter,0px)",
    // Depth flags for the guide pieces. A row bends in from its parent only in
    // the second and third levels, and bends out by at most the levels it can
    // return to.
    "[--toc-depth:0] [--toc-in-cap:0] [--toc-out-cap:2] [--toc-lead:1]",
    "[.toc-list_&]:ps-(--toc-indent) [.toc-list_&]:[--toc-depth:1]",
    "[.toc-list_&]:[--toc-in-cap:1] [.toc-list_&]:[--toc-out-cap:1]",
    "[.toc-list_&]:[--toc-lead:0]",
    "[.toc-list_.toc-list_&]:[--toc-depth:2]",
    "[.toc-list_.toc-list_&]:[--toc-out-cap:0]",
    "[.toc-list_.toc-list_.toc-list_&]:ps-0",
    "[.toc-list_.toc-list_.toc-list_&]:[--toc-in-cap:0]",
    // The guide fades after the last row of the outermost list. Rows inherit
    // the flag only through the last item of each list.
    "[--toc-tail:1] [.toc-list_&]:[--toc-tail:inherit]",
    "[&>li:not(:last-child)]:[--toc-tail:0]",
  ],
  variants: {
    /**
     * Sets the marker on the guide at the rows of a nested list. Every link
     * renders the markers, and these flags inherit to them, so only the rows of
     * this list show one, and a list inside it sets its own. `number` numbers
     * the rows, and the `ordered` prop of the style component also sets it and
     * renders an ordered list. The rows stay in place, so the halo of a number
     * cuts into the surface of a current row. Without a guide, the list makes
     * room for the numbers instead. `dot` draws a small dot that fills with the
     * thumb color while the thumb covers it, and needs a guide. Defaults to
     * `false`, which shows no marker.
     */
    $marker: {
      number: [
        "toc-list-numbers",
        "[--toc-number-display:grid] [--toc-dot-display:none]",
        "[counter-reset:toc]",
        "[.toc-unguided_&]:[--toc-guide-offset:calc(var(--toc-number-reach)+2px)]",
        "[.toc-unguided_.toc-list_&]:ps-[calc(var(--toc-indent)+var(--toc-guide-offset)+var(--toc-number-reach))]",
      ],
      dot: "[--toc-number-display:none] [--toc-dot-display:block]",
      // An ordered toc numbers only the rows of its outermost list.
      false:
        "[--toc-dot-display:none] [.toc-list_&]:[--toc-number-display:none]",
    },
  },
  defaultVariants: {
    $marker: false,
  },
});

/** A list item that holds a link and the nested list of its rows. */
export const tocItem = cv({
  class: "toc-item grid grid-cols-[minmax(0,1fr)] gap-(--nav-gap)",
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
          "[li:has(>.toc-list_[aria-current]:not([aria-current=''],[aria-current=false]))>&]:ak-ink-(--parent-ink)",
      });
    },
    /**
     * Shows the links whose nested rows hold the current link in a heavier
     * weight.
     */
    $parentBold:
      "[li:has(>.toc-list_[aria-current]:not([aria-current=''],[aria-current=false]))>&]:font-[calc(500+var(--contrast))]",
  },
  defaultVariants: {
    // The guide, thumb, and marker pieces sit inside the link, so press scaling
    // would pull them out of line with the pieces of the other rows.
    $active: false,
    // Use the length resolved by the toc root, which the label also reads.
    $p: "var(--nav-py)",
  },
});

/**
 * Shared geometry of the guide and thumb pieces. Each piece draws the bend from
 * the previous row and the line along its own row, so the pieces of all rows
 * join into one guide. List selectors decide the bends, so the guide renders
 * before any script runs.
 */
const tocLinkPiece = cv({
  extend: [guide],
  class: [
    "z-1 [.toc-unguided_&]:hidden",
    // Levels to bend in from the parent or out to an earlier level. The first
    // row of the outermost list starts the guide.
    "[--toc-first:0] [li:first-child>*>&]:[--toc-first:var(--toc-lead,0)]",
    "[--toc-in-raw:0] [.toc-list_.toc-list>li:first-child>*>&]:[--toc-in-raw:1]",
    "[--toc-out-raw:0] [li:has(>.toc-list)+li>*>&]:[--toc-out-raw:1]",
    "[li:has(>.toc-list>li:last-child>.toc-list)+li>*>&]:[--toc-out-raw:2]",
    // The guide draws the bend and the line with the `--guide-*` values. A row
    // can bend out by two levels, which the span counts.
    "[--guide-in:calc(min(var(--toc-in-raw),var(--toc-in-cap,0))*var(--toc-bends,1))]",
    "[--toc-out:calc(min(var(--toc-out-raw),var(--toc-out-cap,0))*var(--toc-bends,1))]",
    "[--guide-outward:min(1,var(--toc-out))]",
    "[--guide-span:calc((var(--guide-in)+var(--toc-out))*var(--toc-indent))]",
    // A bend runs from the end of the previous line, through the gap between
    // the rows, to the start of this one. The script measures the same inset
    // from the row edges to place the thumb.
    "[--toc-joint:var(--py,0px)]",
    "[--guide-bend-height:calc(var(--nav-gap,0px)+var(--toc-joint)*2)]",
    // The rail keeps the guide of the outermost list at every level.
    "[--toc-x:calc(-1*var(--toc-guide-offset,0px)-(1-var(--toc-bends,1))*var(--toc-depth,0)*var(--toc-indent))]",
    "top-[calc(var(--toc-joint)-(1-var(--toc-first))*var(--guide-bend-height))]",
    "bottom-(--toc-joint)",
    "inset-s-[calc(var(--toc-x)-var(--guide-width)/2-var(--guide-in)*var(--toc-indent))]",
    "w-[calc(var(--guide-span)+var(--guide-width))]",
  ],
  defaultVariants: {
    // A piece takes its color from the toc root, which also sets system colors
    // in forced colors, so it needs no layer to resolve an edge.
    $layer: false,
    // The toc root sets the shape of the bends for the guide and the thumb.
    $bend: false,
  },
});

/**
 * A hidden piece of a link that draws its part of the guide. The edge variants
 * give it a color of its own, `$line` sets the line style, and `$radius` sets
 * the radius of the curves, which the thumb piece of the link must also get.
 */
export const tocLinkGuide = cv({
  extend: [tocLinkPiece],
  class: [
    "toc-link-guide",
    "[--guide-width:var(--toc-guide-width,1px)]",
    // Fade out after the last row.
    "[--toc-end:0] [li:last-child:not(:has(>.toc-list))>*>&]:[--toc-end:1]",
    "[li:last-child:not(:has(>.toc-list))>*>&]:mask-[linear-gradient(to_bottom,#000_calc(100%-var(--toc-tail,0)*var(--toc-end)*(--spacing(2))),transparent)]",
  ],
  defaultVariants: {
    // An edge color resolves on the piece, against the surface around it.
    $layer(defaultValue, variants) {
      if (!hasEdgeColor(variants.$edge)) return defaultValue;
      return "transparent";
    },
  },
  refine({ variants, addClass }) {
    // Without an edge color of its own, the piece takes the color that the toc
    // root resolves. A class can't clear that color for a piece that has one.
    if (hasEdgeColor(variants.$edge)) return;
    addClass("[--guide-color:var(--toc-guide-color)]");
  },
});

/** The timing that the thumb glide and the fill of a marker share. */
const tocGlideTiming = cv({
  class: "duration-200 ease-[cubic-bezier(0.25,0.7,0.3,1)]",
});

/**
 * The glide of the thumb range. Each piece that reads the range animates it
 * itself, which restyles only that piece in each frame. The pieces get the same
 * range at the same time, so they glide as one bar through the bends.
 */
const tocThumbGlide = cv({
  extend: [tocGlideTiming],
  class:
    "transition-[--toc-thumb-start,--toc-thumb-end] motion-reduce:transition-none",
});

/**
 * A hidden piece of a link that draws its part of the thumb over the guide.
 * Every piece shows only its part between `--toc-thumb-start` and
 * `--toc-thumb-end`, measured from `--toc-piece-top`, its own top relative to
 * the same origin, so the pieces join into one bar while the range animates.
 */
export const tocLinkThumb = cv({
  extend: [tocLinkPiece, tocThumbGlide],
  class: [
    "toc-link-thumb",
    "[--guide-width:var(--toc-thumb-width,1px)] [--guide-color:var(--toc-thumb-color)]",
    // Negative side insets keep the slanted lines of diagonal bends whole. A
    // piece that the range doesn't cut keeps its edges outside the clip, which
    // otherwise leaves seams between pieces at fractional pixel positions.
    "[clip-path:inset(max(-1px,var(--toc-thumb-start)-var(--toc-piece-top,0px))_-0.5em_max(-1px,var(--toc-piece-top,0px)+100%-var(--toc-thumb-end))_-0.5em)]",
  ],
});

/**
 * Shared geometry of the markers, which center `--toc-marker-size` on the guide
 * and on the first line of a row. A halo in the surface color cuts the guide
 * around them.
 */
const tocLinkMarkerBase = cv({
  extend: [tocGlideTiming],
  class: [
    // Only the fill transitions, so the colors follow the theme at once and a
    // glide of the range doesn't restyle the marker in each frame. The fill reads
    // the timing from here.
    "transition-none",
    "absolute pointer-events-none rounded-full z-2",
    "size-(--toc-marker-size)",
    "top-[calc(var(--py,0px)+(1lh-var(--toc-marker-size))/2)]",
    // Like the guide pieces, a marker in a nested list stays on the rail.
    "inset-s-[calc(-1*var(--toc-guide-offset,0px)-(1-var(--toc-bends,1))*var(--toc-depth,0)*var(--toc-indent)-var(--toc-marker-size)/2)]",
    // A shadow halo, unlike an outline, paints under the ring.
    "shadow-[0_0_0_var(--toc-marker-halo)_var(--toc-halo-color)]",
    // The toc root sets system colors in forced colors.
    "forced-colors:forced-color-adjust-none",
    // The clip of a fill, which resolves here because the range doesn't inherit.
    // It stops at the edges of the marker, so the fill takes the whole transition
    // however far the range moves, and only the markers that the thumb reaches
    // animate, which needs lengths instead of percentages. The fill starts from
    // the side of the thumb. An empty clip passes the edge, so a fractional size
    // leaves no line. The style component sets the duration to zero on a marker
    // that the thumb leaves, which empties it at once, and on the first range.
    "[--toc-fill-clip:inset(min(var(--toc-marker-size)+1px,max(-1px,var(--toc-thumb-start)-var(--toc-piece-top,0px)))_-1px_min(var(--toc-marker-size)+1px,max(-1px,var(--toc-piece-top,0px)+var(--toc-marker-size)-var(--toc-thumb-end)))_-1px)]",
  ],
});

/**
 * A hidden dot on the guide at a row. It's small enough for the halo to fit in
 * the regular guide offset, so its list keeps the rows in place. The dot fills
 * with the thumb color while the thumb covers it. Needs a guide.
 */
export const tocLinkDot = cv({
  extend: [tocLinkMarkerBase],
  class: [
    "toc-link-dot [display:var(--toc-dot-display,none)] [.toc-unguided_&]:hidden",
    // A whole number of pixels stays centered on the guide.
    "[--toc-marker-size:round(0.375em,1px)]",
    // The guide color can be translucent, and the guide passes under the dot.
    "[background:linear-gradient(var(--toc-guide-color),var(--toc-guide-color)),var(--toc-halo-color)]",
    "after:absolute after:inset-0 after:rounded-full after:bg-(--toc-thumb-color)",
    "after:[clip-path:var(--toc-fill-clip)]",
    "after:transition-[clip-path] after:duration-(--toc-fill-duration,inherit) after:ease-[inherit]",
    "motion-reduce:after:transition-none",
  ],
});

/**
 * A hidden number marker on the guide at a row of an ordered list. With
 * `$markerHighlight` on the toc, the marker fills with the thumb color where
 * the thumb passes, or a ring in the halo lights up.
 */
export const tocLinkMarker = cv({
  extend: [edge, tocLinkMarkerBase],
  class: [
    "toc-link-marker [display:var(--toc-number-display,none)] place-items-center",
    // The marker sits outside the link, on the surface around the rows.
    "[.ak-layer>&]:ak-outset",
    "[--toc-marker-size:var(--toc-number-size)]",
    "[counter-increment:toc]",
    "before:content-[counter(toc)] before:font-semibold",
    "before:leading-(--toc-marker-size) before:[font-size-adjust:0.45]",
    // Keep the ring in forced colors, with system colors.
    "forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
    "forced-colors:inset-ring forced-colors:inset-ring-[CanvasText]",
    // The ring is clipped to the thumb range widened by the halo, so a marker
    // is either lit or not while the thumb is still. An empty range, with no
    // section on screen, doesn't widen.
    "[--toc-ring-reach:min(var(--toc-marker-halo),max(0px,(var(--toc-thumb-end)-var(--toc-thumb-start))*1000))]",
    // Only the ring glides with the range, so other markers don't restyle in
    // each frame of a glide.
    "[.toc-ring:not(.toc-unguided)_&]:transition-[--toc-thumb-start,--toc-thumb-end]",
    "motion-reduce:[.toc-ring:not(.toc-unguided)_&]:transition-none",
    // The range doesn't inherit, so the ring takes it from the marker.
    "[.toc-ring:not(.toc-unguided)_&]:after:[--toc-thumb-start:inherit]",
    "[.toc-ring:not(.toc-unguided)_&]:after:[--toc-thumb-end:inherit]",
    "[.toc-ring:not(.toc-unguided)_&]:after:absolute",
    "[.toc-ring:not(.toc-unguided)_&]:after:-inset-(--toc-marker-halo)",
    "[.toc-ring:not(.toc-unguided)_&]:after:rounded-full",
    "[.toc-ring:not(.toc-unguided)_&]:after:border-solid",
    "[.toc-ring:not(.toc-unguided)_&]:after:border-(length:--toc-thumb-width)",
    "[.toc-ring:not(.toc-unguided)_&]:after:border-(--toc-thumb-color)",
    "[.toc-ring:not(.toc-unguided)_&]:after:[clip-path:inset(max(-2px,var(--toc-thumb-start)-var(--toc-piece-top,0px)+var(--toc-marker-halo)-var(--toc-ring-reach))_-2px_max(-2px,var(--toc-piece-top,0px)+100%-var(--toc-thumb-end)-var(--toc-marker-halo)-var(--toc-ring-reach))_-2px)]",
    // The fill repeats the number in the surface color and shows only where the
    // thumb covers the marker, so the number flips along with the surface.
    "[.toc-fill:not(.toc-unguided)_&]:after:absolute",
    "[.toc-fill:not(.toc-unguided)_&]:after:inset-0",
    "[.toc-fill:not(.toc-unguided)_&]:after:grid",
    "[.toc-fill:not(.toc-unguided)_&]:after:place-items-center",
    "[.toc-fill:not(.toc-unguided)_&]:after:rounded-full",
    "[.toc-fill:not(.toc-unguided)_&]:after:bg-(--toc-thumb-color)",
    "[.toc-fill:not(.toc-unguided)_&]:after:text-(--toc-halo-color)",
    "[.toc-fill:not(.toc-unguided)_&]:after:content-[counter(toc)]",
    "[.toc-fill:not(.toc-unguided)_&]:after:font-semibold",
    "[.toc-fill:not(.toc-unguided)_&]:after:leading-(--toc-marker-size)",
    "[.toc-fill:not(.toc-unguided)_&]:after:[font-size-adjust:0.45]",
    "[.toc-fill:not(.toc-unguided)_&]:after:[clip-path:var(--toc-fill-clip)]",
    "[.toc-fill:not(.toc-unguided)_&]:after:transition-[clip-path]",
    "[.toc-fill:not(.toc-unguided)_&]:after:duration-(--toc-fill-duration,inherit)",
    "[.toc-fill:not(.toc-unguided)_&]:after:ease-[inherit]",
    "motion-reduce:[.toc-fill:not(.toc-unguided)_&]:after:transition-none",
  ],
  defaultVariants: {
    // The same surface as the counters of an ordered list.
    $lightnessOffset: 2.5,
    $ink: 100,
  },
});
