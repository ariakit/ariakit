import { cv, cx } from "clava";
import { getEmPaddingValue, getEmSpacingValue } from "../utils/styles.ts";
import { checkMark } from "./check-mark.ts";
import {
  disclosure,
  disclosureButton,
  disclosureContentBody,
} from "./disclosure.ts";
import { edge, hasEdgeColor } from "./edge.ts";
import { frame } from "./frame.ts";
import { hasLayerBackground, isLayerColor } from "./layer.ts";
import { hasSlotSurface } from "./slot-frame.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";
import { tint } from "./tint.ts";

// Lightness offsets for counter and icon chips and for empty check slots. Plain
// bullets and dashes have no surface offset.
const CHIP_LIGHTNESS = 1.5;
const SLOT_LIGHTNESS = 1;

/**
 * The flags that a list sets for the markers of its rows, for a style recipe
 * that picks the marker of the rows in a part of a list, such as a nested list
 * in a table of contents.
 */
export const listMarkerClasses = {
  counter: cx("[--list-marker:counter] [--list-counter:1] [--list-glyph:0]"),
  // The glyph width is the width that the marker draws a bullet with. The rows
  // read it to find where their text starts.
  bullet: cx(
    "[--list-marker:bullet] [--list-counter:0] [--list-glyph:1]",
    "[--list-glyph-width:var(--list-bullet-size)]",
  ),
  // Clear the inherited flags, so a marker in a row, such as a status icon,
  // sits like a marker outside a list.
  none: cx(
    "[--list-marker:initial] [--list-counter:initial] [--list-glyph:initial]",
  ),
};

/** A list with adaptive item spacing, markers, and optional guides. */
export const list = cv({
  class: "ui-list",
  variants: {
    /**
     * Uses numbered markers by default. The component chooses the list element.
     */
    $ordered: {
      true: "",
      false: "",
    },
    /**
     * Lays out the rows in a column (`vertical`) or in a row of equal columns
     * (`horizontal`). A horizontal list puts each marker above its content, and
     * the guide runs between the markers. It does not support disclosure rows.
     * Another string is a CSS value that resolves to one of the two names. Pass
     * a `var()` to change the layout with CSS, such as in a container query.
     */
    $layout(value?: "vertical" | "horizontal" | (string & {})) {
      if (value == null) return;
      // Always set the flag, so a nested list does not inherit it.
      if (value === "vertical") return "grid [--list-layout:vertical]";
      // The rows place themselves in one grid row, in columns of equal width.
      if (value === "horizontal") {
        return "grid [--list-layout:horizontal] auto-cols-fr";
      }
      return {
        class: "grid auto-cols-fr",
        style: { "--list-layout": value },
      };
    },
    /**
     * Sets the row marker: `counter`, `icon`, `bullet`, `dash`, `auto`, or
     * `none`. Defaults to counters for ordered lists, bullets when `$guide` is
     * `true`, and `auto` otherwise. `auto` draws dashes, and a list nested in
     * it draws bullets, in turns. An `icon` marker is a chip that holds the
     * icon of its row. With `none`, the rows have no marker and keep no room
     * for one, and the guide is off by default.
     */
    $marker: {
      counter: listMarkerClasses.counter,
      icon: "ui-list--marker-icon",
      bullet: listMarkerClasses.bullet,
      dash: "ui-list--marker-dash",
      auto: "ui-list--marker-auto",
      none: listMarkerClasses.none,
    },
    /**
     * Joins adjacent markers with a guide. `auto` enables guides for counters
     * and icons in block mode.
     */
    $guide: {
      auto: "ui-list--guide-auto",
      true: "[--list-guide:1]",
      false: "[--list-guide:0]",
    },
    /**
     * Draws a nested list as a branch of the row that holds it, like a branch
     * in a commit graph. A curve joins the marker of that row to the first
     * marker of this list, and another joins the last marker of this list to
     * the marker of the next row in the parent list, if there is one. It turns
     * on the guide. Each curve is as tall as a row of one line. In a row with
     * more lines, a stem and a tail join the curves to the markers, in browsers
     * with CSS anchor positioning. In other browsers, such a row needs the
     * guide of its list to run past it, or the curve does not reach its marker.
     * Nothing can come after the list in its row. Only `ListItem` rows draw the
     * curves, so the first and the last rows of the list can't be a
     * `ListDisclosure`.
     */
    $branch: {
      true: "[--list-branch:1]",
      false: "[--list-branch:0]",
    },
    /**
     * Sets how far a nested list moves in from the row that holds it: the
     * distance from the marker of that row to the markers of the list. By
     * default, a nested list starts at the text of its row. The value applies
     * to this list when it is nested in a list item, and the lists nested in it
     * inherit it. The curves of a list with `$branch` follow it. Numbers scale
     * the spacing token.
     */
    $indent(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-indent": getEmSpacingValue(value) },
      };
    },
    /**
     * Sets the space between two rows. It applies as it is, whatever the rows
     * hold and whatever their padding is, so `0` makes the frames of the rows
     * touch. Nested lists inherit it. Numbers scale the spacing token. By
     * default, the space derives from `$baseGap`.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-gap-root": getEmSpacingValue(value) },
      };
    },
    /**
     * Sets the base gap that the default space between two rows derives from:
     * half of it for rows of text, three quarters for rows with blocks, and all
     * of it for rows with headings, less the item padding. It defaults to the
     * gap of the prose around the list, so a list keeps the rhythm of its text.
     * Nested lists inherit it. Numbers scale the spacing token. `$gap` replaces
     * the derived space.
     */
    $baseGap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-gap-base-root": getEmSpacingValue(value) },
      };
    },
    /**
     * Sets the size of the marker box, which the rows keep for their markers.
     * Counters, icons, checks, and progress grow with the box, and bullets and
     * dashes keep their size. Rows grow with a box taller than one line, and
     * the marker stays centered on the first line. The text keeps at least the
     * item padding from the box with each size. In a vertical list, rows
     * without frames also keep at least 0.75em from the marker, so a bullet or
     * a dash on a guide, which stays on the center of a larger box, can move
     * away from its text. The box is one line by default. A vertical list of
     * bullets or dashes on a guide gets a box as wide as the font size, unless
     * a row has a check or progress; set `1lh` to give it the box of one line.
     * In such a list, the text of every row keeps its distance to the check, so
     * a bullet or a dash is farther from its text. Nested lists don't inherit
     * it. Numbers scale the spacing token.
     */
    $markerSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-marker-box": getEmSpacingValue(value) },
      };
    },
    /**
     * Sets the size of a bullet marker. The text of the rows keeps its distance
     * to the bullet. Nested lists don't inherit it. Numbers scale the spacing
     * token. Defaults to `0.4375em`.
     */
    $bulletSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-bullet-size": getEmSpacingValue(value) },
      };
    },
    /**
     * Sets the item frame padding. The gap between the blocks of a row and the
     * distance from the marker to the text follow it, so a marker sits as far
     * from the text as from the edges of a frame. In a vertical list without
     * frames, the marker keeps at least 0.75em from the text. Numbers scale the
     * spacing token and round to a whole pixel.
     */
    $itemPadding(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-item-padding": getEmPaddingValue(value) },
      };
    },
    /**
     * Sets the gap between the blocks of a row, such as a title and its
     * description, in place of the item padding. It doesn't move the marker.
     * Nested lists inherit it. Numbers scale the spacing token.
     */
    $itemGap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-item-gap-root": getEmSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $ordered: false,
    // Always resolve the branch flag to reset the inherited one.
    $branch: false,
    // Always resolve the layout to reset the inherited flag.
    $layout: "vertical",
    // A branch draws its curves with the guide. Clava passes `false` as the
    // default of a variant with boolean keys, so it can't mean an explicit
    // value here.
    $guide(_defaultValue, variants) {
      if (variants.$branch) return true;
      // The automatic guide reads the marker flags, which this marker clears.
      if (variants.$marker === "none") return false;
      return "auto";
    },
    // Always resolve the marker to reset inherited list flags.
    $marker(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$ordered) return "counter";
      if (variants.$guide === true) return "bullet";
      return "auto";
    },
  },
  refine({ variants, addClass }) {
    // Bullets and dashes on a guide sit on the line, in the center of the
    // marker box.
    if (variants.$guide !== true) return;
    if (variants.$marker === "counter") return;
    if (variants.$marker === "icon") return;
    // A horizontal row puts the marker box above its content.
    if (variants.$layout === "horizontal") return;
    // A check or a progress marker fills the marker box, less its inset, and
    // the guide goes through the center of each marker. The text of a list with
    // such a row takes its distance from that marker. The row is the list item,
    // a row in its own list item, or the button of a disclosure in one.
    addClass(
      "has-[>.ui-list-item-check,>*>.ui-list-item-check,>*>*>.ui-list-item-check]:[--list-glyph-space:0.2em]",
    );
    if (variants.$markerSize != null) return;
    // A box of one line keeps a bullet far from the start of the list and gives
    // nested lists a large indent. The default box of these lists is as wide as
    // the font size. A list with a check or a progress row keeps the box of one
    // line, which that marker fills.
    addClass(
      "not-has-[>.ui-list-item-check,>*>.ui-list-item-check,>*>*>.ui-list-item-check]:[--list-marker-box:1em]",
    );
  },
});

/** Shared padding and line height for list items and disclosure rows. */
const listRow = cv({
  extend: [textFrame],
  class: "ui-list-row",
  defaultVariants: {
    $layer: false,
    $rounded: "xl",
    $p: "var(--list-item-padding)",
    // A real border grows outward, like a ring, so the padding box and the
    // marker and guide in it stay where they are in rows without a border.
    $m(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!variants.$border) return defaultValue;
      return "calc(var(--list-row-border)*-1)";
    },
  },
  refine({ variants, addClass, addStyle }) {
    if (!hasLayerBackground(variants)) return;
    // A row with a surface, such as a card, sits above the guides of the rows
    // around it, and its own guide starts below it. The style attribute wins
    // over the flag that every row resets.
    addClass("z-2");
    addStyle({ "--list-row-solid": "1" });
  },
});

/** A list row with space for a marker and optional block content. */
export const listItem = cv({
  extend: [listRow],
  class: [
    "ui-list-item",
    // Make room for a marker box taller than one line. The longhands override
    // frame padding by stylesheet order.
    // Stays a class to come after the padding of `textFrame`, which it
    // replaces.
    "pbs-[calc(var(--py)+var(--list-marker-overhang))]",
    "pbe-[calc(var(--py)+var(--list-marker-overhang))]",
    // A horizontal row puts the marker box above its content, so it adds no
    // overhang to its padding.
    // Stays a class to come after the padding of `textFrame`, which it
    // replaces.
    "ui-list-horizontal:pbe-(--py) ui-list-horizontal:pe-(--px)",
  ],
  variants: {
    /**
     * Reserves the marker column. Set `false` for a row without a marker that
     * spans the full width, such as a card in a timeline. The guide still
     * passes the row, so raise the content above it. The style component sets
     * `false` in a list with `$marker="none"`.
     */
    $marker: {
      true: [
        // Reserve the marker box and the distance from it to the text.
        // Stays a class to come after the padding of `textFrame`, which it
        // replaces.
        "ps-[calc(var(--py)+var(--list-marker-box,1lh)+var(--list-text-inset))]",
        // A horizontal row reserves the marker box above its content, as far
        // from it as from the top edge. The line height adds white above the
        // text, so it needs no minimum like the marker gap.
        // Stays a class to come after the padding of `textFrame`, which it
        // replaces.
        "ui-list-horizontal:ps-(--px)",
        "ui-list-horizontal:pbs-[calc(var(--py)*2+var(--list-marker-box,1lh))]",
        // Both values set the flag, so a row in a row without a marker does
        // not inherit it.
        "[--list-row-marker-on:1]",
      ],
      // The guide passes a row without a marker in one piece.
      false: "[--list-row-marker-on:0]",
    },
    /**
     * Marks a row whose marker shows a check, an empty check slot, or progress.
     * A list of bullets or dashes on a guide has a narrow marker box by
     * default, and it keeps a box of one line when a row has this mark. The
     * style component sets it from `checked` and `progress`.
     */
    $check: "ui-list-item-check ui-list-item--check",
    /**
     * Shows the row as disabled, like a disabled control: lower contrast and
     * the faintest ink on the row, its marker, and the blocks of its content.
     * Deeper elements that set their own ink keep it. It doesn't set
     * `aria-disabled`.
     */
    $disabled: [
      "ui-list-item--disabled",
      "ak-disabled",
      // Stays a class to come after the --_ak-text-alpha of `ink`, which it
      // replaces.
      "ak-ink-0",
      // Fixed-depth child selectors reach the marker and the content blocks
      // without an ancestor walk on every style recalculation. Stays a class to
      // keep its order with the classes of the elements that it styles.
      "*:ak-ink-0 *:*:ak-ink-0",
      // Stays a class to come after the color of `ink`, which it replaces.
      "forced-colors:text-[GrayText]",
      // Stays a class to come after another class here that sets the color,
      // which it replaces.
      "forced-colors:**:text-[GrayText]",
      // Stays a class to come after the classes of a caller, so that the forced
      // colors rule still applies.
      "forced-colors:ui-text:text-[GrayText]",
    ],
  },
  defaultVariants: {
    $marker: true,
  },
  refine({ variants, addClass }) {
    if (hasSlotSurface(variants)) {
      // The list reads this class to keep all its rows in their frames.
      addClass("ui-list-item-surface");
      // The end padding of a row with a marker grows like the block padding, so
      // text at the end is as far from the side as from the top. A row without
      // a marker keeps its inline padding even.
      if (variants.$marker) {
        addClass("pe-[calc(var(--px)+var(--list-marker-overhang))]");
      }
    } else {
      // A row without a surface or a border starts at the edge of the list, so
      // its marker lines up with the text around the list. The row moves out by
      // its padding, which keeps the spacing between the rows. In prose, the
      // list keeps its indent.
      addClass([
        "-ms-[calc(var(--ak-frame-padding)*var(--list-flush))]",
        "in-[.ui-prose]:ms-0 ui-list-horizontal:ms-0",
      ]);
      // Its content also ends at the edge of the list, so content at the end of
      // rows at all levels lines up. Without end padding, the row stays inside
      // the list and cannot overflow it. A row that keeps its frame has the end
      // padding of a row with a surface, so their content ends at one line.
      addClass(
        variants.$marker
          ? "pe-[calc((var(--px)+var(--list-marker-overhang))*(1-var(--list-flush,0)))]"
          : "pe-[calc(var(--px)*(1-var(--list-flush,0)))]",
      );
    }
  },
});

/** A layout-free wrapper for list content. Use a span to avoid block mode. */
export const listItemContent = cv({
  class: "ui-list-item-content",
});

/**
 * A list marker that can show a number, bullet, dash, icon, check, or progress.
 * `$kind` paints it as a solid fill or as a tint, like a badge.
 */
export const listItemMarker = cv({
  // The frame supplies the border variants and their edge. The tint supplies
  // the mix and the text colors of each kind.
  extend: [frame, tint],
  class: [
    "ui-list-item-marker",
    // Stays a class, so that another class here that sets the outline-color
    // still comes after it and replaces it.
    "ui-list-counter:outline-(--ak-layer-parent)",
    // Stays a class to come after another class here that sets the
    // outline-color, which it replaces.
    "forced-colors:ui-list-counter:outline-[Canvas]",
    // Preserve system-colored marks; automatic forced colors would remove
    // fills.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:forced-color-adjust-none",
    "forced-colors:[--ak-edge:CanvasText]",
    // Stays a class to come after another class here that sets the inset, which
    // it replaces.
    "top-[calc(var(--list-marker-center-y)-var(--list-marker-size)/2)]",
    // Stays a class, so that another class here that sets the inset still comes
    // after it and replaces it.
    "inset-s-[calc(var(--list-marker-center-x)-var(--list-marker-size)/2+(var(--list-marker-reach)-var(--list-marker-size)/2)*var(--list-marker-hang))]",
  ],
  variants: {
    /**
     * Sets the check state: `"none"` shows the plain marker, `false` an empty
     * slot, and `true` a completed slot. Defaults to `"none"` unless
     * `$progress` is set.
     */
    $checked: {
      none: [
        "ui-list-item-marker--checked-none",
        // Stays a class to come after the background-color of `layer`, which it
        // replaces.
        "forced-colors:bg-[Canvas]",
        // Stays a class to come after the color of `ink`, which it replaces.
        "forced-colors:text-[CanvasText]",
        // Stays a class to come after the --tw-ring-shadow of `frameBase`,
        // which it replaces.
        "forced-colors:ui-list-counter:ring",
        "forced-colors:ui-list-icon:ring",
        // Stays a class to come after the classes of a caller, so that the
        // forced colors rule still applies.
        "forced-colors:ui-list-counter:ring-inset",
        "forced-colors:ui-list-icon:ring-inset",
        // Stays a class to come after another class here that sets the inset,
        // which it replaces.
        "ui-list-dash:top-(--list-marker-center-y)",
        "ui-list-dash:inset-s-[calc(var(--list-marker-center-x)-0.25lh+(var(--list-marker-reach)-0.25lh)*var(--list-marker-hang))]",
        // Stays a class to come after the border-style of `frameBase`, which it
        // replaces.
        "ui-list-dash:border-b",
        // Use a filled disc; thick rounded borders can leave a hole.
        // Stays a class to come after another class here that sets the inset,
        // which it replaces.
        "ui-list-bullet:top-[calc(var(--list-marker-center-y)-var(--list-bullet-size)/2)]",
        "ui-list-bullet:inset-s-[calc(var(--list-marker-center-x)-var(--list-bullet-size)/2+(var(--list-marker-reach)-var(--list-bullet-size)/2)*var(--list-marker-hang))]",
        // Stays a class to come after the background-color of `layer`, which it
        // replaces.
        "not-forced-colors:ui-list-bullet:bg-transparent",
      ],
      true: [
        "ui-list-item-marker--checked-true",
        // Stays a class to come after the background-color of `layer`, which it
        // replaces.
        "forced-colors:bg-[Canvas]",
        // Highlight can be translucent, like the selection color of macOS, so
        // paint it over Canvas, or the guide shows through the marker.
        // Stays a class to come after the classes of a caller, so that the
        // forced colors rule still applies.
        "forced-colors:bg-linear-to-b",
        "forced-colors:from-[Highlight] forced-colors:to-[Highlight]",
        // Stays a class to come after the color of `ink`, which it replaces.
        "forced-colors:text-[HighlightText]",
      ],
      false: [
        "ring-inset",
        // Stays a class to come after the --tw-ring-shadow of `frameBase`,
        // which it replaces.
        "ring ui-list-counter:ring-0",
        // Stays a class to come after the background-color of `layer`, which it
        // replaces.
        "forced-colors:bg-[Canvas]",
        // Stays a class to come after the color of `ink`, which it replaces.
        "forced-colors:text-[CanvasText]",
        // Stays a class to come after the --tw-ring-shadow of `frameBase`,
        // which it replaces.
        "forced-colors:ui-list-counter:ring",
      ],
    },
    /**
     * Sets the progress between `0` and `1` shown by the circular fill child.
     */
    $progress(value?: number | string) {
      if (value == null) return;
      return {
        style: { "--progress-value": `${value}` },
      };
    },
  },
  defaultVariants: {
    $kind: "solid",
    // The frame draws the adaptive edge of the marker. It keeps the circle.
    $rounded: "full",
    // A checked marker has an edge, like a frame with `$border`.
    $border(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$checked !== true) return defaultValue;
      return true;
    },
    // The edge is a border inside the marker box on every surface, like the
    // edge of a checkbox. A ring, which a frame draws on a light surface, would
    // take its width from the gap between the marker and the guide. Replace
    // only frame's auto default; an explicit type still applies.
    $borderType(defaultValue) {
      return defaultValue === "auto" ? "border" : defaultValue;
    },
    $checked(_defaultValue, variants) {
      if (variants.$progress == null) return "none";
      return Number(variants.$progress) === 1;
    },
    // A tinted marker blends a bit more than a tinted badge, because it has no
    // edge unless it is checked.
    $mix(defaultValue, variants) {
      if (variants.$kind !== "tint") return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return 20;
    },
    $layer(defaultValue, variants) {
      // Replace only frame's transparent default; preserve explicit colors.
      if (defaultValue !== "transparent") return defaultValue;
      return variants.$checked === true ? "brand" : true;
    },
    $lightnessOffset(defaultValue, variants) {
      // A colored marker, such as a check or a current step, keeps its color. A
      // neutral check takes the offset of a chip.
      if (isLayerColor(variants.$layer)) return defaultValue;
      if (variants.$checked === true) {
        return (
          defaultValue ?? `calc(var(--list-counter, 0) * ${CHIP_LIGHTNESS})`
        );
      }
      // CSS flags select the marker surface because class variants cannot
      // override a style attribute. Zero fallbacks support standalone markers.
      return (
        defaultValue ??
        (variants.$checked === false
          ? `calc(var(--list-counter, 0) * ${CHIP_LIGHTNESS} + var(--list-glyph, 0) * ${SLOT_LIGHTNESS})`
          : `calc(var(--list-counter, 0) * ${CHIP_LIGHTNESS})`)
      );
    },
    // A plain marker shows a chosen color at full strength, like its guide. The
    // edge of a check or an empty slot keeps its weight.
    $edgeRaw(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$checked !== "none") return defaultValue;
      if (!hasEdgeColor(variants.$edge)) return defaultValue;
      return true;
    },
    // Such a color also keeps 3:1 or more against the surface around the
    // marker, like its guide, so a bullet and its line stay the same color.
    $edgeContrast(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$checked !== "none") return defaultValue;
      if (!hasEdgeColor(variants.$edge)) return defaultValue;
      return true;
    },
    $edgeWeight(defaultValue, variants) {
      if (variants.$edgeRaw) return defaultValue;
      // The edge of a checked marker shows only in high contrast mode, where
      // the fill alone may not mark the circle.
      if (variants.$checked === true) return defaultValue ?? "adaptive";
      return defaultValue ?? (variants.$checked === false ? 25 : "bold");
    },
  },
});

/**
 * The check of a marker. It uses the check mark style recipe, like the checkbox
 * check, so both marks have the same shape, size rule, and wipe. It takes the
 * text color of a tinted marker.
 */
export const listItemMarkerCheck = cv({
  extend: [text, checkMark],
  // The adaptive text color of a tinted marker clears the background color of
  // this element, but not of the pseudo-element that draws the check.
  class: "ui-list-item-marker-check",
  variants: {
    /**
     * Shows the check. An unchecked marker keeps it out of view, so it can show
     * with the wipe of the check mark.
     */
    $checked: {
      true: [
        "ui-list-item-marker-check--checked-true",
        // A disabled control sets the system disabled color on its
        // descendants, which is not readable on the selection fill. Set the
        // color of the check directly so that no text color rule changes it.
        // Stays a class to come after the background-color of `ui-check-mark`,
        // which it replaces.
        "forced-colors:after:bg-[HighlightText]",
      ],
      false: "ui-list-item-marker-check--checked-false",
    },
  },
  defaultVariants: {
    // The marker is round.
    $roundBox: true,
  },
});

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
 * when it has less than 3:1 against the surface around the piece. The style
 * recipe that extends this one, such as the guide of a list item or of a table
 * of contents link, places the piece and sets these values on it or on an
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
export const listGuide = cv({
  extend: [edge],
  class: [
    "ui-list-guide",
    // The guide floats over the start of its row, so the rules that find the
    // first and last item of the row skip it by this class.
    "ui-slot-frame-floating",
    // Keep the line in forced colors, with a system color.
    // Stays a class to come after the classes of a caller, so that the forced
    // colors rule still applies.
    "forced-colors:forced-color-adjust-none forced-colors:[--ak-edge:CanvasText]",
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
      diagonal: "ui-list-guide--bend-diagonal",
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
      return { style: { "--guide-radius": getEmSpacingValue(value) } };
    },
    /**
     * Sets the line style. Dashes and dots start again in each piece and in
     * each curve of a bend.
     */
    $line: {
      solid: "ui-list-guide--line-solid",
      dashed: "ui-list-guide--line-dashed",
      dotted: "ui-list-guide--line-dotted",
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

// The geometry that both bends of a branch list share.
const listItemGuideBend = [
  // Keep the bends below the line of the parent list and the surfaces of rows.
  "hidden z-1",
  // From the marker column of the parent row to the marker column of this row.
  "[--guide-span:var(--list-indent,var(--list-indent-auto))]",
  // A bend joins the marker of this row to a marker in the parent list, one
  // row away. Like the line, it stops one gap before each marker: its own, and
  // the marker in the parent list, which each bend names.
  "[--guide-bend-height:max(0px,max(0px,var(--list-gap))+var(--list-guide-start)*2-var(--list-row-marker-cut,0px)-var(--list-guide-far-cut,0px))]",
  "inset-s-[calc(var(--list-guide-x)-var(--guide-span))]",
  "w-[calc(var(--guide-span)+var(--guide-width))]",
  "h-(--guide-bend-height)",
];

// The stem and the tail are children of the row that holds a branch list. They
// run on the marker column of that row: the stem from its marker to where the
// first bend of the list starts, and the tail from where the last bend ends to
// the marker of the next row. So the bends reach the markers when a row has
// more than one line and the guide of its list does not run past it. Only
// anchor positioning can find both ends of each piece, and other browsers draw
// no stem and no tail.
const listItemGuideLink = [
  "z-1 hidden supports-[anchor-name:--a]:block",
  "[--guide-in:0] [--guide-outward:0]",
  "[--guide-span:0px] [--guide-bend-height:0px]",
  // The pieces read the guide flag of the row that holds the list, which can
  // be off.
  "[--list-guide:1]",
  "[position-anchor:var(--list-guide-anchor)]",
  // The content of the row resets the marker box, so read the box and the
  // marker shift that the row publishes.
  "inset-s-[calc(var(--ak-frame-padding)+var(--list-row-marker-box,1lh)/2+var(--list-row-marker-shift,0px)-var(--guide-width)/2)]",
  "w-(--guide-width)",
];

/**
 * A piece of the guide of a list. The line runs from the marker of its row to
 * the marker of the next row, and the last row draws none. The bends join a
 * branch list to the guide of the parent list, like a branch in a commit graph,
 * and the parent guide keeps running past the branch. Each row of a branch list
 * has both bends, and only the first and the last rows show them. `$bend` and
 * `$radius` set the shape of the bends.
 */
export const listItemGuide = cv({
  // The guide draws the line and the bends, the way the guide of a table of
  // contents bends into a nested list, and colors them with its edge.
  extend: [listGuide],
  class: "ui-list-item-guide",
  variants: {
    /**
     * Sets which piece of the guide this is. `line` draws the line between two
     * markers. `in` and `out` are the bends of a branch list: `in` leaves the
     * parent guide one row before the first row and turns into its marker, and
     * `out` leaves the marker of the last row and turns back into the parent
     * guide one row after it. The list item sets it on the pieces that it
     * creates.
     */
    $piece: {
      line: [
        "ui-list-item-guide--piece-line",
        // Stays a class to come after another class here that sets the inset,
        // which it replaces.
        "top-[calc(var(--list-guide-start)+var(--list-guide-skip)-var(--list-guide-lead))]",
        // Stays a class, so that another class here that sets the inset still
        // comes after it and replaces it.
        "inset-s-(--list-guide-x)",
        // A horizontal guide joins the marker centers across the columns. The
        // line runs along the top of the piece, not along its start edge.
        // Stays a class to come after another class here that sets the inset,
        // which it replaces.
        "ui-list-horizontal:top-(--list-guide-x)",
        "ui-list-horizontal:inset-s-[calc(50%-var(--list-guide-lead))]",
      ],
      in: [
        ...listItemGuideBend,
        "ui-list-item-guide--piece-in",
        // Stays a class to come after the display of `listItemGuideBend`, which
        // it replaces.
        "ui-list-branch:ui-list-first-row:block",
      ],
      out: [
        ...listItemGuideBend,
        "ui-list-item-guide--piece-out",
        // The last row of the parent list has no next row to reach.
        // Stays a class to come after the display of `listItemGuideBend`, which
        // it replaces.
        "ui-list-branch:ui-list-last-row:not-ui-list-parent-last-row:block",
      ],
      stem: [
        ...listItemGuideLink,
        "ui-list-item-guide--piece-stem",
        // Stays a class to come after the inset of `listItemGuideLink`, which
        // it replaces.
        "bottom-[anchor(top,100%)]",
      ],
      tail: [
        ...listItemGuideLink,
        "ui-list-item-guide--piece-tail",
        // From where the last bend ends to one gap before the marker of the
        // next row, which is one row gap and one marker offset below this row.
        // Without an anchor, such as in the last row, the tail has no height.
        // Stays a class to come after the inset of `listItemGuideLink`, which
        // it replaces.
        "top-[anchor(bottom,calc(200%+100lvh))]",
      ],
    },
    /**
     * Names the anchor that joins a bend of a branch list to its stem or its
     * tail. The list creates the names and sets each on the two pieces.
     */
    $anchor(value?: string) {
      if (!value) return;
      return { style: { "--list-guide-anchor": value } };
    },
  },
  defaultVariants: {
    $piece: "line",
  },
});

/** A disclosure row with list spacing, a marker, and an optional guide. */
export const listDisclosure = cv({
  // Clava applies the shared frame once. The final listRow supplies radius and
  // padding defaults.
  extend: [disclosure, listRow],
  class: [
    // The button has a hover surface, so the row keeps its frame, and the list
    // keeps the other rows in theirs.
    "ui-list-item-surface",
    "ui-list-disclosure",
  ],
  variants: {
    /**
     * Whether the row has a marker. Without one, the content starts at the
     * label, like the content of other disclosures. The style component sets
     * `false` in a list with `$marker="none"`.
     */
    $marker: {
      // Like a list item, both values set whether the guide stops around a
      // marker.
      true: "ui-list-disclosure--marker-true",
      false: "[--list-row-marker-on:0]",
    },
  },
  defaultVariants: {
    // Restore the transparent layer that listRow disables.
    $layer: "transparent",
    $marker: true,
    $indent(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!variants.$marker) return defaultValue;
      return "var(--list-disclosure-indent)";
    },
    $leadingIcon: false,
  },
});

/** A disclosure button aligned with the list marker and text columns. */
export const listDisclosureButton = cv({
  extend: [disclosureButton],
  class: [
    "ui-list-disclosure-button",
    // Make room for a marker box taller than one line.
    // Stays a class to come after the padding of `textFrame`, which it
    // replaces.
    "pbs-[calc(var(--py)+var(--list-marker-overhang))]",
    "pbe-[calc(var(--py)+var(--list-marker-overhang))]",
  ],
  variants: {
    /**
     * Reserves the marker column, like `$marker` on a list item. The style
     * component sets `false` in a list with `$marker="none"`.
     */
    $marker: {
      true: [
        "ui-list-disclosure-button--marker-true",
        // Slots read --py to sit as far from the side as from the top. The end
        // padding grows like the block padding, so slots and text at the end
        // keep that distance. A button without a marker keeps its inline
        // padding even, like a row without one.
        // Stays a class to come after the padding of `textFrame`, which it
        // replaces.
        "pe-[calc(var(--px)+var(--list-marker-overhang))]",
      ],
      // Clear the indentation, so the label starts where the text of a row
      // without a marker starts, like a disclosure button without indentation.
      false: "[--disclosure-ps:initial]",
    },
    /**
     * Marks a row whose marker shows a check, an empty check slot, or progress,
     * like `$check` on a list item. The style component sets it from `checked`
     * and `progress`.
     */
    $check: "ui-list-item-check",
    /**
     * Sets the gap between the label and the description. `auto` uses the gap
     * between the blocks of a list item, so the description is as far below the
     * label as the second block of other rows.
     */
    $gapY(value?: "none" | "auto") {
      // Replace the inherited variant instead of adding a competing --gap-y.
      if (value !== "auto") return;
      return "[--gap-y:var(--list-item-gap)] gap-y-(--gap-y)";
    },
  },
  defaultVariants: {
    $marker: true,
  },
});

/** Disclosure content with the spacing of other list items. */
export const listDisclosureContentBody = cv({
  // The text variants set the text size of the content, such as a smaller size
  // for the details of a step.
  extend: [disclosureContentBody, text],
  class: [
    "gap-(--list-item-gap)",
    // Stays a class to come after the display of `proseColumn`, which it
    // replaces.
    "grid",
    // Stays a class to come after the padding of `disclosureContentBody`, which
    // it replaces.
    "in-[.ui-list]:pbs-[calc(var(--list-item-gap)-var(--ak-frame-padding))]",
  ],
  defaultVariants: {
    // Keep the guide under the content visible.
    $layer: "transparent",
  },
});
