import { cv } from "clava";
import { getScaledStyleClass } from "../utils/styles.ts";
import { edge } from "./edge.ts";
import { nav, navGroupLabel, navLink } from "./nav.ts";

/**
 * A table of contents: a navigation region whose rows sit along a guide that
 * bends into nested lists. A thumb covers the guide along the rows whose
 * sections are on screen, between `--toc-thumb-start` and `--toc-thumb-end`,
 * which the style component sets in pixels from the top of this element.
 */
export const toc = cv({
  extend: [nav],
  class: [
    "toc",
    "[--toc-indent:--spacing(3)]",
    "[--toc-guide-width:1px]",
    // Normalize the 0–100 contrast scale so high contrast adds only 20%, like
    // the bar of a nav link.
    "[--toc-thumb-width:calc(2px*(1+0.2*var(--contrast,0)/100))]",
    "[--toc-marker-halo:--spacing(1)]",
    // Colors resolve against this element, so pieces inside a current link
    // keep the colors of the surface around the rows. The thumb takes the text
    // color at full strength.
    "[--toc-guide-color:var(--ak-edge)]",
    "[--toc-thumb-color:oklch(from_var(--ak-text)_l_c_h_/_1)]",
    "[--toc-halo-color:var(--ak-layer)]",
    "forced-colors:[--toc-guide-color:GrayText]",
    "forced-colors:[--toc-thumb-color:CanvasText]",
    "forced-colors:[--toc-halo-color:Canvas]",
    // Pieces read the animated range in every frame, so the thumb moves as one
    // bar through the bends.
    "transition-[--toc-thumb-start,--toc-thumb-end] duration-200",
    "ease-[cubic-bezier(0.25,0.7,0.3,1)] motion-reduce:transition-none",
  ],
  variants: {
    /**
     * Sets the font size of the label and the rows, which also scales their
     * padding and the guide. `auto` inherits the parent font size. Defaults to
     * `sm`.
     */
    $size: {
      auto: "",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    /**
     * Sets the look of the guide along the rows: `smooth` bends into nested
     * lists with curves, `diagonal` with slanted lines, `rail` keeps one
     * straight line for all levels, and `false` shows the indent only, with no
     * guide and no thumb. Defaults to `smooth`.
     */
    $guide: {
      // Guide pieces read these flags: whether rows bend between levels, and
      // whether a bend curves or runs straight.
      smooth: "toc-smooth [--toc-bends:1] [--toc-curve:1]",
      diagonal: "toc-diagonal [--toc-bends:1] [--toc-curve:0]",
      rail: "toc-rail [--toc-bends:0] [--toc-curve:1]",
      false: "toc-unguided",
    },
    /**
     * Numbers the top-level rows with markers on the guide. The `ordered` prop
     * of the style component sets it and renders an ordered list.
     */
    $ordered: {
      true: "toc-ordered [counter-reset:toc]",
      false: "",
    },
    /**
     * Draws a ring in the thumb color outside each number marker where the
     * thumb passes, so the thumb runs through the marker. With `false`, the
     * markers cover the thumb. Needs `$ordered` and a guide. Defaults to
     * `true`.
     */
    $markerRing: {
      true: "toc-ring",
      false: "",
    },
  },
  defaultVariants: {
    $size: "sm",
    $guide: "smooth",
    $markerRing: true,
    $gap: 0.5,
  },
  refine({ variants, addClass }) {
    // The guide sits in a gutter before the top-level rows. Number markers need
    // a wider gutter, with room for the halo and ring before the surface of a
    // current row.
    if (variants.$ordered) {
      addClass([
        "[--toc-guide-offset:calc((1lh-0.4em)/2+var(--toc-marker-halo)+2px)]",
        "[--toc-gutter:calc(var(--toc-guide-offset)+(1lh-0.4em)/2+var(--toc-marker-halo))]",
      ]);
      return;
    }
    if (variants.$guide === false) {
      addClass("[--toc-guide-offset:0px] [--toc-gutter:0px]");
      return;
    }
    addClass([
      "[--toc-guide-offset:--spacing(2)]",
      "[--toc-gutter:calc(var(--toc-guide-offset)+--spacing(1))]",
    ]);
  },
});

/** The title above the rows, which names the table of contents. */
export const tocLabel = cv({
  extend: [navGroupLabel],
  class: [
    // Line up with the text of the top-level rows after the guide gutter.
    "toc-label ms-(--toc-gutter,0px)",
    // The guide starts at the first row, so the label needs more room than a
    // group label to stay apart from it.
    "mb-(--nav-py)",
  ],
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
});

/**
 * Shared geometry of the guide and thumb pieces. Each piece draws the bend from
 * the previous row and the line along its own row, so the pieces of all rows
 * join into one guide. List selectors decide the bends, so the guide renders
 * before any script runs.
 */
const tocLinkPiece = cv({
  class: [
    "absolute pointer-events-none z-1 [.toc-unguided_&]:hidden",
    // The toc root sets system colors in forced colors.
    "forced-colors:forced-color-adjust-none",
    // Levels to bend in from the parent or out to an earlier level. The first
    // row of the outermost list starts the guide.
    "[--toc-first:0] [li:first-child>*>&]:[--toc-first:var(--toc-lead,0)]",
    "[--toc-in-raw:0] [.toc-list_.toc-list>li:first-child>*>&]:[--toc-in-raw:1]",
    "[--toc-out-raw:0] [li:has(>.toc-list)+li>*>&]:[--toc-out-raw:1]",
    "[li:has(>.toc-list>li:last-child>.toc-list)+li>*>&]:[--toc-out-raw:2]",
    "[--toc-in:calc(min(var(--toc-in-raw),var(--toc-in-cap,0))*var(--toc-bends,1))]",
    "[--toc-out:calc(min(var(--toc-out-raw),var(--toc-out-cap,0))*var(--toc-bends,1))]",
    "[--toc-bent:min(1,var(--toc-in)+var(--toc-out))]",
    "[--toc-outward:min(1,var(--toc-out))]",
    "[--toc-span:calc((var(--toc-in)+var(--toc-out))*var(--toc-indent))]",
    // A bend runs from the end of the previous line, through the gap between
    // the rows, to the start of this one. The script measures the same inset
    // from the row edges to place the thumb.
    "[--toc-joint:var(--py,0px)]",
    "[--toc-bend-height:calc(var(--nav-gap,0px)+var(--toc-joint)*2)]",
    // The rail keeps the guide of the outermost list at every level.
    "[--toc-x:calc(-1*var(--toc-guide-offset,0px)-(1-var(--toc-bends,1))*var(--toc-depth,0)*var(--toc-indent))]",
    "top-[calc(var(--toc-joint)-(1-var(--toc-first))*var(--toc-bend-height))]",
    "bottom-(--toc-joint)",
    "inset-s-[calc(var(--toc-x)-var(--toc-line)/2-var(--toc-in)*var(--toc-indent))]",
    "w-[calc(var(--toc-span)+var(--toc-line))]",
    // Mirror diagonal bends in right to left text. Logical insets mirror the
    // rest.
    "[--toc-dir:1] rtl:[--toc-dir:-1]",
    // The first half of a smooth bend is a quarter curve from the previous
    // line. A diagonal bend is one slanted line instead. A straight piece
    // leaves it empty.
    "before:absolute before:top-0 before:box-border before:border-solid before:border-(--toc-line-color)",
    "before:inset-s-[calc(var(--toc-outward)*(var(--toc-curve)*(var(--toc-span)+var(--toc-line))/2+(1-var(--toc-curve))*var(--toc-span)))]",
    "before:w-[calc(var(--toc-curve)*(var(--toc-span)+var(--toc-line))/2)]",
    "before:h-[calc(var(--toc-curve)*(var(--toc-bend-height)+var(--toc-line))/2+(1-var(--toc-curve))*var(--toc-bent)*hypot(var(--toc-span),var(--toc-bend-height)))]",
    "before:border-s-[length:calc(var(--toc-line)*(var(--toc-curve)*var(--toc-in)+(1-var(--toc-curve))*var(--toc-bent)))]",
    "before:border-e-[length:calc(var(--toc-line)*var(--toc-curve)*var(--toc-outward))]",
    "before:border-be-[length:calc(var(--toc-line)*var(--toc-curve)*var(--toc-bent))]",
    "before:rounded-es-[calc(100%*var(--toc-curve)*var(--toc-in))]",
    "before:rounded-ee-[calc(100%*var(--toc-curve)*var(--toc-outward))]",
    "before:origin-top",
    "before:rotate-[calc(var(--toc-dir)*(1-var(--toc-curve))*(var(--toc-outward)-var(--toc-in))*atan2(var(--toc-span),var(--toc-bend-height)))]",
    // The second half of a smooth bend curves into this row and continues as
    // the line along it. Other pieces draw only the line.
    "after:absolute after:bottom-0 after:box-border after:border-solid after:border-(--toc-line-color)",
    "after:top-[calc(var(--toc-bent)*(var(--toc-curve)*(var(--toc-bend-height)-var(--toc-line))/2+(1-var(--toc-curve))*var(--toc-bend-height)))]",
    "after:inset-s-[calc(var(--toc-in)*(var(--toc-curve)*(var(--toc-span)+var(--toc-line))/2+(1-var(--toc-curve))*var(--toc-span)))]",
    "after:w-[calc(var(--toc-curve)*max(var(--toc-line),(var(--toc-span)+var(--toc-line))/2))]",
    "after:border-bs-[length:calc(var(--toc-line)*var(--toc-curve)*var(--toc-bent))]",
    "after:border-e-[length:calc(var(--toc-line)*var(--toc-curve)*var(--toc-in))]",
    "after:border-s-[length:calc(var(--toc-line)*(1-var(--toc-curve)*var(--toc-in)))]",
    "after:rounded-se-[calc(var(--toc-curve)*var(--toc-in)*(var(--toc-span)+var(--toc-line))/2)_calc(var(--toc-curve)*var(--toc-in)*(var(--toc-bend-height)+var(--toc-line))/2)]",
    "after:rounded-ss-[calc(var(--toc-curve)*var(--toc-outward)*(var(--toc-span)+var(--toc-line))/2)_calc(var(--toc-curve)*var(--toc-outward)*(var(--toc-bend-height)+var(--toc-line))/2)]",
  ],
});

/** A hidden piece of a link that draws its part of the guide. */
export const tocLinkGuide = cv({
  extend: [tocLinkPiece],
  class: [
    "toc-link-guide",
    "[--toc-line:var(--toc-guide-width,1px)] [--toc-line-color:var(--toc-guide-color)]",
    // Fade out after the last row.
    "[--toc-end:0] [li:last-child:not(:has(>.toc-list))>*>&]:[--toc-end:1]",
    "[li:last-child:not(:has(>.toc-list))>*>&]:mask-[linear-gradient(to_bottom,#000_calc(100%-var(--toc-tail,0)*var(--toc-end)*--spacing(2)),transparent)]",
  ],
});

/**
 * A hidden piece of a link that draws its part of the thumb over the guide.
 * Every piece shows only its part between `--toc-thumb-start` and
 * `--toc-thumb-end`, measured from `--toc-piece-top`, its own top relative to
 * the same origin, so the pieces join into one bar while the range animates.
 */
export const tocLinkThumb = cv({
  extend: [tocLinkPiece],
  class: [
    "toc-link-thumb",
    "[--toc-line:var(--toc-thumb-width,2px)] [--toc-line-color:var(--toc-thumb-color)]",
    // Negative side insets keep the slanted lines of diagonal bends whole. A
    // piece that the range doesn't cut keeps its edges outside the clip, which
    // otherwise leaves seams between pieces at fractional pixel positions.
    "[clip-path:inset(max(-1px,var(--toc-thumb-start)-var(--toc-piece-top,0px))_-0.5em_max(-1px,var(--toc-piece-top,0px)+100%-var(--toc-thumb-end))_-0.5em)]",
  ],
});

/**
 * A hidden number marker on the guide at a top-level row of an ordered table of
 * contents. A halo in the surface color cuts the guide around it, and with
 * `$markerRing` on the toc, a ring in the halo lights up where the thumb
 * passes.
 */
export const tocLinkMarker = cv({
  extend: [edge],
  class: [
    "toc-link-marker absolute pointer-events-none grid place-items-center rounded-full z-2",
    // The marker sits outside the link, on the surface around the rows.
    "[.ak-layer>&]:ak-outset",
    "[--toc-marker-size:calc(1lh-0.4em)] size-(--toc-marker-size)",
    "top-[calc(var(--py,0px)+0.2em)]",
    "inset-s-[calc(-1*var(--toc-guide-offset,0px)-var(--toc-marker-size)/2)]",
    "[counter-increment:toc]",
    "before:content-[counter(toc)] before:font-semibold",
    "before:leading-(--toc-marker-size) before:[font-size-adjust:0.45]",
    // A shadow halo, unlike an outline, paints under the ring.
    "shadow-[0_0_0_var(--toc-marker-halo)_var(--toc-halo-color)]",
    // Keep the halo and the ring in forced colors, with system colors.
    "forced-colors:forced-color-adjust-none",
    "forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
    "forced-colors:inset-ring forced-colors:inset-ring-[CanvasText]",
    // The ring is clipped to the thumb range widened by the halo, so a marker
    // is either lit or not while the thumb is still. An empty range, with no
    // section on screen, doesn't widen.
    "[--toc-ring-reach:min(var(--toc-marker-halo),max(0px,(var(--toc-thumb-end)-var(--toc-thumb-start))*1000))]",
    "[.toc-ring:not(.toc-unguided)_&]:after:absolute",
    "[.toc-ring:not(.toc-unguided)_&]:after:-inset-(--toc-marker-halo)",
    "[.toc-ring:not(.toc-unguided)_&]:after:rounded-full",
    "[.toc-ring:not(.toc-unguided)_&]:after:border-solid",
    "[.toc-ring:not(.toc-unguided)_&]:after:border-(length:--toc-thumb-width)",
    "[.toc-ring:not(.toc-unguided)_&]:after:border-(--toc-thumb-color)",
    "[.toc-ring:not(.toc-unguided)_&]:after:[clip-path:inset(max(-2px,var(--toc-thumb-start)-var(--toc-piece-top,0px)+var(--toc-marker-halo)-var(--toc-ring-reach))_-2px_max(-2px,var(--toc-piece-top,0px)+100%-var(--toc-thumb-end)-var(--toc-marker-halo)-var(--toc-ring-reach))_-2px)]",
  ],
  defaultVariants: {
    // The same surface as the counters of an ordered list.
    $lightnessOffset: 2.5,
    $ink: 100,
  },
});
