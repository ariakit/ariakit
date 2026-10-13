import { cv, cx } from "clava";
import type { VariantProps } from "clava";
import { keys } from "../utils/keys.ts";
import { getScaledStyleValue, getSpacingValue } from "../utils/styles.ts";
import { button, buttonSlot } from "./button.ts";
import { edge, getEdgeColorValue, getEdgeWeightValue } from "./edge.ts";
import { frame } from "./frame.ts";
import { hover } from "./hover.ts";
import { layer } from "./layer.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

const tableEdgeInputs = cx(
  // Inherited inputs are defaults; explicit edge utilities on a part win.
  "[:where(&)]:ak-edge-color-(--table-edge-color)",
  "[:where(&)]:ak-edge-alpha-(--table-edge-alpha,0.1)",
  "[:where(&)]:ak-edge-push-(--table-edge-push,1)",
);

// Resolve edge colors on each cell so hover and selection surfaces keep
// matching grid lines.
function getTableEdgeStyle(variants: VariantProps<typeof edge>) {
  const color = getEdgeColorValue(variants.$edge);
  const weight = getEdgeWeightValue(variants.$edgeWeight);
  const push = variants.$edgePush;
  const style: Record<string, string> = {};
  if (color != null) {
    style["--table-edge-color"] = color;
  }
  if (weight != null) {
    style["--table-edge-alpha"] = getScaledStyleValue(weight);
  } else if (variants.$edgeRaw) {
    style["--table-edge-alpha"] = "1";
  }
  if (push != null && push !== "") {
    style["--table-edge-push"] = getScaledStyleValue(push);
  } else if (variants.$edgeRaw) {
    style["--table-edge-push"] = "0";
  }
  return style;
}

function hasEdgeModifier(variants: VariantProps<typeof edge>) {
  return keys(variants).some((key) => {
    if (!key.startsWith("$edge")) return false;
    const value = variants[key];
    if (value == null) return false;
    if (value === false) return false;
    if (value === "") return false;
    if (value === "unset") return false;
    return true;
  });
}

// Border widths are unitless pixel counts because border-image slices require
// numbers. Inherited channels supply both cells and the outer border.
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

// Declare these variants locally to replace frame's border resolver. Put
// narrower sides last so they override broader widths regardless of caller prop
// order.
const tableBorderVariants = {
  /**
   * Sets cell grid borders, or outer borders on the container. `true` means
   * 1px; numbers are pixel widths. Values inherit into cells.
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
  /** Overrides `$border` on the block axis, the borders between rows. */
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
   * Insets column dividers from row edges. Numbers scale the spacing token.
   * Adjacent rows each add the inset, so internal gaps are twice the value.
   */
  $borderInset(value?: string | number) {
    if (value == null) return;
    return {
      style: { "--table-border-inset": getSpacingValue(value) },
    };
  },
};

/**
 * A table with shared cell spacing, border widths, and adaptive edge colors.
 */
export const table = cv({
  extend: [textFrame],
  class: [
    tableEdgeInputs,
    "relative w-full border-separate border-spacing-0",
    "[--table-row-line:max(var(--table-border-bs,0),var(--table-border-be,0))]",
    "[--table-cell-line:max(var(--table-border-s,0),var(--table-border-e,0))]",
    // Registered padding lengths keep smaller headers aligned with body cells.
    // Only cells receive padding; `!` clears the table frame padding.
    "[--table-py:var(--py)] [--table-px:var(--px)]",
    "[--table-size:1em]",
    "p-0!",
  ],
  variants: {
    ...tableBorderVariants,
  },
  defaultVariants: {
    // Disable frame borders; cells draw grid lines from the border channels.
    $borderType: "unset",
    $p: 3,
  },
  refine({ variants }) {
    return { style: getTableEdgeStyle(variants) };
  },
});

/** A rounded table container that clips corners and draws the outer border. */
export const tableContainer = cv({
  extend: [frame],
  class: [
    // Overflow does not clip table boxes; the wrapper clips corner cells.
    "overflow-clip",
    // Allow shrinking in flex and grid layouts so the scroller takes overflow.
    "min-w-0",
    // Reset inherited edge colors for nested tables.
    "[--table-edge-color:initial] [--table-edge-alpha:initial] [--table-edge-push:initial]",
    "border-s-[calc(var(--table-border-s,0)*1px)]",
    "border-e-[calc(var(--table-border-e,0)*1px)]",
    "border-bs-[calc(var(--table-border-bs,0)*1px)]",
    "border-be-[calc(var(--table-border-be,0)*1px)]",
  ],
  variants: {
    ...tableBorderVariants,
  },
  defaultVariants: {
    // Disable frame borders because the width channels draw the outer borders.
    $borderType: "unset",
    $rounded: "xl",
    $p: "none",
  },
  refine({ variants }) {
    return { style: getTableEdgeStyle(variants) };
  },
});

/** A table caption aligned with the cell content. */
export const tableCaption = cv({
  extend: [text],
  class: "px-(--table-px) py-(--table-py) text-start",
});

/** A scrollable table viewport with scrollbars that follow its color scheme. */
export const tableScroller = cv({
  class: [
    "max-h-[inherit] overflow-auto",
    // Scrollbars follow the surface even when the theme differs from the system
    // scheme.
    "ak-dark:scheme-dark ak-light:scheme-light",
  ],
});

/** A row group with optional sticky positioning and table edge flags. */
export const tableRowGroup = cv({
  extend: [layer],
  class: [
    tableEdgeInputs,
    "[--table-grid-edge:var(--ak-edge)]",
    "relative",
    // Reset group position flags so nested tables do not inherit outer
    // corners.
    "[--table-rowgroup-first:0] [--table-rowgroup-last:0]",
    "[&:is(thead):first-of-type]:[--table-rowgroup-first:1]",
    "[:not(:has(>thead))>&:nth-child(1_of_tbody,tfoot)]:[--table-rowgroup-first:1]",
    "[&:is(tfoot):last-of-type]:[--table-rowgroup-last:1]",
    "[:not(:has(>tfoot))>&:last-child]:[--table-rowgroup-last:1]",
  ],
  variants: {
    /**
     * Pins the group above pinned cells and row focus rings while scrolling.
     */
    $sticky: {
      top: "z-3 sticky top-0",
      // A bottom-pinned group draws its own leading line because the previous
      // row scrolls away.
      bottom: [
        "z-3 sticky bottom-0",
        "[&>tr:first-child]:[--table-row-line-bs:calc(var(--table-row-line)*(1-var(--table-row-first,0)))]",
        "[:has(+&)>tr:last-child]:[--table-row-line-be:0]",
      ],
    },
  },
});

/** A table header group with smaller text and a distinct surface. */
export const tableHead = cv({
  extend: [tableRowGroup],
  class: "whitespace-nowrap text-sm",
  defaultVariants: {
    $lightnessOffset: 0.5,
  },
});

/** A table footer group with optional sticky positioning. */
export const tableFoot = cv({
  extend: [tableRowGroup],
});

/** Shared inset borders for table rows and cells. */
const tableItem = cv({
  extend: [edge],
  variants: {
    /**
     * Draws a border inside the grid lines without changing the layout. Edge
     * modifiers enable it automatically. Set to `false` to turn it off, `true`
     * for 1px, or a number for a width in pixels. Keyboard focus replaces it.
     */
    $border(value?: TableBorderValue) {
      if (!value) return;
      return {
        style: { "--table-item-border": `${value === true ? 1 : value}px` },
      };
    },
  },
  defaultVariants: {
    $border(defaultValue, variants) {
      if (defaultValue != null) {
        return defaultValue;
      }
      return hasEdgeModifier(variants);
    },
  },
});

/** A table row with hover, selection, and keyboard focus styles. */
export const tableRow = cv({
  extend: [tableItem, hover],
  class: [
    tableEdgeInputs,
    // Reset row position flags before forwarding group edges to cells.
    "[--table-row-first:0] [--table-row-last:0]",
    "first-of-type:[--table-row-first:var(--table-rowgroup-first,0)]",
    "last-of-type:[--table-row-last:var(--table-rowgroup-last,0)]",
    // Omit the last row line. A bottom-pinned group supplies its own leading
    // line.
    "[--table-row-line-be:calc(var(--table-row-line)*(1-var(--table-row-last,0)))]",
    // Hover and selection repaint the previous row's line, except at the table
    // start or when the row already owns that line.
    "[--table-row-shadow:calc(var(--table-row-state,0)*(var(--table-row-line)*(1-var(--table-row-first,0))-var(--table-row-line-bs,0)))]",
    // Match the container's inner corners so row and cell rings follow its
    // clipping.
    "[--table-row-radius-bs:calc((var(--ak-frame-radius,0px)-var(--table-border-bs,0)*1px)*var(--table-row-first,0))]",
    "[--table-row-radius-be:calc((var(--ak-frame-radius,0px)-var(--table-border-be,0)*1px)*var(--table-row-last,0))]",
  ],
  variants: {
    /**
     * Uses `$hoverOffset` to tint the row and its surrounding grid lines on
     * hover.
     */
    $hover: "ui-hover:[--table-row-state:1]",
    /**
     * Sets keyboard focus ring thickness. The ring is a pseudo-element above
     * the cells so pinned cells cannot cover it.
     */
    $focus: {
      1: "ui-focus-visible:after:border",
      true: "ui-focus-visible:after:border-2",
      2: "ui-focus-visible:after:border-2",
      3: "ui-focus-visible:after:border-3",
    },
    /**
     * Tints the row and surrounding grid lines when `aria-selected="true"`.
     * Hover can still adjust the selected surface.
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
    const style = variants.$border ? undefined : getTableEdgeStyle(variants);
    // Keep a custom item border color out of the grid lines and hover shadow.
    if (!variants.$border) {
      addClass("[--table-grid-edge:var(--ak-edge)]");
    }
    if (!variants.$focus && !variants.$border) {
      return { style };
    }
    addClass([
      "ui-focus-visible:outline-none",
      // Place the ring inside grid lines, above pinned cells and below sticky
      // groups.
      "after:absolute after:inset-x-0",
      "after:inset-bs-[calc(var(--table-row-line-bs,0)*1px)]",
      "after:inset-be-[calc(var(--table-row-line-be,0)*1px)]",
      "after:z-2 after:pointer-events-none",
      "after:rounded-t-(--table-row-radius-bs)",
      "after:rounded-b-(--table-row-radius-be)",
    ]);
    if (variants.$border) {
      addClass(
        "relative after:border-(length:--table-item-border) after:border-(--ak-edge)",
      );
    } else {
      addClass(
        "ui-focus-visible:relative after:content-none ui-focus-visible:after:content-['']",
      );
    }
    if (variants.$focus) {
      addClass(
        "ak-outline ak-outline-brand ui-focus-visible:after:border-(--ak-outline)",
      );
    }
    return { style };
  },
});

/**
 * A table cell with grid borders, keyboard focus, and optional column pinning.
 */
export const tableCell = cv({
  extend: [tableItem],
  class: [
    tableEdgeInputs,
    "aria-[sort=ascending]:ak-ink-100 aria-[sort=descending]:ak-ink-100",
    "px-(--table-px) py-(--table-py)",
    // Cells own their trailing row and column lines. End-pinned cells own
    // their leading divider instead. Borders keep focus rings inside the grid;
    // row surfaces show through unpainted cells.
    "[--table-cell-line-e:var(--table-cell-line)] last:[--table-cell-line-e:0]",
    "[&:has(+.table-pinned)]:[--table-cell-line-e:0]",
    "border-bs-[calc(var(--table-row-line-bs,0)*1px)]",
    "border-be-[calc(var(--table-row-line-be,0)*1px)]",
    "border-s-[calc(var(--table-cell-line-s,0)*1px)]",
    "border-e-[calc(var(--table-cell-line-e,0)*1px)]",
    // Slice one gradient into row lines and inset column dividers.
    // Border-image slices use unitless widths and physical sides, so RTL needs
    // reversed slices.
    "[border-image-source:linear-gradient(var(--table-cell-edge)_calc(var(--table-row-line-bs,0)*1px),transparent_0_calc(var(--table-row-line-bs,0)*1px+var(--table-border-inset,0px)),var(--table-cell-edge)_0_calc(100%-var(--table-row-line-be,0)*1px-var(--table-border-inset,0px)),transparent_0_calc(100%-var(--table-row-line-be,0)*1px),var(--table-cell-edge)_0)]",
    "[border-image-slice:var(--table-row-line-bs,0)_var(--table-cell-line-e,0)_var(--table-row-line-be,0)_var(--table-cell-line-s,0)]",
    "rtl:[border-image-slice:var(--table-row-line-bs,0)_var(--table-cell-line-s,0)_var(--table-row-line-be,0)_var(--table-cell-line-e,0)]",
    // Later cells repaint the previous row's line with their own surface and
    // edge. The first shadow paints on top; zero offset keeps idle shadows
    // under cells.
    "shadow-[0_calc(var(--table-row-shadow,0)*-1px)_0_var(--table-cell-edge),0_calc(var(--table-row-shadow,0)*-1px)_0_var(--ak-layer)]",
    "first:rounded-ss-(--table-row-radius-bs) first:rounded-es-(--table-row-radius-be)",
    "last:rounded-se-(--table-row-radius-bs) last:rounded-ee-(--table-row-radius-be)",
  ],
  variants: {
    /** Whether the cell is a header, and which kind. */
    $header: {
      false: "",
      column: [
        "ak-ink-70 font-semibold",
        // A bare choice or icon keeps the body size beside the smaller label.
        // Slots inside a control keep that control's own explicit size.
        "[&>.control-slot]:text-(length:--table-size)",
      ],
      row: "font-semibold",
    },
    /** Aligns and formats the cell for numbers. */
    $numeric: "text-end tabular-nums",
    /**
     * Pins a column to the scrolling edge. Set on every cell, including its
     * header. The cell paints its row surface and owns the divider facing
     * scrolling content. A one-pixel extension covers Chromium gaps at
     * fractional device-pixel edges.
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
     * Sizes the column to its content. Give another column `$grow` to absorb
     * extra width. Declarative rows inherit this from the header cell.
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
      // Keep the row surface visible until a cell modifier paints its own
      // layer.
      if (defaultValue === true) return "transparent";
      return defaultValue;
    },
  },
  refine({ variants, addClass }) {
    if (variants.$header && !variants.$numeric) {
      addClass("text-start");
    }
    addClass("ui-focus-visible:outline-none");
    if (variants.$border || variants.$layer === false) {
      addClass("[--table-cell-edge:var(--table-grid-edge,var(--ak-edge))]");
    } else {
      addClass("[--table-cell-edge:var(--ak-edge)]");
    }
    if (variants.$border) {
      addClass(
        "inset-ring-(length:--table-item-border) inset-ring-(--ak-edge)",
      );
    }
    if (variants.$focus) {
      addClass(
        "ak-outline ak-outline-brand ui-focus-visible:inset-ring-(--ak-outline)",
      );
    }
  },
});

/**
 * A sorting button that fills its header cell and aligns with the column text.
 * The header cell supplies `aria-sort`.
 */
export const tableSortButton = cv({
  extend: [button],
  class: [
    // Use registered table padding, which the button frame does not replace.
    // Negative margins cover the cell; an explicit width prevents button
    // shrink-wrapping.
    "-my-(--table-py) -mx-(--table-px)",
    "w-[calc(100%+var(--table-px)*2)]",
    "justify-start text-start",
    // Preserve the header weight and ink, including the stronger sorted state.
    "[font-weight:inherit] text-inherit",
    "[--table-sort-ink:0.4]",
    "ui-hover:ak-ink-100 ui-hover:[--table-sort-ink:1]",
    "ui-focus-visible:ak-ink-100 ui-focus-visible:[--table-sort-ink:1]",
    // Inherit individual cell corners so the focus ring follows container
    // clipping. This utility sorts after frame rounding.
    "rounded-[inherit]",
  ],
  variants: {
    /**
     * Sets focus ring spacing. `inset` keeps the ring within the cell;
     * inherited offsets remain available.
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
    // Use cell padding without another optical inset, keeping the label aligned
    // with its column.
    $p: "var(--table-py)",
    $px: "var(--table-px)",
    $rounded: "none",
    $focusOffset: "inset",
  },
});

/**
 * A sort indicator with faint chevrons when unsorted and a direction arrow set
 * by the header cell's `aria-sort`.
 */
export const tableSortIndicator = cv({
  extend: [buttonSlot],
  class: [
    "[--slot-icon-size:1.1em]",
    "transition-[rotate] duration-150 motion-reduce:transition-none",
    "in-aria-[sort=descending]:rotate-180",
    "in-aria-[sort=none]:ak-ink-(--table-sort-ink)",
  ],
  defaultVariants: {
    $size: "lg",
  },
});
