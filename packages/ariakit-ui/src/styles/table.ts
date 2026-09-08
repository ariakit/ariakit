import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button, buttonSlot } from "./button.ts";
import { frame } from "./frame.ts";
import { hover } from "./hover.ts";
import { layer } from "./layer.ts";

// Widths the cell pseudos and the container borders read. The custom properties
// inherit, so setting them on either element reaches the cells. The channel
// suffixes match the Tailwind border utilities that spend them, so
// --table-border-bs pairs with border-bs-*.
type TableBorderValue = boolean | string | number;

function getBorderStyle(channels: readonly string[], value?: TableBorderValue) {
  if (value == null) return;
  const width =
    value === false
      ? "0px"
      : value === true
        ? "1px"
        : typeof value === "number"
          ? `${value}px`
          : value;
  const style: Record<string, string> = {};
  for (const channel of channels) {
    style[`--table-border-${channel}`] = width;
  }
  return { style };
}

// Border variants shared by the table (cell borders) and the container (outer
// borders). Spread into each cv rather than extended: an extended $border does
// not replace frame's own, so both would run and the two meanings would fight.
//
// The side variants are declared after $border, so a narrower one always wins
// over a broader one whatever order the caller passes them in.
const tableBorderVariants = {
  /**
   * Draws borders between cells, and around the container when set on it. The
   * cells draw the grid lines through their own pseudo-elements, so this sets
   * inherited channels rather than a border on the element it is passed to.
   *
   * Use `true` for 1px, a number for a width in pixels, or any length.
   */
  $border(value?: TableBorderValue) {
    return getBorderStyle(["s", "e", "bs", "be"], value);
  },
  /**
   * Overrides `$border` on the inline-start and inline-end sides, the borders
   * between columns.
   */
  $borderInline(value?: TableBorderValue) {
    return getBorderStyle(["s", "e"], value);
  },
  /**
   * Overrides `$border` on the block axis, the borders between rows.
   */
  $borderBlock(value?: TableBorderValue) {
    return getBorderStyle(["bs", "be"], value);
  },
  /**
   * Overrides the inline-start side only.
   */
  $borderInlineStart(value?: TableBorderValue) {
    return getBorderStyle(["s"], value);
  },
  /**
   * Overrides the inline-end side only.
   */
  $borderInlineEnd(value?: TableBorderValue) {
    return getBorderStyle(["e"], value);
  },
  /**
   * Overrides the block axis on the leading side only.
   */
  $borderBlockStart(value?: TableBorderValue) {
    return getBorderStyle(["bs"], value);
  },
  /**
   * Overrides the block axis on the trailing side only.
   */
  $borderBlockEnd(value?: TableBorderValue) {
    return getBorderStyle(["be"], value);
  },
  /**
   * Pulls the column dividers back from the top and bottom of each row by this
   * much, so they read as separate strokes instead of one unbroken line. The
   * rows above and below a line each pull back, so the break where a row border
   * crosses is twice this value, while the gap at the table's own top and
   * bottom edge is one. Numbers scale the spacing token.
   */
  $borderInset(value?: string | number) {
    if (value == null) return;
    return {
      style: { "--table-border-inset": getSpacingValue(value) },
    };
  },
};

export const table = cv({
  extend: [frame],
  class: [
    "relative w-full border-separate border-spacing-0",
    // A copy of this element's resolved border color for the cells to paint
    // with. Each cell pseudo carries ak-layer, which recomputes --ak-edge from
    // the pseudo's own layer, so the color variants stop here without it.
    "[--table-edge:var(--ak-edge)]",
    // The cells spend --ak-frame-padding as their own padding, so $p sets it
    // here and the table element itself stays unpadded. Only the ! beats a
    // padding declared on the same element.
    "p-0!",
  ],
  variants: {
    ...tableBorderVariants,
    /**
     * Overrides the cells' padding-inline. A number scales the spacing token
     * and resolves in each cell, so a smaller header row takes proportionally
     * less and its text stops lining up with the column below it. Pass a length
     * to keep the columns aligned.
     */
    $px(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--table-px": getSpacingValue(value) },
      };
    },
    /**
     * Overrides the cells' block padding. A number scales the spacing token and
     * resolves in each cell, so a smaller header row takes proportionally less.
     */
    $py(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--table-py": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    // The cells draw the grid lines from the $border channels, so frame's
    // computed border type must not react to the truthy $border.
    $borderType: "unset",
    $p: 3,
  },
});

export const tableContainer = cv({
  extend: [frame],
  class: [
    // What rounds the table: overflow does not apply to a table box, so a
    // radius on the table itself is painted over by the corner cells.
    "overflow-clip",
    // The container yields to the width its parent gives it, a grid track or
    // a flex line included, and the scroller takes the overflow. Without this
    // a parent that sizes to content grows to the table's widest row instead.
    "min-w-0",
    // The outer borders follow the same channels as the cell borders.
    "border-s-(length:--table-border-s,0px)",
    "border-e-(length:--table-border-e,0px)",
    "border-bs-(length:--table-border-bs,0px)",
    "border-be-(length:--table-border-be,0px)",
  ],
  variants: {
    ...tableBorderVariants,
  },
  defaultVariants: {
    // The channel borders replace the frame border machinery, whose computed
    // default would otherwise react to the truthy $border.
    $borderType: "unset",
    $rounded: "xl",
    $p: "none",
  },
});

export const tableScroller = cv({
  class: [
    "max-h-[inherit] overflow-auto",
    // Scrollbars follow the surface even when the theme differs from the system
    // scheme.
    "ak-dark:scheme-dark ak-light:scheme-light",
  ],
});

export const tableRowGroup = cv({
  extend: [layer],
  class: [
    "relative",
    // Edge flags read by the rows so the cell pseudos skip the block borders at
    // the very top and bottom of the table.
    "[&:is(thead):first-of-type]:[--table-rowgroup-first:1]",
    "[:not(:has(thead))>&:first-child]:[--table-rowgroup-first:1]",
    "[&:is(tfoot):last-of-type]:[--table-rowgroup-last:1]",
    "[:not(:has(tfoot))>&:last-child]:[--table-rowgroup-last:1]",
  ],
  variants: {
    /**
     * Keeps the row group on screen while the scroller scrolls. It sits above a
     * pinned cell (see $sticky in tableCell), which sits above a hovered row's
     * cells.
     */
    $sticky: {
      top: "z-4 sticky top-0",
      bottom: "z-4 sticky bottom-0",
    },
  },
});

export const tableHead = cv({
  extend: [tableRowGroup],
  class: "whitespace-nowrap text-sm",
  defaultVariants: {
    // The header reads as its own band above the rows.
    $lightnessOffset: 0.5,
  },
});

export const tableFoot = cv({
  extend: [tableRowGroup],
});

export const tableRow = cv({
  extend: [layer, hover],
  class: [
    // Rows at the group edges forward the flags to their cells.
    "first-of-type:[--table-row-first:var(--table-rowgroup-first,0)]",
    "last-of-type:[--table-row-last:var(--table-rowgroup-last,0)]",
    // The block lines the row's cells draw: the line above the row, which
    // sits in their first row of pixels, and the line below it, which they
    // paint into the next row's first. The table's first and last rows draw
    // none at its edges.
    "[--table-row-line-bs:calc(var(--table-border-bs,0px)*(1-var(--table-row-first,0)))]",
    "[--table-row-line-be:calc(var(--table-border-be,0px)*(1-var(--table-row-last,0)))]",
    // The container's corners, for the rows at the very top and bottom of the
    // table, inside the container's own border so the curves stay concentric.
    // A ring at a corner follows the clip instead of being sliced by it. The
    // cells read these for their own corners.
    "[--table-row-radius-bs:calc((var(--ak-frame-radius,0px)-var(--table-border-bs,0px))*var(--table-row-first,0))]",
    "[--table-row-radius-be:calc((var(--ak-frame-radius,0px)-var(--table-border-be,0px))*var(--table-row-last,0))]",
  ],
  variants: {
    /**
     * Tints the row on hover, through `$hoverOffset`. The z bumps keep the
     * hovered row's cell pseudos above the neighbors' borders.
     */
    $hover: "ui-hover:z-2 ui-hover:*:z-2",
    /**
     * Draws a ring around the row while it has keyboard focus, and how thick. A
     * ring set on the row itself paints under its positioned cells, so the ring
     * is a pseudo-element laid over them (see refine).
     */
    $focus: {
      1: "ui-focus-visible:after:border",
      true: "ui-focus-visible:after:border-2",
      2: "ui-focus-visible:after:border-2",
      3: "ui-focus-visible:after:border-3",
    },
    /**
     * Tints the row while it is selected, which `aria-selected="true"` on the
     * row says: the brand colour mixed into the surface. It goes on the layer
     * channel, so a hover still steps on top of it, and it reaches a pinned
     * cell, which paints its own layer from the row's.
     */
    $selected: "ui-selected:ak-layer-brand ui-selected:ak-layer-mix-15",
  },
  defaultVariants: {
    $focus: true,
    $hoverOffset(defaultValue, variants) {
      if (!variants.$hover) return defaultValue;
      return defaultValue ?? 0.5;
    },
  },
  refine({ variants, addClass }) {
    if (!variants.$focus) return;
    addClass([
      "ak-outline ak-outline-brand",
      // The row opens a stacking context at the hovered level, so the ring
      // stays under a sticky row group, and the pseudo goes over every cell
      // of the row, a pinned one included.
      "ui-focus-visible:relative ui-focus-visible:z-2",
      // The row still takes real DOM focus, so the browser's own ring goes.
      "ui-focus-visible:outline-none",
      // The box starts under the line above the row, which the cells hold
      // in their first row of pixels, so the ring sits inside the lines on
      // every side.
      "ui-focus-visible:after:absolute ui-focus-visible:after:inset-x-0",
      "ui-focus-visible:after:inset-bs-(--table-row-line-bs)",
      "ui-focus-visible:after:inset-be-0",
      "ui-focus-visible:after:z-5 ui-focus-visible:after:pointer-events-none",
      "ui-focus-visible:after:border-(--ak-outline)",
      "ui-focus-visible:after:rounded-t-(--table-row-radius-bs)",
      "ui-focus-visible:after:rounded-b-(--table-row-radius-be)",
    ]);
  },
});

export const tableCell = cv({
  extend: [layer],
  class: [
    "relative z-1",
    // The header of a sorted column takes the full ink; the sort button in it
    // says which way (see tableSortIndicator).
    "aria-[sort=ascending]:ak-ink-100 aria-[sort=descending]:ak-ink-100",
    // The cell padding: the table's channels, or else its frame padding,
    // resolved here so a control in the cell can still read them once its
    // own frame has moved --ak-frame-padding on (see tableSortButton).
    "[--table-cell-px:var(--table-px,var(--ak-frame-padding,0px))]",
    "[--table-cell-py:var(--table-py,var(--ak-frame-padding,0px))]",
    "px-(--table-cell-px) py-(--table-cell-py)",
    // The dividers this cell draws: its start line in the last column of
    // pixels of the cell before, its end line in the first column of the
    // cell after, so the cells at the table's edges draw none there. Both go
    // on, because either neighbour can paint over the other, a pinned cell
    // for one.
    "[--table-cell-line-s:var(--table-border-s,0px)] first:[--table-cell-line-s:0px]",
    "[--table-cell-line-e:var(--table-border-e,0px)] last:[--table-cell-line-e:0px]",
    // The lines the cell box holds, which the ring stays inside of: the line
    // above the row in its first row of pixels (see tableRow), and the
    // divider after the column in its last column of pixels, drawn there by
    // the next cell, which the last cell of a row has no more of.
    "[--table-cell-next-s:var(--table-border-s,0px)] last:[--table-cell-next-s:0px]",
    // The ::after pseudo paints the cell's surface and every grid line. It
    // runs from the line above the row to the line below it, and from the
    // start divider to the end one, both outside the cell box.
    "after:absolute after:-z-2 after:pointer-events-none after:ak-layer",
    "after:inset-bs-0 after:-inset-be-(--table-row-line-be)",
    "after:-inset-s-(--table-cell-line-s) after:-inset-e-(--table-cell-line-e)",
    // Every grid line is a stripe of the pseudo's background. The lines
    // paint with the table's copy of the edge, and fall back to the edge the
    // ak-layer just computed here, which is what a cell outside a table
    // draws. Stripes rather than borders: a border and a gradient of the
    // same translucent colour paint differently in Chromium once the colour
    // leaves the sRGB gamut, and the four lines have to match.
    "[--table-cell-line:linear-gradient(var(--table-edge,var(--ak-edge)),var(--table-edge,var(--ak-edge)))]",
    "after:bg-no-repeat",
    "after:bg-[image:var(--table-cell-line),var(--table-cell-line),var(--table-cell-line),var(--table-cell-line)]",
    // The block lines run the pseudo's whole width, at its top and its
    // bottom edge, which is the line below the row. The dividers start
    // below the line above, so no crossing paints twice, or lower by
    // $borderInset, and stop short of the bottom line by the same inset.
    "[--table-cell-divider-top:max(var(--table-border-inset,0px),var(--table-row-line-bs))]",
    "[--table-cell-divider-h:calc(100%-var(--table-row-line-be)-var(--table-border-inset,0px)-var(--table-cell-divider-top))]",
    "after:bg-size-[100%_var(--table-row-line-bs),100%_var(--table-row-line-be),var(--table-cell-line-s)_var(--table-cell-divider-h),var(--table-cell-line-e)_var(--table-cell-divider-h)]",
    "after:bg-position-[left_top,left_bottom,left_top_var(--table-cell-divider-top),right_top_var(--table-cell-divider-top)]",
    // The ::before pseudo is the keyboard focus ring: a box inset by the
    // lines the cell holds, so the ring sits just inside them on every side,
    // and a hovered neighbour, which paints over those lines, never touches
    // it. It lies over the surface pseudo and under the content.
    "before:absolute before:-z-1 before:pointer-events-none",
    "before:inset-s-0 before:inset-be-0",
    "before:inset-bs-(--table-row-line-bs) before:inset-e-(--table-cell-next-s)",
    "before:border-(--ak-outline)",
    // At the container's corners the ring follows the rounding (see
    // tableRow).
    "first:before:rounded-ss-(--table-row-radius-bs) first:before:rounded-es-(--table-row-radius-be)",
    "last:before:rounded-se-(--table-row-radius-bs) last:before:rounded-ee-(--table-row-radius-be)",
    // A focusable cell takes real DOM focus, so the browser's own ring goes.
    "ui-focus-visible:outline-none",
  ],
  variants: {
    /**
     * Whether the cell is a header, and which kind.
     */
    $header: {
      false: "",
      column: "ak-ink-70 text-start font-semibold",
      row: "text-start font-semibold",
    },
    /**
     * Aligns and formats the cell for numbers.
     */
    $numeric: "text-end tabular-nums",
    /**
     * Pins the cell to the start or the end edge of the scroller while the
     * table scrolls sideways, for the column that names the rows. Set it on
     * every cell of the column, the head's included. The cell paints its row's
     * surface, so the columns sliding under it stay hidden. The z puts it above
     * a hovered row's cells, which the row lifts with a rule of higher
     * specificity (see $hover in tableRow), and below a sticky row group.
     */
    $sticky: {
      start: "z-3! sticky inset-s-0",
      end: "z-3! sticky inset-e-0",
    },
    /**
     * Draws a ring inside the cell while it has keyboard focus, and how thick.
     * The ring is the cell's ::before pseudo-element (see the class list).
     */
    $focus: {
      1: "ui-focus-visible:before:border",
      true: "ui-focus-visible:before:border-2",
      2: "ui-focus-visible:before:border-2",
      3: "ui-focus-visible:before:border-3",
    },
    /**
     * Sizes the column to its content, for a checkbox or an icon column. The
     * table is laid out automatically, so the surplus width still spreads over
     * every column; give one other column `$grow` to take all of it. In
     * declarative rows both come from the head cell and reach the column.
     */
    $fit: "w-0 whitespace-nowrap",
    /**
     * Takes the surplus width of the table, so a `$fit` column stays at its
     * content width.
     */
    $grow: "w-full",
  },
  defaultVariants: {
    $header: false,
    $focus: true,
    $layer(defaultValue, variants) {
      if (!variants.$sticky) return defaultValue;
      return defaultValue ?? true;
    },
  },
  refine({ variants, addClass }) {
    if (!variants.$focus) return;
    addClass("ak-outline ak-outline-brand");
  },
});

/**
 * The control of a sortable column header: a button that runs edge to edge over
 * the header cell, with the label where the plain header put it and a
 * `tableSortIndicator` after it. The header cell's `aria-sort` says how the
 * column is sorted; the button paints its hover against the head band.
 */
export const tableSortButton = cv({
  extend: [button],
  class: [
    // The cover reads the padding the cell resolved for itself (see
    // tableCell): the cell spends the table's channels rather than the
    // frame's, so a frame cover would miss a table with a $px or $py of its
    // own, and the button's own frame has moved --ak-frame-padding on. The
    // negative margins take the cell padding back, and the width is written
    // out because a block-level button still shrink-wraps.
    "-my-(--table-cell-py) -mx-(--table-cell-px)",
    "w-[calc(100%+var(--table-cell-px)*2)]",
    "justify-start text-start",
    // The header's own weight and ink, which the button would otherwise set:
    // a sorted column's header is darker than the others.
    "[font-weight:inherit] text-inherit",
    // The label comes up to the full ink with the pointer or the keyboard on
    // it, and the indicator reads the same channel, a share of the ink from
    // 0 to 1 (see tableSortIndicator).
    "[--table-sort-ink:0.4]",
    "ui-hover:ak-ink-100 ui-hover:[--table-sort-ink:1]",
    "ui-focus-visible:ak-ink-100 ui-focus-visible:[--table-sort-ink:1]",
  ],
  variants: {
    /**
     * Extends the ring offsets with `inset`, which draws the ring inside the
     * button: it covers the cell to its edges, where a ring outside it would
     * run under the neighbouring cells.
     */
    $focusOffset: {
      inset: "-outline-offset-2",
    },
    /**
     * Puts the indicator before the label, so the label stays on the digits of
     * a numeric column.
     */
    $numeric: "flex-row-reverse",
  },
  defaultVariants: {
    // The plain cell padding on both axes: the control's optical side padding
    // would move the label off the column under it.
    $p: "var(--table-cell-py)",
    $px: "var(--table-cell-px)",
    $rounded: "none",
    $focusOffset: "inset",
  },
});

/**
 * The sort indicator in a `tableSortButton`: a pair of chevrons while the
 * column is not sorted, kept faint so the column still reads as sortable, and
 * one arrow once it is, which the header cell's `aria-sort` turns around for a
 * descending sort.
 */
export const tableSortIndicator = cv({
  extend: [buttonSlot],
  class: [
    // The glyph runs a little past the text size; the slot box stays a named
    // step, which only decides where the glyph centres.
    "[--slot-icon-size:1.1em]",
    "transition-[rotate] duration-150 motion-reduce:transition-none",
    "in-aria-[sort=descending]:rotate-180",
    "in-aria-[sort=none]:ak-ink-(--table-sort-ink)",
  ],
  defaultVariants: {
    $size: "lg",
  },
});
