import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";
import { hover } from "./hover.ts";
import { layer } from "./layer.ts";

// A keyword names the sides to draw. The channel suffixes match the Tailwind
// border utilities that spend them, so --table-border-bs pairs with
// border-bs-*.
const BORDER_CHANNELS = {
  "inline-start": ["s"],
  "inline-end": ["e"],
  "block-start": ["bs"],
  "block-end": ["be"],
  inline: ["s", "e"],
  block: ["bs", "be"],
} as const;

type TableBorderKeyword = keyof typeof BORDER_CHANNELS;

type TableBorderValue = boolean | TableBorderKeyword | (string & {}) | number;

function isBorderKeyword(value: TableBorderValue): value is TableBorderKeyword {
  if (typeof value !== "string") return false;
  return Object.hasOwn(BORDER_CHANNELS, value);
}

// A keyword only picks sides, so it keeps the default width. Anything else is
// the width itself, on every side.
function getBorderWidth(value: TableBorderValue) {
  if (typeof value === "number") return `${value}px`;
  if (typeof value === "string" && !isBorderKeyword(value)) return value;
  return "1px";
}

// Writes the width channels the cell pseudos and the container borders
// read. The custom properties inherit, so setting them on either element
// reaches the cells.
function getTableBorderStyle(value?: TableBorderValue) {
  if (value == null) return;
  if (value === false) return;
  const width = getBorderWidth(value);
  const channels = isBorderKeyword(value)
    ? BORDER_CHANNELS[value]
    : [...BORDER_CHANNELS.inline, ...BORDER_CHANNELS.block];
  const style: Record<string, string> = {};
  for (const channel of channels) {
    style[`--table-border-${channel}`] = width;
  }
  return { style };
}

// Border variants shared by the table (cell borders) and the container (outer
// borders). Spread into each cv rather than extended: an extended $border does
// not replace frame's own, so both would run and frame's would write a nonsense
// --border-width from a side keyword.
const tableBorderVariants = {
  /**
   * Publishes the border widths that the cells and the container read. The
   * cells draw the grid lines through their own pseudo-elements, so this sets
   * inherited channels rather than a border on the element it is passed to.
   *
   * Use `true` for 1px on every side, `"inline"` or `"block"` for one axis, a
   * single side such as `"block-end"`, a number for a width in pixels, or any
   * length.
   */
  $border(value?: TableBorderValue) {
    return getTableBorderStyle(value);
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
    "relative w-full border-separate border-spacing-0 overflow-x-hidden",
    // The cells spend --ak-frame-padding as their own padding, so $p sets it
    // here and the table element itself stays unpadded. Only the ! beats a
    // padding declared on the same element.
    "p-0!",
  ],
  variants: {
    ...tableBorderVariants,
    /**
     * Overrides the cells' inline padding. A number scales the spacing token
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
    // The row groups, rows and cells paint. The table is the region behind
    // them.
    $layer: false,
    // The cells draw the grid lines from the $border channels, so frame's
    // computed border type must not react to the truthy $border.
    $borderType: "unset",
    $rounded: "lg",
    $p: 3,
  },
});

export const tableContainer = cv({
  extend: [frame],
  class: [
    "overflow-clip",
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
     * Keeps the row group visible while the scroller scrolls.
     */
    $sticky: {
      top: "z-3 sticky top-0",
      bottom: "z-3 sticky bottom-0",
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
  ],
  variants: {
    /**
     * Tints the row on hover, through `$hoverOffset`. The z bumps keep the
     * hovered row's cell pseudos above the neighbors' borders.
     */
    $hover: "ui-hover:z-2 ui-hover:*:z-2",
  },
  defaultVariants: {
    $hoverOffset(defaultValue, variants) {
      if (!variants.$hover) return defaultValue;
      return defaultValue ?? 0.5;
    },
  },
});

export const tableCell = cv({
  extend: [layer],
  class: [
    "relative z-1",
    "px-(--table-px,var(--ak-frame-padding,0px))",
    "py-(--table-py,var(--ak-frame-padding,0px))",
    // The ::after pseudo draws the block borders, skipped at the table's first
    // and last rows through the inherited edge flags.
    "after:absolute after:-z-1 after:pointer-events-none",
    "after:ak-layer after:inset-x-0 after:inset-bs-0",
    "after:border-bs-[calc(var(--table-border-bs,0px)*(1-var(--table-row-first,0)))]",
    "after:border-be-[calc(var(--table-border-be,0px)*(1-var(--table-row-last,0)))]",
    "after:inset-be-[calc(var(--table-border-be,0px)*(1-var(--table-row-last,0))*-1)]",
    // The ::before pseudo draws the inline borders between columns.
    "before:absolute before:-z-1 before:pointer-events-none",
    "before:ak-layer before:inset-x-0",
    "before:inset-y-(--table-border-inset,0px)",
    "not-first:before:border-s-(length:--table-border-s,0px)",
    "not-first:before:-inset-s-(--table-border-s,0px)",
    "not-last:before:border-e-(length:--table-border-e,0px)",
    "not-last:before:-inset-e-(--table-border-e,0px)",
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
  },
  defaultVariants: {
    $header: false,
  },
});
