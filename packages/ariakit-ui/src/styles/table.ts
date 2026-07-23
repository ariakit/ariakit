import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";

const BORDER_SIDES = ["s", "e", "t", "b"] as const;

type BorderSide = (typeof BORDER_SIDES)[number];

type TableBorderValue =
  | boolean
  | "x"
  | "y"
  | BorderSide
  | (string & {})
  | number;

// Writes the width channels the cell pseudos and the container borders
// read. The custom properties inherit, so setting them on either element
// reaches the cells.
function getTableBorderStyle(value?: TableBorderValue) {
  if (value == null) return;
  if (value === false) return;
  const sides: readonly BorderSide[] =
    value === "x"
      ? ["s", "e"]
      : value === "y"
        ? ["t", "b"]
        : includes(BORDER_SIDES, value)
          ? [value]
          : BORDER_SIDES;
  const width =
    typeof value === "number"
      ? `${value}px`
      : typeof value === "string" && sides === BORDER_SIDES
        ? value
        : "1px";
  const style: Record<string, string> = {};
  for (const side of sides) {
    style[`--table-border-${side}`] = width;
  }
  return { style };
}

// Border variants shared by the table (cell borders) and the container
// (outer borders).
const tableBorder = cv({
  variants: {
    /**
     * Draws borders between cells (and around the container when set on
     * it). Use `true` for 1px on every side, `x`/`y` for one axis, a side
     * initial for a single side, a number for a width in pixels on every
     * side, or any length.
     */
    $border(value?: TableBorderValue) {
      return getTableBorderStyle(value);
    },
    /**
     * Insets the vertical borders between columns from the row edges.
     * Numbers scale the spacing token.
     */
    $borderGap(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--table-border-gap": getSpacingValue(value) },
      };
    },
  },
});

export const table = cv({
  extend: [tableBorder],
  class: [
    // Legacy ak-frame-field/field: the field frame sets the padding the
    // cells read while the table itself stays unpadded.
    "ak-frame ak-frame-(--radius-field) ak-frame-p-(--spacing-field) p-0!",
    "relative w-full border-separate border-spacing-0 overflow-x-hidden",
  ],
  variants: {
    /**
     * Sets the cells' inline padding. Numbers scale the spacing token.
     */
    $px(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--table-px": getSpacingValue(value) },
      };
    },
    /**
     * Sets the cells' block padding. Numbers scale the spacing token.
     */
    $py(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--table-py": getSpacingValue(value) },
      };
    },
    /**
     * Sets the cells' padding on both axes. Numbers scale the spacing
     * token.
     */
    $p(value?: (string & {}) | number) {
      if (value == null) return;
      const padding = getSpacingValue(value);
      return {
        style: { "--table-px": padding, "--table-py": padding },
      };
    },
  },
});

export const tableContainer = cv({
  extend: [frame, tableBorder],
  class: [
    "overflow-clip",
    // The outer borders follow the same channels as the cell borders.
    "[border-inline-start-width:var(--table-border-s,0px)]",
    "[border-inline-end-width:var(--table-border-e,0px)]",
    "[border-block-start-width:var(--table-border-t,0px)]",
    "[border-block-end-width:var(--table-border-b,0px)]",
  ],
  variants: {
    /**
     * Draws the container's outer borders through the table border
     * channels. Declared here so it replaces the frame's own $border,
     * which would otherwise also run and draw its adaptive ring.
     */
    $border(value?: TableBorderValue) {
      return getTableBorderStyle(value);
    },
  },
  defaultVariants: {
    // The channel borders replace the frame border machinery, whose
    // computed default would otherwise react to the truthy $border.
    $borderType: "unset",
    // Legacy ak-frame-card/0.
    $rounded: "xl",
    $p: "none",
  },
});

export const tableScroller = cv({
  class: [
    "max-h-[inherit] overflow-auto",
    // Scrollbars follow the surface even when the theme differs from the
    // system scheme.
    "ak-dark:scheme-dark ak-light:scheme-light",
  ],
});

export const tableRowGroup = cv({
  class: [
    "relative ak-layer",
    // Edge flags read by the rows so the cell pseudos skip the block
    // borders at the very top and bottom of the table.
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
  class: "ak-layer-3 whitespace-nowrap text-sm",
});

export const tableFoot = cv({
  extend: [tableRowGroup],
});

export const tableRow = cv({
  class: [
    "ak-layer",
    // Rows at the group edges forward the flags to their cells.
    "first-of-type:[--table-row-first:var(--table-rowgroup-first,0)]",
    "last-of-type:[--table-row-last:var(--table-rowgroup-last,0)]",
  ],
  variants: {
    /**
     * Tints the row on hover. The z bumps keep the hovered row's cell
     * pseudos above the neighbors' borders.
     */
    $hover: "hover:ak-state-3 hover:z-2 hover:*:z-2",
  },
});

export const tableCell = cv({
  class: [
    "ak-layer relative z-1",
    "px-(--table-px,var(--ak-frame-padding,0px))",
    "py-(--table-py,var(--ak-frame-padding,0px))",
    // The ::after pseudo draws the block borders, skipped at the table's
    // first and last rows through the inherited edge flags.
    "after:content-[''] after:absolute after:-z-1 after:pointer-events-none",
    "after:ak-layer after:inset-x-0 after:top-0",
    "after:[border-block-start-width:calc(var(--table-border-t,0px)*(1-var(--table-row-first,0)))]",
    "after:[border-block-end-width:calc(var(--table-border-b,0px)*(1-var(--table-row-last,0)))]",
    "after:[inset-block-end:calc(var(--table-border-b,0px)*(1-var(--table-row-last,0))*-1)]",
    // The ::before pseudo draws the inline borders between columns.
    "before:content-[''] before:absolute before:-z-1 before:pointer-events-none",
    "before:ak-layer before:inset-x-0",
    "before:[inset-block:var(--table-border-gap,0px)]",
    "[&:not(:first-child)]:before:[border-inline-start-width:var(--table-border-s,0px)]",
    "[&:not(:first-child)]:before:[inset-inline-start:calc(var(--table-border-s,0px)*-1)]",
    "[&:not(:last-child)]:before:[border-inline-end-width:var(--table-border-e,0px)]",
    "[&:not(:last-child)]:before:[inset-inline-end:calc(var(--table-border-e,0px)*-1)]",
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
