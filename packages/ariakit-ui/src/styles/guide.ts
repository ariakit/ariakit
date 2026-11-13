import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { edge, hasEdgeColor } from "./edge.ts";

/**
 * A piece of a guide: a line that runs along a row and can bend from one column
 * to the next one at the top of the piece. The pieces of adjacent rows join
 * into one guide. The piece spans both columns: its start edge is the start
 * column and its end edge is the end column, each widened by the line. Its
 * `::before` draws the first half of the bend, and its `::after` draws the
 * second half and the line. A piece that doesn't bend draws only the line,
 * along its start edge.
 *
 * The line takes the edge color of the piece, so the edge variants color it. A
 * chosen `$edge` color shows at full strength, and it gets darker or lighter
 * when it has less than 3:1 against the surface around the piece. The recipe
 * that extends this one places the piece and sets these values on it or on an
 * element around it:
 *
 * - `--guide-in`: `1` to bend from the start column to the end column.
 * - `--guide-outward`: `1` to bend from the end column to the start column.
 * - `--guide-span`: the distance between the two columns.
 * - `--guide-bend-height`: how tall the bend is, from the top of the piece.
 * - `--guide-width`: the width of the line.
 * - `--guide-color`: a color for the line, in place of the edge color. Use it
 *   for a color that another element resolves, with `$layer: false`.
 */
export const guide = cv({
  extend: [edge],
  class: [
    "absolute pointer-events-none",
    // Keep the line in forced colors, with a system color.
    "forced-colors:forced-color-adjust-none forced-colors:[--ak-edge:CanvasText]",
    "[--guide-bent:min(1,var(--guide-in)+var(--guide-outward))]",
    // The two curves of a bend take the same share of it, so they have the
    // same size.
    "[--guide-bend-lower:0.5]",
    // At whole scales, a whole number of pixels gives both curves one exact edge.
    // Fractions could round to an overlap, which darkens a pixel of a translucent
    // guide. The span leaves room for the border of the other curve.
    "[--guide-bend-lower-width:min(var(--guide-span),round(calc((var(--guide-span)+var(--guide-width))*var(--guide-bend-lower)),1px))]",
    // The radius of the curves grows with the span, so a wide bend does not
    // look square, and a narrow bend keeps a radius that is easy to see.
    "[--guide-radius:max(--spacing(1.5),var(--guide-span)/3)]",
    // A curve is a quarter of a circle, so its radius is at most the width and
    // the height of its half of the bend. A straight part joins two curves that
    // don't fill the bend.
    "[--guide-curve-radius:min(var(--guide-radius),var(--guide-bend-lower-width),var(--guide-span)+var(--guide-width)-var(--guide-bend-lower-width),(var(--guide-bend-height)+var(--guide-width))*var(--guide-bend-lower))]",
    // Mirror diagonal bends in right to left text. Logical insets mirror the
    // rest.
    "[--guide-dir:1] rtl:[--guide-dir:-1]",
    // The first half of a smooth bend is a quarter curve from the previous
    // line. A diagonal bend is one slanted line instead. A straight piece
    // leaves it empty.
    "before:absolute before:top-0 before:box-content before:border-(--guide-color,var(--ak-edge))",
    // Browsers snap a box and its border to device pixels separately, so at
    // fractional scales a border can be thinner than the line. A border at the
    // far side of a box keeps the column or row of the line only if the box
    // adds the border after the content, which ends where the line starts. The
    // height and the minimum width do that, and an inset as wide as the line
    // keeps the automatic width below that minimum. Without a far border, the
    // insets end a curve where the next starts. A slanted line keeps a box as
    // wide as its border, which is where it rotates.
    "before:inset-s-[calc(var(--guide-outward)*(var(--guide-curve)*var(--guide-bend-lower-width)+(1-var(--guide-curve))*var(--guide-span)))]",
    "before:inset-e-[calc((1-var(--guide-curve)*var(--guide-outward))*(var(--guide-curve)*var(--guide-bend-lower-width)+(1-var(--guide-curve))*(var(--guide-span)+var(--guide-width)))+var(--guide-curve)*var(--guide-outward)*var(--guide-width))]",
    "before:min-w-[calc(var(--guide-curve)*var(--guide-outward)*(var(--guide-span)-var(--guide-bend-lower-width)))]",
    "before:h-[calc(var(--guide-curve)*((var(--guide-bend-height)+var(--guide-width))*(1-var(--guide-bend-lower))-var(--guide-width))+(1-var(--guide-curve))*var(--guide-bent)*hypot(var(--guide-span),var(--guide-bend-height)))]",
    "before:border-s-[calc(var(--guide-width)*(var(--guide-curve)*var(--guide-in)+(1-var(--guide-curve))*var(--guide-bent)))]",
    "before:border-e-[calc(var(--guide-width)*var(--guide-curve)*var(--guide-outward))]",
    "before:border-be-[calc(var(--guide-width)*var(--guide-curve)*var(--guide-bent))]",
    "before:rounded-es-[calc(var(--guide-curve-radius)*var(--guide-curve)*var(--guide-in))]",
    "before:rounded-ee-[calc(var(--guide-curve-radius)*var(--guide-curve)*var(--guide-outward))]",
    // Only a diagonal bend rotates. A rotation of zero degrees still makes
    // Firefox paint the curve one device pixel away from the line it leaves.
    // This rule is for a piece that takes the shape from an element around
    // it, and the `$bend` variant has the rule for its own shape.
    "before:origin-top",
    "[@container_style(--guide-curve:_0)]:before:rotate-[calc(var(--guide-dir)*(var(--guide-outward)-var(--guide-in))*atan2(var(--guide-span),var(--guide-bend-height)))]",
    // The second half of a smooth bend curves into this row and continues as
    // the line along it. Other pieces draw only the line.
    "after:absolute after:bottom-0 after:box-content after:border-(--guide-color,var(--ak-edge))",
    "after:top-[calc(var(--guide-bent)*(var(--guide-curve)*((var(--guide-bend-height)+var(--guide-width))*(1-var(--guide-bend-lower))-var(--guide-width))+(1-var(--guide-curve))*var(--guide-bend-height)))]",
    "after:inset-s-[calc(var(--guide-in)*(var(--guide-curve)*(var(--guide-span)+var(--guide-width)-var(--guide-bend-lower-width))+(1-var(--guide-curve))*var(--guide-span)))]",
    "after:inset-e-[calc((1-var(--guide-in))*(var(--guide-span)+var(--guide-width)-var(--guide-curve)*max(var(--guide-width),var(--guide-bend-lower-width)))+var(--guide-curve)*var(--guide-in)*var(--guide-width))]",
    "after:min-w-[calc(var(--guide-curve)*var(--guide-in)*(var(--guide-bend-lower-width)-var(--guide-width)))]",
    "after:border-bs-[calc(var(--guide-width)*var(--guide-curve)*var(--guide-bent))]",
    "after:border-e-[calc(var(--guide-width)*var(--guide-curve)*var(--guide-in))]",
    "after:border-s-[calc(var(--guide-width)*(1-var(--guide-curve)*var(--guide-in)))]",
    "after:rounded-se-[calc(var(--guide-curve-radius)*var(--guide-curve)*var(--guide-in))]",
    "after:rounded-ss-[calc(var(--guide-curve-radius)*var(--guide-curve)*var(--guide-outward))]",
  ],
  variants: {
    /**
     * Sets the shape of a bend: two curves with a straight part between them
     * (`smooth`), or one slanted line (`diagonal`). `false` sets no shape, for
     * a piece that takes `--guide-curve` from an element around it, with `1`
     * for curves or `0` for a slanted line.
     */
    $bend: {
      smooth: "[--guide-curve:1]",
      diagonal: [
        "[--guide-curve:0]",
        "before:rotate-[calc(var(--guide-dir)*(var(--guide-outward)-var(--guide-in))*atan2(var(--guide-span),var(--guide-bend-height)))]",
      ],
      false: "",
    },
    /**
     * Sets the radius of the curves of a smooth bend. The curves never get
     * larger than the bend. By default, the radius is a third of the distance
     * between the two columns, and at least `1.5`. Numbers scale the spacing
     * token.
     */
    $radius(value?: string | number) {
      if (value == null) return;
      return { style: { "--guide-radius": getSpacingValue(value) } };
    },
    /**
     * Sets the line style. Dashes and dots start again in each piece and in
     * each curve of a bend.
     */
    $line: {
      solid: "before:border-solid after:border-solid",
      dashed: "before:border-dashed after:border-dashed",
      dotted: "before:border-dotted after:border-dotted",
    },
  },
  defaultVariants: {
    // Resolve the edge against the surface around the piece without painting a
    // layer over the guides under it.
    $layer: "transparent",
    $bend: "smooth",
    $line: "solid",
    // A chosen color shows at full strength, like the lane of a commit graph,
    // not at the alpha of a neutral edge.
    $edgeRaw(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!hasEdgeColor(variants.$edge)) return defaultValue;
      return true;
    },
    // A chosen color carries meaning, such as the lane of a commit graph, so it
    // keeps 3:1 or more against the surface around the piece. A color with less
    // contrast, such as a yellow on a light surface, moves its lightness.
    $edgeContrast(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!hasEdgeColor(variants.$edge)) return defaultValue;
      return true;
    },
  },
});
