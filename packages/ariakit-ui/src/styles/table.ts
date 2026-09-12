import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button, buttonSlot } from "./button.ts";
import { frame } from "./frame.ts";
import { hover } from "./hover.ts";
import { layer } from "./layer.ts";
import { padding } from "./padding.ts";

// Widths the cells and the container spend, as plain numbers of pixels: the
// cells cut their lines out of one image (see tableCell), and an image slice
// takes a number. The custom properties inherit, so setting them on either
// element reaches the cells. The channel suffixes match the Tailwind border
// utilities that spend them, so --table-border-bs pairs with border-bs-*.
type TableBorderValue = boolean | number;

function getBorderStyle(channels: readonly string[], value?: TableBorderValue) {
  if (value == null) return;
  const width = value === false ? 0 : value === true ? 1 : value;
  const style: Record<string, string> = {};
  for (const channel of channels) {
    style[`--table-border-${channel}`] = `${width}`;
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
   * cells draw the grid lines themselves, so this sets inherited channels
   * rather than a border on the element it is passed to.
   *
   * Use `true` for 1px or a number for a width in pixels.
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
   * Overrides the inline-start side only. Between columns the wider of the two
   * sides is drawn.
   */
  $borderInlineStart(value?: TableBorderValue) {
    return getBorderStyle(["s"], value);
  },
  /**
   * Overrides the inline-end side only. Between columns the wider of the two
   * sides is drawn.
   */
  $borderInlineEnd(value?: TableBorderValue) {
    return getBorderStyle(["e"], value);
  },
  /**
   * Overrides the block axis on the leading side only. Between rows the wider
   * of the two block sides is drawn.
   */
  $borderBlockStart(value?: TableBorderValue) {
    return getBorderStyle(["bs"], value);
  },
  /**
   * Overrides the block axis on the trailing side only. Between rows the wider
   * of the two block sides is drawn.
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
  extend: [padding],
  class: [
    "relative w-full border-separate border-spacing-0",
    // The width of a line between rows and of a divider between columns: the
    // wider of the two sides asked for. The sides only differ for the
    // container's own border.
    "[--table-row-line:max(var(--table-border-bs,0),var(--table-border-be,0))]",
    "[--table-cell-line:max(var(--table-border-s,0),var(--table-border-e,0))]",
    // The cells pad like a control, with the frame padding above and below
    // and the optical side padding on top (see --py and --px in padding.ts).
    // Both are measured in the table's own line box and font and registered
    // as lengths (see ui.css), so a head row in smaller text pads like a
    // body row and its text stays on the column below. The table element
    // itself stays unpadded; only the ! beats the padding declared on it.
    "[--table-py:var(--py)] [--table-px:var(--px)]",
    "p-0!",
  ],
  variants: {
    ...tableBorderVariants,
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
    "border-s-[calc(var(--table-border-s,0)*1px)]",
    "border-e-[calc(var(--table-border-e,0)*1px)]",
    "border-bs-[calc(var(--table-border-bs,0)*1px)]",
    "border-be-[calc(var(--table-border-be,0)*1px)]",
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
    // Edge flags read by the rows, for the line the table's last row leaves
    // out and the corners its first and last rows take.
    "[&:is(thead):first-of-type]:[--table-rowgroup-first:1]",
    "[:not(:has(thead))>&:first-child]:[--table-rowgroup-first:1]",
    "[&:is(tfoot):last-of-type]:[--table-rowgroup-last:1]",
    "[:not(:has(tfoot))>&:last-child]:[--table-rowgroup-last:1]",
  ],
  variants: {
    /**
     * Keeps the row group on screen while the scroller scrolls. It sits above a
     * pinned cell (see $sticky in tableCell) and above a focused row's ring.
     */
    $sticky: {
      top: "z-3 sticky top-0",
      // The line above a group is drawn by the row before it, which scrolls
      // away from a group pinned at the bottom: the group's first row draws it
      // in its own box instead, unless it is the table's first row, and the row
      // before it gives it up.
      bottom: [
        "z-3 sticky bottom-0",
        "[&>tr:first-child]:[--table-row-line-bs:calc(var(--table-row-line)*(1-var(--table-row-first,0)))]",
        "[:has(+&)>tr:last-child]:[--table-row-line-be:0]",
      ],
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
    // The line below the row, which its cells draw in their last row of
    // pixels; the table's last row has none. The line above it belongs to the
    // row before, except under a group pinned at the bottom (see
    // tableRowGroup), which sets --table-row-line-bs on its first row.
    "[--table-row-line-be:calc(var(--table-row-line)*(1-var(--table-row-last,0)))]",
    // A row in a state, hovered or selected, takes the line above it as
    // well: its cells paint it over the row before (see tableCell). The
    // table's first row has no line above it, and a row that draws its own
    // needs none.
    "[--table-row-shadow:calc(var(--table-row-state,0)*(var(--table-row-line)*(1-var(--table-row-first,0))-var(--table-row-line-bs,0)))]",
    // The container's corners, for the rows at the very top and bottom of the
    // table, inside the container's own border so the curves stay concentric.
    // A ring at a corner follows the clip instead of being sliced by it. The
    // cells read these for their own corners.
    "[--table-row-radius-bs:calc((var(--ak-frame-radius,0px)-var(--table-border-bs,0)*1px)*var(--table-row-first,0))]",
    "[--table-row-radius-be:calc((var(--ak-frame-radius,0px)-var(--table-border-be,0)*1px)*var(--table-row-last,0))]",
  ],
  variants: {
    /**
     * Tints the row on hover, through `$hoverOffset`, and gives it the lines
     * around it while it lasts.
     */
    $hover: "ui-hover:[--table-row-state:1]",
    /**
     * Draws a ring around the row while it has keyboard focus, and how thick. A
     * ring set on the row itself paints under a pinned cell, so the ring is a
     * pseudo-element laid over the cells (see refine).
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
     * channel, so a hover still steps on top of it. The row takes the lines
     * around it with the tint.
     */
    $selected: [
      "ui-selected:ak-layer-brand ui-selected:ak-layer-mix-15",
      "ui-selected:[--table-row-state:1]",
    ],
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
      // The row still takes real DOM focus, so the browser's own ring goes.
      "ui-focus-visible:relative ui-focus-visible:outline-none",
      // The box sits inside the lines the row's cells hold, the line below
      // the row and, under a group pinned at the bottom, the one above it.
      // The z puts it over a pinned cell and under a sticky row group.
      "ui-focus-visible:after:absolute ui-focus-visible:after:inset-x-0",
      "ui-focus-visible:after:inset-bs-[calc(var(--table-row-line-bs,0)*1px)]",
      "ui-focus-visible:after:inset-be-[calc(var(--table-row-line-be,0)*1px)]",
      "ui-focus-visible:after:z-2 ui-focus-visible:after:pointer-events-none",
      "ui-focus-visible:after:border-(--ak-outline)",
      "ui-focus-visible:after:rounded-t-(--table-row-radius-bs)",
      "ui-focus-visible:after:rounded-b-(--table-row-radius-be)",
    ]);
  },
});

export const tableCell = cv({
  extend: [layer],
  class: [
    // The header of a sorted column takes the full ink; the sort button in it
    // says which way (see tableSortIndicator).
    "aria-[sort=ascending]:ak-ink-100 aria-[sort=descending]:ak-ink-100",
    // The padding the table computed for its cells (see table).
    "px-(--table-px) py-(--table-py)",
    // A cell draws the lines after it: the line below its row (see tableRow)
    // and the divider after its column, which the last column has none of,
    // and neither has the column before a cell pinned at the end, which holds
    // that divider itself (see $sticky). They are borders, so the padding box
    // is the box inside the lines, which the ring fills (see $focus). The
    // cell paints no surface of its own by default: the row's shows through.
    // The lines, the row's edge, lie over it, so a hovered or selected row keeps
    // its lines in contrast with its tint. A pinned cell is the exception
    // (see $sticky).
    "[--table-cell-line-e:var(--table-cell-line)] last:[--table-cell-line-e:0]",
    "[&:has(+.table-pinned)]:[--table-cell-line-e:0]",
    "border-bs-[calc(var(--table-row-line-bs,0)*1px)]",
    "border-be-[calc(var(--table-row-line-be,0)*1px)]",
    "border-s-[calc(var(--table-cell-line-s,0)*1px)]",
    "border-e-[calc(var(--table-cell-line-e,0)*1px)]",
    // One image paints every line: a vertical gradient cut by the same widths
    // into the four border areas. Its bands, top to bottom, are the line
    // above the row, a break, the dividers, a break and the line below, so
    // the dividers stop short of the row lines by $borderInset. The slice
    // takes plain numbers, which is why the channels are numbers, and it is
    // physical, so it is restated for right-to-left.
    "[border-image-source:linear-gradient(var(--ak-edge)_calc(var(--table-row-line-bs,0)*1px),transparent_0_calc(var(--table-row-line-bs,0)*1px+var(--table-border-inset,0px)),var(--ak-edge)_0_calc(100%-var(--table-row-line-be,0)*1px-var(--table-border-inset,0px)),transparent_0_calc(100%-var(--table-row-line-be,0)*1px),var(--ak-edge)_0)]",
    "[border-image-slice:var(--table-row-line-bs,0)_var(--table-cell-line-e,0)_var(--table-row-line-be,0)_var(--table-cell-line-s,0)]",
    "rtl:[border-image-slice:var(--table-row-line-bs,0)_var(--table-cell-line-s,0)_var(--table-row-line-be,0)_var(--table-cell-line-e,0)]",
    // The line above a row in a state, painted over the row before it, whose
    // border it is: a later cell paints over an earlier one. The first shadow
    // lies on top, so it is the row's edge over a stripe of the row's own
    // surface, the same paint as the lines below. For a row in no state the
    // offset is zero and the shadow stays under the cell.
    "shadow-[0_calc(var(--table-row-shadow,0)*-1px)_0_var(--ak-edge),0_calc(var(--table-row-shadow,0)*-1px)_0_var(--ak-layer)]",
    // At the container's corners the ring follows the rounding (see
    // tableRow).
    "first:rounded-ss-(--table-row-radius-bs) first:rounded-es-(--table-row-radius-be)",
    "last:rounded-se-(--table-row-radius-bs) last:rounded-ee-(--table-row-radius-be)",
    // A focusable cell takes real DOM focus, so the browser's own ring goes.
    "ui-focus-visible:outline-none",
  ],
  variants: {
    /**
     * Whether the cell is a header, and which kind.
     */
    $header: {
      false: "",
      column: "ak-ink-70 font-semibold",
      row: "font-semibold",
    },
    /**
     * Aligns and formats the cell for numbers.
     */
    $numeric: "text-end tabular-nums",
    /**
     * Pins the cell to the start or the end edge of the scroller while the
     * table scrolls sideways, for the column that names the rows. Set it on
     * every cell of the column, the head's included. The cell holds the divider
     * on its scrolling side in its own box, where a neighbour's would slide
     * under it: after it for a start pin, which every cell draws already, and
     * before it for an end pin, which the cell before it then leaves out. The
     * cell paints its row's surface as a layer of its own, so the columns
     * sliding under it stay hidden, and the z puts it above the other cells and
     * below a sticky row group. Chromium paints a cell only up to the whole
     * device pixel its box ends on, so a column that ends on a fraction would
     * let the content sliding under the cell show through the remainder: the
     * pseudo-element paints the row's surface over that hair, one pixel past
     * the scrolling edge, where the neighbour's surface is the same colour.
     */
    $sticky: {
      start: [
        "z-1 sticky inset-s-0",
        "after:absolute after:inset-y-0 after:w-px",
        "after:inset-e-[calc(-1px-var(--table-cell-line-e,0)*1px)]",
        "after:bg-(--ak-layer) after:pointer-events-none",
      ],
      end: [
        "table-pinned z-1 sticky inset-e-0",
        "[--table-cell-line-s:var(--table-cell-line)]",
        "after:absolute after:inset-y-0 after:w-px",
        "after:inset-s-[calc(-1px-var(--table-cell-line-s,0)*1px)]",
        "after:bg-(--ak-layer) after:pointer-events-none",
      ],
    },
    /**
     * Draws a ring inside the cell while it has keyboard focus, and how thick.
     * The ring fills the padding box, the box inside the lines.
     */
    $focus: {
      1: "ui-focus-visible:inset-ring",
      true: "ui-focus-visible:inset-ring-2",
      2: "ui-focus-visible:inset-ring-2",
      3: "ui-focus-visible:inset-ring-3",
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
      if (variants.$sticky) {
        return defaultValue ?? true;
      }
      // A transparent layer lets the row show through until a cell modifier
      // asks it to paint, while retaining the modifier's color context.
      if (defaultValue === true) return "transparent";
      return defaultValue;
    },
  },
  refine({ variants, addClass }) {
    if (variants.$header && !variants.$numeric) {
      addClass("text-start");
    }
    if (!variants.$focus) return;
    addClass("ak-outline ak-outline-brand inset-ring-(--ak-outline)");
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
    // The cover reads the table's padding channels, registered lengths the
    // button's own frame leaves alone, where a frame cover would read the
    // frame padding the button has moved on. The negative margins take the
    // cell padding back, and the width is written out because a block-level
    // button still shrink-wraps.
    "-my-(--table-py) -mx-(--table-px)",
    "w-[calc(100%+var(--table-px)*2)]",
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
    // A header cell at a corner of the table takes the container's rounding
    // (see tableCell). The button covers the cell to its edges, so its ring
    // takes the same corners instead of being cut by the container's clip.
    // The frame's radius is one value for all four corners, so the corners
    // are inherited instead, by a utility that sorts after the frame's own.
    "rounded-[inherit]",
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
    $p: "var(--table-py)",
    $px: "var(--table-px)",
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
