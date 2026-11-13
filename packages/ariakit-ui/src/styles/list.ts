import { cv } from "clava";
import { getPaddingValue, getSpacingValue } from "../utils/styles.ts";
import { checkMark } from "./check-mark.ts";
import {
  disclosure,
  disclosureButton,
  disclosureContentBody,
} from "./disclosure.ts";
import { hasEdgeColor } from "./edge.ts";
import { font } from "./font.ts";
import { frame } from "./frame.ts";
import { guide } from "./guide.ts";
import { hasLayerBackground, isLayerColor } from "./layer.ts";
import { hasSlotSurface } from "./slot-frame.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";
import { tint } from "./tint.ts";

// Lightness offsets for counter and icon chips and for empty check slots. Plain
// bullets and dashes have no surface offset.
const CHIP_LIGHTNESS = 1.5;
const SLOT_LIGHTNESS = 1;

/** A list with adaptive item spacing, markers, and optional guides. */
export const list = cv({
  class: [
    "list grid gap-(--list-gap)",
    // Markers read the native counter, so the `start` attribute applies. They
    // increment it themselves because a grid row does not count. This rule
    // stops the implied increment of other rows, which would count twice.
    "[&>li]:[counter-increment:list-item_0]",
    // Only list elements scope the native counter by default.
    "[&:not(ol,ul,menu)]:[counter-reset:list-item]",
    "[--list-gap-base:var(--list-gap-root,--spacing(4))]",
    // Prose supplies the default gap. Explicit `$gap` wins through the style
    // attribute; nested lists win by specificity.
    "in-[.prose]:[--list-gap-base:var(--list-gap-root,var(--prose-gap))]",
    "[--list-item-padding:round(--spacing(1),1px)]",
    "[--list-gap:calc(var(--list-gap-base)*0.5-var(--list-item-padding))]",
    // The blocks of a row are as far apart as they are from the edges of its
    // frame, so they read as one group. $itemGap replaces this gap.
    "[--list-item-gap:var(--list-item-gap-root,var(--list-item-padding))]",
    // A nested list keeps the gap of its parent, and its indent shows the
    // level. Below the text of its row, or below the marker box when it is
    // taller, it keeps the space that its own rows have between them. A row
    // with blocks already adds part of it as a gap.
    "[:is(&_&)]:mt-[calc(var(--list-gap)+var(--list-item-padding)+var(--list-row-overhang)-var(--list-item-gap)*var(--list-row-blocks,0))]",
    // At the end of its row, the bottom padding of its last row would add to
    // the bottom padding of the parent row. Only the padding of the parent row
    // stays below the last row.
    "[:is(&_&)]:last:mb-[calc(-1*var(--list-item-padding)-var(--list-row-overhang))]",
    // Reset inherited flags so nested lists start with their own state.
    "[--list-blocks:0] [--list-last-row:0] [--list-first-row:0]",
    // A nested list reads the marker box of the row that holds it, so its
    // branch connectors can reach the marker of that row.
    "[--list-parent-marker-box:var(--list-row-marker-box)]",
    // It also reads whether that row is the last row of its list. A branch has
    // no row to curve back to after the last row.
    "[--list-parent-last-row:var(--list-row-last,0)]",
    // Rows without a surface start at the list edge. When a row has a surface,
    // is a disclosure, or is rendered as a link or a button, which have hover
    // surfaces, all rows keep their frames, so the markers of rows with the
    // same padding line up. Such a row can sit in its own list item.
    "[--list-flush:1]",
    "has-[>.list-item-surface,>*>.list-item-surface,>:is(a,button),>*>:is(a,button)]:[--list-flush:0]",
    "[&>li:last-of-type]:[--list-last-row:1]",
    "[&>li:first-of-type]:[--list-first-row:1]",
    // How far a row without a surface moves out of the list, which is its
    // padding. A row in prose stays in place.
    "[--list-row-outset:calc(var(--list-item-padding)*var(--list-flush))]",
    "in-[.prose]:[--list-row-outset:0px]",
    // The marker box is as far from the text as it is from the edges of the
    // frame, so a marker in a card or a hover surface sits in even space, and
    // the marker is as near to the text as the blocks of the row are to each
    // other. Rows without frames keep at least about the white between two
    // lines of text at a line height of 1.5, which runs along the line and
    // follows the font size. The gap starts at the end of the marker, so the
    // space that it leaves in its box counts.
    "[--list-marker-gap:max(calc(var(--list-item-padding)+var(--list-marker-space)),calc(0.75em*var(--list-flush)))]",
    // The space that a marker leaves between its end and the end of its box.
    // Without a guide, each marker ends where a counter chip ends. On a guide,
    // a bullet or a dash is on the center of the box.
    "[--list-chip-space:calc((var(--list-marker-box,1lh)-var(--list-marker-box,1.75em)+0.4em)/2)]",
    "[--list-glyph-space:calc((var(--list-marker-box,1lh)-var(--list-glyph-width,0px))/2)]",
    "[--list-marker-space:calc(var(--list-chip-space)+(var(--list-glyph-space)-var(--list-chip-space))*var(--list-glyph)*var(--list-guide))]",
    // How far the center of a marker is from the center of its box. Without a
    // guide, a bullet or a dash ends where a chip ends, so it is not on the
    // center. A list with a check or a progress row measures it from that
    // marker, and each row measures its own marker for a list nested in it.
    "[--list-check-space:initial]",
    "has-[>.list-item-check,>*>.list-item-check,>*>*>.list-item-check]:[--list-check-space:0.2em]",
    "[--list-marker-shift:calc((var(--list-check-space,var(--list-glyph-space))-var(--list-chip-space))*var(--list-glyph)*(1-var(--list-guide)))]",
    // A nested list reads the shift of the marker of the row that holds it.
    "[--list-parent-marker-shift:var(--list-row-marker-shift)]",
    // The distance from the marker column of the row that holds a nested list
    // to the marker column of the list, when the list starts at the text of
    // that row: half of each marker box, the text inset of that row, and the
    // padding of the rows of this list, less how far they move out. The
    // markers of each list can be away from the center of their boxes.
    "[--list-indent-auto:calc(var(--list-parent-marker-box,1lh)/2+var(--list-marker-box,1lh)/2+var(--list-text-inset,0px)+var(--list-item-padding)-var(--list-row-outset)-var(--list-parent-marker-shift)+var(--list-marker-shift))]",
    // An explicit indent moves a nested list by its difference from that
    // distance. The list grows at its start, so its rows end where they did.
    "[:is(&_&)]:ms-[calc(var(--list-indent,var(--list-indent-auto))-var(--list-indent-auto))]",
    // A surface-colored halo hides the guide around each marker.
    "[--list-guide-gap:--spacing(1)]",
    // Block content increases item spacing; nested lists inherit this mode.
    "ui-list-blocks:[--list-blocks:1]",
    "ui-list-blocks:[--list-item-padding:--spacing(2)]",
    "ui-list-blocks:[--list-gap:calc(var(--list-gap-base)*0.75-var(--list-item-padding))]",
    // The sections variant is registered last, so its gap overrides block
    // mode.
    "ui-list-sections:[--list-gap:calc(var(--list-gap-base)*1-var(--list-item-padding))]",
  ],
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
     * a `var()` to change the orientation with CSS, such as in a container
     * query.
     */
    $orientation(value?: "vertical" | "horizontal" | (string & {})) {
      if (value == null) return;
      // Always set the flag, so a nested list does not inherit it.
      if (value === "vertical") return "[--list-orientation:vertical]";
      // The rows place themselves in one grid row, in columns of equal width.
      if (value === "horizontal") {
        return "[--list-orientation:horizontal] auto-cols-fr";
      }
      return {
        class: "auto-cols-fr",
        style: { "--list-orientation": value },
      };
    },
    /**
     * Sets the row marker: `counter`, `icon`, `bullet`, `dash`, or `auto`.
     * Defaults to counters for ordered lists, bullets when `$guide` is `true`,
     * and `auto` otherwise. `auto` draws dashes, and a list nested in it draws
     * bullets, in turns. An `icon` marker is a chip that holds the icon of its
     * row.
     */
    $marker: {
      counter: "[--list-marker:counter] [--list-counter:1] [--list-glyph:0]",
      // An icon chip takes the surface and the automatic guide of a counter.
      icon: "[--list-marker:icon] [--list-counter:1] [--list-glyph:0]",
      // The glyph width is the width that the marker draws a bullet or a dash
      // with. The rows read it to find where their text starts.
      bullet: [
        "[--list-marker:bullet] [--list-counter:0] [--list-glyph:1]",
        "[--list-glyph-width:0.4375em]",
      ],
      dash: [
        "[--list-marker:dash] [--list-counter:0] [--list-glyph:1]",
        "[--list-glyph-width:0.5lh]",
      ],
      auto: [
        "[--list-marker:dash] [--list-counter:0] [--list-glyph:1]",
        "[--list-glyph-width:0.5lh]",
        // Each level of automatic lists outranks the level before it.
        "[:is(&_&)]:[--list-marker:bullet]",
        "[:is(&_&)]:[--list-glyph-width:0.4375em]",
        "[:is(&_&_&)]:[--list-marker:dash]",
        "[:is(&_&_&)]:[--list-glyph-width:0.5lh]",
        "[:is(&_&_&_&)]:[--list-marker:bullet]",
        "[:is(&_&_&_&)]:[--list-glyph-width:0.4375em]",
      ],
    },
    /**
     * Joins adjacent markers with a guide. `auto` enables guides for counters
     * and icons in block mode.
     */
    $guide: {
      auto: "[--list-guide:calc(var(--list-counter)*var(--list-blocks))]",
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
        style: { "--list-indent": getSpacingValue(value) },
      };
    },
    /**
     * Sets the base gap between items before the mode formulas apply. Nested
     * lists inherit it. Numbers scale the spacing token.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-gap-root": getSpacingValue(value) },
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
        style: { "--list-marker-box": getSpacingValue(value) },
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
        style: { "--list-item-padding": getPaddingValue(value) },
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
        style: { "--list-item-gap-root": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $ordered: false,
    // Always resolve the branch flag to reset the inherited one.
    $branch: false,
    // Always resolve the orientation to reset the inherited flag.
    $orientation: "vertical",
    // A branch draws its curves with the guide. Clava passes `false` as the
    // default of a variant with boolean keys, so it can't mean an explicit
    // value here.
    $guide(_defaultValue, variants) {
      return variants.$branch ? true : "auto";
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
    if (variants.$orientation === "horizontal") return;
    // A check or a progress marker fills the marker box, less its inset, and
    // the guide goes through the center of each marker. The text of a list with
    // such a row takes its distance from that marker. The row is the list item,
    // a row in its own list item, or the button of a disclosure in one.
    addClass(
      "has-[>.list-item-check,>*>.list-item-check,>*>*>.list-item-check]:[--list-glyph-space:0.2em]",
    );
    if (variants.$markerSize != null) return;
    // A box of one line keeps a bullet far from the start of the list and gives
    // nested lists a large indent. The default box of these lists is as wide as
    // the font size. A list with a check or a progress row keeps the box of one
    // line, which that marker fills.
    addClass(
      "not-has-[>.list-item-check,>*>.list-item-check,>*>*>.list-item-check]:[--list-marker-box:1em]",
    );
  },
});

/** Shared padding and line height for list items and disclosure rows. */
const listRow = cv({
  extend: [textFrame],
  class: [
    "relative",
    // Freeze line height as a length so larger child text stays aligned with
    // the marker.
    "leading-[1lh]",
    // Copy the non-inheriting frame border and ring into channels the guide
    // can inherit.
    "[--list-row-border:var(--ak-frame-border)]",
    "[--list-row-ring:var(--ak-frame-ring)]",
    // A row with a surface sets this flag, so its guide starts below it.
    "[--list-row-solid:0]",
    // Pass the marker box of this row to a list nested in it.
    "[--list-row-marker-box:var(--list-marker-box,1lh)]",
    // Tell a nested list how far the marker of this row is from the center of
    // its box. A check row sets its own space.
    "[--list-row-marker-shift:calc((var(--list-row-glyph-space,var(--list-glyph-space,0px))-var(--list-chip-space,0px))*var(--list-glyph,0)*(1-var(--list-guide,0)))]",
    // Tell a nested list whether this row is the last row of its list.
    "[--list-row-last:var(--list-last-row,0)]",
    // The text starts one marker gap after the marker, so it starts after the
    // marker box by that gap, less the space that the marker leaves in the
    // box. A nested list reads this length to find the text of its row.
    "[--list-text-inset:calc(var(--list-marker-gap,0px)-var(--list-marker-space,0px))]",
    // Tell a nested list whether this row lays out its content as blocks.
    "[--list-row-blocks:0] ui-list-item-blocks:[--list-row-blocks:1]",
    // How far a marker box taller than one line extends past the first line,
    // above and below it.
    "[--list-marker-overhang:max(0px,(var(--list-marker-box,1lh)-1lh)/2)]",
    // Tell a nested list how much padding the overhang adds around the content
    // of this row. A horizontal row puts the marker box above its content.
    "[--list-row-overhang:var(--list-marker-overhang)]",
    "ui-list-horizontal:[--list-row-overhang:0px]",
  ],
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
    // Make room for a marker box taller than one line. The longhands override
    // frame padding by stylesheet order.
    "pbs-[calc(var(--py)+var(--list-marker-overhang))]",
    "pbe-[calc(var(--py)+var(--list-marker-overhang))]",
    // A stretched row, such as a short column next to a taller one in a
    // horizontal list, keeps its blocks together and leaves the extra height
    // below them.
    "ui-list-item-blocks:grid ui-list-item-blocks:content-start",
    "ui-list-item-blocks:gap-(--list-item-gap)",
    // Put the marker in the padding corner. The content resets this offset.
    "[--list-marker-offset:var(--ak-frame-padding)]",
    // The rows of a horizontal list share one grid row, and each row centers
    // its content under the marker.
    "ui-list-horizontal:row-start-1",
    "ui-list-horizontal:text-center ui-list-horizontal:justify-items-center",
    "ui-list-horizontal:pbe-(--py)",
  ],
  variants: {
    /**
     * Reserves the marker column. Set `false` for a row without a marker that
     * spans the full width, such as a card in a timeline. The guide still
     * passes the row, so raise the content above it.
     */
    $marker: {
      true: [
        // Reserve the marker box and the distance from it to the text.
        "ps-[calc(var(--py)+var(--list-marker-box,1lh)+var(--list-text-inset))]",
        // A horizontal row reserves the marker box above its content, as far
        // from it as from the top edge. The line height adds white above the
        // text, so it needs no minimum like the marker gap.
        "ui-list-horizontal:ps-(--px)",
        "ui-list-horizontal:pbs-[calc(var(--py)*2+var(--list-marker-box,1lh))]",
      ],
      false: "",
    },
    /**
     * Marks a row whose marker shows a check, an empty check slot, or progress.
     * A list of bullets or dashes on a guide has a narrow marker box by
     * default, and it keeps a box of one line when a row has this mark. The
     * style component sets it from `checked` and `progress`.
     */
    $check: [
      "list-item-check",
      // A check fills the marker box, less its inset, so its center is nearer
      // to the center of the box than the center of a bullet.
      "[--list-row-glyph-space:0.2em]",
    ],
    /**
     * Shows the row as disabled, like a disabled control: lower contrast and
     * the faintest ink on the row, its marker, and the blocks of its content.
     * Deeper elements that set their own ink keep it. It doesn't set
     * `aria-disabled`.
     */
    $disabled: [
      // Fixed-depth child selectors reach the marker and the content blocks
      // without an ancestor walk on every style recalculation.
      "ak-disabled ak-ink-0 *:ak-ink-0 *:*:ak-ink-0",
      // An adaptive text color targets nested text and icons directly, so set
      // the ink on the same targets. Skip forced colors, where this rule would
      // override the system disabled color.
      "not-forced-colors:ui-text:ak-ink-0",
      "forced-colors:text-[GrayText] forced-colors:**:text-[GrayText]",
      "forced-colors:ui-text:text-[GrayText]",
    ],
  },
  defaultVariants: {
    $marker: true,
  },
  refine({ variants, addClass }) {
    if (hasSlotSurface(variants)) {
      // The list reads this class to keep all its rows in their frames.
      addClass("list-item-surface");
    } else {
      // A row without a surface or a border starts at the edge of the list, so
      // its marker lines up with the text around the list. The row moves out by
      // its padding, which keeps the spacing between the rows. In prose, the
      // list keeps its indent.
      addClass([
        "-ms-[calc(var(--ak-frame-padding)*var(--list-flush))]",
        "in-[.prose]:ms-0 ui-list-horizontal:ms-0",
      ]);
      // Its content also ends at the edge of the list, so content at the end of
      // rows at all levels lines up. Without end padding, the row stays inside
      // the list and cannot overflow it. A horizontal row stays centered.
      addClass([
        "pe-[calc(var(--px)*(1-var(--list-flush,0)))]",
        "ui-list-horizontal:pe-(--px)",
      ]);
    }
  },
});

/** A layout-free wrapper for list content. Use a span to avoid block mode. */
export const listItemContent = cv({
  class: [
    // Markers must come first: Firefox and Safari otherwise read nested
    // counters. This wrapper restores :first-child for content. Use a span; a
    // div would force block mode.
    "contents",
    // A marker in the content, such as a status icon, must not count or sit
    // like the row marker. A nested list sets this state again.
    "[--list-marker:initial] [--list-counter:initial] [--list-glyph:initial]",
    "[--list-guide-gap:initial] [--list-marker-offset:initial]",
    "[--list-marker-box:initial] [--list-row-glyph-space:initial]",
  ],
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
    "list-marker absolute pointer-events-none grid place-items-center",
    // An icon is small in a marker, so a lighter stroke keeps its shape clear.
    "[&>svg]:size-[60%] [&>svg]:stroke-[1.5]",
    // The halo hides the guide behind each marker, regardless of its shape.
    "z-3 outline-(--ak-layer-parent) outline-(length:--list-guide-gap,0px)",
    // A ring paints outside the marker, so the halo starts after it.
    "outline-offset-(--ak-frame-ring)",
    // Preserve a canvas-colored halo and system-colored marks; automatic
    // forced colors would remove fills and thicken the halo.
    "forced-colors:forced-color-adjust-none forced-colors:outline-[Canvas]",
    "forced-colors:[--ak-edge:CanvasText]",
    // Bullets and dashes override these marker dimensions by stylesheet order.
    "[--list-marker-inset:0.2em]",
    "[--list-marker-size:calc(var(--list-marker-box,1lh)-var(--list-marker-inset)*2)]",
    // A chip follows the font size, not the line height, so a counter has the
    // same size in a tall line. Checks in a list of chips take that size too.
    "[--list-chip-size:calc(var(--list-marker-box,calc(1.35em+var(--list-marker-inset)*2))-var(--list-marker-inset)*2)]",
    "ui-list-counter:[--list-marker-size:var(--list-chip-size)]",
    "ui-list-icon:[--list-marker-size:var(--list-chip-size)]",
    // Center the marker box on the first line, at the start of the row.
    // Outside a row, such as in row content, it is centered in the one-line
    // host.
    "[--list-marker-center-x:calc(var(--list-marker-offset,0px)+var(--list-marker-box,1lh)/2)]",
    "[--list-marker-center-y:calc(var(--list-marker-offset,0px)+var(--list-marker-overhang,0px)+0.5lh)]",
    // A horizontal row centers the marker box above its content.
    "ui-list-horizontal:[--list-marker-center-x:50%]",
    "ui-list-horizontal:[--list-marker-center-y:calc(var(--list-marker-offset,0px)+var(--list-marker-box,1lh)/2)]",
    // Without a guide, a bullet, a dash, or a check ends where a counter chip
    // ends, so all kinds of markers end at one line and have the same distance
    // to the text. On a guide and in a horizontal list, they stay on the
    // center. A marker outside a list row also stays on the center.
    "[--list-marker-reach:calc(var(--list-chip-size)/2)]",
    "[--list-marker-hang:calc(var(--list-glyph,0)*(1-var(--list-guide,0)))]",
    "ui-list-horizontal:[--list-marker-hang:0]",
    "top-[calc(var(--list-marker-center-y)-var(--list-marker-size)/2)]",
    "inset-s-[calc(var(--list-marker-center-x)-var(--list-marker-size)/2+(var(--list-marker-reach)-var(--list-marker-size)/2)*var(--list-marker-hang))]",
    "w-(--list-marker-size) h-(--list-marker-size) rounded-full",
    "ui-list-counter:[counter-increment:list-item]",
    "ui-list-counter:before:content-[counter(list-item)]",
    "ui-list-counter:before:absolute ui-list-counter:before:inset-0",
    "ui-list-counter:before:text-center ui-list-counter:before:font-semibold",
    "ui-list-counter:before:leading-(--list-marker-size)",
    "ui-list-counter:before:[font-size-adjust:0.45]",
    // Counters override the thick progress arc with a thin ring around the
    // number.
    "[--list-progress-thickness:calc(30%+0.25%*var(--contrast,0))]",
    "ui-list-counter:[--list-progress-thickness:0.15em]",
    "ui-list-icon:[--list-progress-thickness:0.15em]",
    "[--progress-thickness:var(--list-progress-thickness)]",
    // A spinning arc shows no value, so a thinner stroke reads as loading. The
    // base value has its own name, because a property that refers to itself is
    // invalid.
    "[&>[data-indeterminate]]:[--progress-thickness:calc(var(--list-progress-thickness)*2/3)]",
  ],
  variants: {
    /**
     * Sets the check state: `"none"` shows the plain marker, `false` an empty
     * slot, and `true` a completed slot. Defaults to `"none"` unless
     * `$progress` is set.
     */
    $checked: {
      none: [
        "forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
        "forced-colors:ui-list-counter:ring forced-colors:ui-list-counter:ring-inset",
        "forced-colors:ui-list-icon:ring forced-colors:ui-list-icon:ring-inset",
        "ui-list-dash:top-(--list-marker-center-y)",
        "ui-list-dash:inset-s-[calc(var(--list-marker-center-x)-0.25lh+(var(--list-marker-reach)-0.25lh)*var(--list-marker-hang))]",
        "ui-list-dash:w-[0.5lh] ui-list-dash:h-auto",
        "ui-list-dash:rounded-none ui-list-dash:border-b",
        // Use a filled disc; thick rounded borders can leave a hole. The size
        // equals seven pixels at a 16px font size.
        "[--list-bullet-size:0.4375em]",
        "ui-list-bullet:top-[calc(var(--list-marker-center-y)-var(--list-bullet-size)/2)]",
        "ui-list-bullet:inset-s-[calc(var(--list-marker-center-x)-var(--list-bullet-size)/2+(var(--list-marker-reach)-var(--list-bullet-size)/2)*var(--list-marker-hang))]",
        "ui-list-bullet:w-(--list-bullet-size) ui-list-bullet:h-(--list-bullet-size)",
        // Paint the translucent edge over the marker surface so the guide
        // cannot show through.
        "ui-list-bullet:bg-linear-to-b",
        "ui-list-bullet:from-(--ak-edge) ui-list-bullet:to-(--ak-edge)",
      ],
      true: [
        "before:hidden",
        // Highlight can be translucent, like the selection color of macOS, so
        // paint it over Canvas, or the guide shows through the marker.
        "forced-colors:bg-[Canvas] forced-colors:bg-linear-to-b",
        "forced-colors:from-[Highlight] forced-colors:to-[Highlight]",
        "forced-colors:text-[HighlightText]",
      ],
      false: [
        "ring ring-inset ui-list-counter:ring-0",
        "forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
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
    // The frame draws the ring of an adaptive edge. It keeps the circle.
    $rounded: "full",
    // A checked marker has a border or a ring, like a frame with `$border`.
    $border(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$checked !== true) return defaultValue;
      return true;
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
  refine({ variants, addClass }) {
    if (!variants.$border) return;
    // The halo starts after the ring, which is transparent unless the edge
    // shows, so the guide would show through it. Paint the halo color under the
    // ring. Where the edge is a border, the shadow has no width, and any faint
    // arc of it in Firefox has the color of the halo that covers it.
    addClass([
      "shadow-[0_0_0_var(--ak-frame-ring)_var(--ak-layer-parent)]",
      "forced-colors:shadow-[0_0_0_var(--ak-frame-ring)_Canvas]",
    ]);
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
  class: "absolute inset-0 grid place-items-center",
  variants: {
    /**
     * Shows the check. An unchecked marker keeps it out of view, so it can show
     * with the wipe of the check mark.
     */
    $checked: {
      true: [
        "after:[clip-path:inset(0)]",
        // Only this state sets the transition, so the check goes away at once.
        "motion-safe:after:transition-[clip-path]",
        "motion-safe:after:duration-150 motion-safe:after:ease-linear",
        // A disabled control sets the system disabled color on its
        // descendants, which is not readable on the selection fill. Set the
        // color of the check directly so that no text color rule changes it.
        "forced-colors:after:bg-[HighlightText]",
      ],
      false: "after:[clip-path:inset(0_100%_0_0)]",
    },
  },
  defaultVariants: {
    // The marker is round.
    $roundBox: true,
  },
});

// The geometry that both bends of a branch list share.
const listItemGuideBend = [
  // Keep the bends below the line of the parent list and the surfaces of rows.
  "hidden z-1",
  // From the marker column of the parent row to the marker column of this row.
  "[--guide-span:var(--list-indent,var(--list-indent-auto))]",
  // A bend is as tall as the distance from the marker center of one row to the
  // marker center of the next, like the line.
  "[--guide-bend-height:calc(max(0px,var(--list-gap))+var(--list-guide-start)*2)]",
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
  extend: [guide],
  class: [
    "list-guide",
    "[--guide-width:calc(var(--list-guide,0)*1px)]",
    // The marker of a row is centered on its first line, after its padding and
    // the overhang of the marker box.
    "[--list-guide-start:calc(var(--ak-frame-padding)+var(--list-marker-overhang,0px)+0.5lh)]",
    // Center the line on the marker column.
    "[--list-guide-x:calc(var(--ak-frame-padding)+var(--list-marker-box,1lh)/2-var(--guide-width)/2)]",
  ],
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
        // Keep the line below markers, and below disclosure content and the
        // surfaces of later rows, which come after it. It stays above the bends
        // of a branch list, which start and end on this line, so the line keeps
        // its color where a bend runs along it.
        "z-2",
        "[--guide-in:0] [--guide-outward:0]",
        "[--guide-span:0px] [--guide-bend-height:0px]",
        // The guide of a row with a surface starts below the row, so the
        // surface hides the part that runs to its marker. It also starts below
        // the border or the ring of the row, which grow outward, because a
        // translucent line over a translucent border shows as a darker dot.
        "[--list-guide-skip:calc((100%-var(--list-guide-start)+var(--list-row-border,0px)+var(--list-row-ring,0px))*var(--list-row-solid,0))]",
        // Join marker centers across the row and the gap. Row borders overlap
        // the gap, so they add no length. Clamp negative gaps to zero, as grid
        // layout does.
        "top-[calc(var(--list-guide-start)+var(--list-guide-skip))]",
        "inset-s-(--list-guide-x) w-(--guide-width)",
        "h-[calc(100%+max(0px,var(--list-gap))-var(--list-guide-skip))]",
        // A horizontal guide joins the marker centers across the columns. The
        // line runs along the top of the piece, not along its start edge.
        "ui-list-horizontal:top-(--list-guide-x)",
        "ui-list-horizontal:inset-s-1/2 ui-list-horizontal:h-(--guide-width)",
        "ui-list-horizontal:w-[calc(100%+max(0px,var(--list-gap)))]",
        "ui-list-horizontal:after:inset-e-0 ui-list-horizontal:after:border-s-0",
        "ui-list-horizontal:after:border-bs-(length:--guide-width)",
        // No marker follows the last row.
        "ui-list-last-row:hidden",
      ],
      in: [
        ...listItemGuideBend,
        "[--guide-in:1] [--guide-outward:0]",
        "ui-list-branch:ui-list-first-row:block",
        // The stem of the list ends where this bend starts.
        "[anchor-name:var(--list-guide-anchor)]",
        "top-[calc(var(--list-guide-start)-var(--guide-bend-height))]",
      ],
      out: [
        ...listItemGuideBend,
        // The last row of the parent list has no next row to reach.
        "ui-list-branch:ui-list-last-row:not-ui-list-parent-last-row:block",
        "[--guide-in:0] [--guide-outward:1]",
        "top-(--list-guide-start)",
        // The tail of the list starts where this bend ends.
        "[anchor-name:var(--list-guide-anchor)]",
      ],
      stem: [
        ...listItemGuideLink,
        // From the marker of the row to where the first bend starts. Without
        // an anchor, the stem has no height.
        "top-(--list-guide-start)",
        "bottom-[anchor(top,100%)]",
      ],
      tail: [
        ...listItemGuideLink,
        // From where the last bend ends to the marker of the next row, which
        // is one gap and one marker offset below this row. Without an anchor,
        // such as in the last row, the tail has no height.
        "top-[anchor(bottom,calc(200%+100lvh))]",
        "bottom-[calc(-1*(max(0px,var(--list-gap))+var(--list-guide-start)))]",
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
    "list-item-surface",
    // Reset the list state in the content, as list item content does, whatever
    // body the content renders.
    "[&>.disclosure-content]:[--list-marker:initial]",
    "[&>.disclosure-content]:[--list-counter:initial]",
    "[&>.disclosure-content]:[--list-glyph:initial]",
    "[&>.disclosure-content]:[--list-guide-gap:initial]",
    // The content reads the marker box for its guide, so reset it one level
    // down.
    "[&>.disclosure-content>*]:[--list-marker-box:initial]",
    // The button pads its label with the overhang, so a nested list in the
    // content adds none.
    "[&>.disclosure-content]:[--list-row-overhang:0px]",
    // With a guide, indent content to the row text. The unpadded root still
    // supplies the frame channels. A registered length keeps the indent of the
    // row when the content sets a font size.
    "[--list-disclosure-indent:calc(var(--py)+(var(--list-text-inset)+var(--list-marker-box,1lh))*var(--list-guide))]",
    // Raise the content over the guide, as the guide of a disclosure content
    // runs under its rows. The child selector outranks the content's own
    // stacking. The guide of the row comes after the content and never bends,
    // so it stays below the content.
    "[&>.disclosure-content]:z-2",
    "[&>.list-guide]:z-1",
    // Expose the marker column as the content guide while the list draws its
    // guide there, so start bars of nav rows in the content sit on it. The
    // child selector outranks the content's own reset.
    "ui-list-guide:[&>.disclosure-content]:[--disclosure-guide-center:calc(var(--disclosure-padding)+var(--list-marker-box,1lh)/2)]",
    "ui-list-guide:[&>.disclosure-content]:[--disclosure-guide:var(--disclosure-guide-center)]",
  ],
  defaultVariants: {
    // Restore the transparent layer that listRow disables.
    $layer: "transparent",
    $indent: "var(--list-disclosure-indent)",
    $leadingIcon: false,
  },
});

/** A disclosure button aligned with the list marker and text columns. */
export const listDisclosureButton = cv({
  extend: [disclosureButton],
  class: [
    "[--disclosure-ps:calc(var(--py)+var(--list-marker-box,1lh)+var(--list-text-inset))]",
    // Make room for a marker box taller than one line.
    "pbs-[calc(var(--py)+var(--list-marker-overhang))]",
    "pbe-[calc(var(--py)+var(--list-marker-overhang))]",
    // Hover and press surfaces cover the guide; the marker stays above both.
    "z-3",
    // Put the marker in the padding corner. Label content resets this offset.
    "[--list-marker-offset:var(--ak-frame-padding)]",
  ],
  variants: {
    /**
     * Marks a row whose marker shows a check, an empty check slot, or progress,
     * like `$check` on a list item. The style component sets it from `checked`
     * and `progress`.
     */
    $check: "list-item-check",
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
});

/** Disclosure content with the spacing of other list items. */
export const listDisclosureContentBody = cv({
  // The font sets the text size of the content, such as a smaller size for the
  // details of a step.
  extend: [disclosureContentBody, font],
  class: [
    "grid gap-(--list-item-gap)",
    "in-[.list]:pbs-[calc(var(--list-item-gap)-var(--ak-frame-padding))]",
  ],
  defaultVariants: {
    // Keep the guide under the content visible.
    $layer: "transparent",
  },
});
