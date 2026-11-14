import { cv, cx } from "clava";
import { getPaddingValue, getSpacingValue } from "../utils/styles.ts";
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
  class: [
    "list gap-(--list-gap)",
    // Markers read the native counter, so the `start` attribute applies. They
    // increment it themselves because a grid row does not count. This rule
    // stops the implied increment of other rows, which would count twice.
    "[&>li]:[counter-increment:list-item_0]",
    // Only list elements scope the native counter by default.
    "[&:not(ol,ul,menu)]:[counter-reset:list-item]",
    // The base gap is the rhythm of the text around the list. The space
    // between two rows derives from it, by how much content the rows hold.
    "[--list-gap-base:var(--list-gap-base-root,--spacing(4))]",
    // Prose supplies the default base gap. Explicit `$baseGap` wins through the
    // style attribute; nested lists win by specificity.
    "in-[.prose]:[--list-gap-base:var(--list-gap-base-root,var(--prose-gap))]",
    "[--list-item-padding:round(--spacing(1),1px)]",
    // Rows have padding that doesn't show without a surface, so the derived
    // gap takes it out. `$gap` sets the space between two rows directly.
    "[--list-gap:var(--list-gap-root,calc(var(--list-gap-base)*0.5-var(--list-item-padding)))]",
    // The blocks of a row are as far apart as they are from the edges of its
    // frame, so they read as one group. $itemGap replaces this gap.
    "[--list-item-gap:var(--list-item-gap-root,var(--list-item-padding))]",
    // A list in a row of another list keeps the gap of its parent, and its
    // indent shows the level. Below the text of its row, or below the marker
    // box when it is taller, it keeps the space that its own rows have between
    // them. A row with blocks already adds part of it as a gap. A list that
    // another list holds outside its rows, such as the list of a navigation,
    // is not nested.
    "[.list-row_&]:mt-[calc(var(--list-gap)+var(--list-item-padding)+var(--list-row-overhang)-var(--list-item-gap)*var(--list-row-blocks,0))]",
    // At the end of its row, the bottom padding of its last row would add to
    // the bottom padding of the parent row. Only the padding of the parent row
    // stays below the last row.
    "[.list-row_&]:last:mb-[calc(-1*var(--list-item-padding)-var(--list-row-overhang))]",
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
    "[.list-row_&]:ms-[calc(var(--list-indent,var(--list-indent-auto))-var(--list-indent-auto))]",
    // The guide stops this far from each marker, so the surface around the
    // list shows between them, whatever it paints.
    "[--list-guide-gap:--spacing(1)]",
    // A nested list reads how far the guide stops from the marker of the row
    // that holds it, and from the marker of the row after that one, so its
    // branch connectors stop there too.
    "[--list-parent-marker-cut:var(--list-row-marker-cut)]",
    "[--list-parent-next-marker-cut:var(--list-row-next-marker-cut)]",
    // The size of a bullet, which equals seven pixels at a 16px font size.
    // $bulletSize replaces it.
    "[--list-bullet-size:0.4375em]",
    // Block content increases item spacing; nested lists inherit this mode.
    "ui-list-blocks:[--list-blocks:1]",
    "ui-list-blocks:[--list-item-padding:--spacing(2)]",
    "ui-list-blocks:[--list-gap:var(--list-gap-root,calc(var(--list-gap-base)*0.75-var(--list-item-padding)))]",
    // The sections variant is registered last, so its gap overrides block
    // mode.
    "ui-list-sections:[--list-gap:var(--list-gap-root,calc(var(--list-gap-base)*1-var(--list-item-padding)))]",
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
      // An icon chip takes the surface and the automatic guide of a counter.
      icon: "[--list-marker:icon] [--list-counter:1] [--list-glyph:0]",
      bullet: listMarkerClasses.bullet,
      dash: [
        "[--list-marker:dash] [--list-counter:0] [--list-glyph:1]",
        "[--list-glyph-width:0.5lh]",
      ],
      auto: [
        "[--list-marker:dash] [--list-counter:0] [--list-glyph:1]",
        "[--list-glyph-width:0.5lh]",
        // Each level of automatic lists outranks the level before it.
        "[:is(&_&)]:[--list-marker:bullet]",
        "[:is(&_&)]:[--list-glyph-width:var(--list-bullet-size)]",
        "[:is(&_&_&)]:[--list-marker:dash]",
        "[:is(&_&_&)]:[--list-glyph-width:0.5lh]",
        "[:is(&_&_&_&)]:[--list-marker:bullet]",
        "[:is(&_&_&_&)]:[--list-glyph-width:var(--list-bullet-size)]",
      ],
      none: listMarkerClasses.none,
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
     * Sets the space between two rows. It applies as it is, whatever the rows
     * hold and whatever their padding is, so `0` makes the frames of the rows
     * touch. Nested lists inherit it. Numbers scale the spacing token. By
     * default, the space derives from `$baseGap`.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-gap-root": getSpacingValue(value) },
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
        style: { "--list-gap-base-root": getSpacingValue(value) },
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
     * Sets the size of a bullet marker. The text of the rows keeps its distance
     * to the bullet. Nested lists don't inherit it. Numbers scale the spacing
     * token. Defaults to `0.4375em`.
     */
    $bulletSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-bullet-size": getSpacingValue(value) },
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
    // A list nested in the row reads this class.
    "list-row relative",
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
    // How far a marker reaches from its center along the guide. A check, an
    // empty slot, or progress fills the marker box, less its inset. A counter
    // or an icon is a chip, and a check in such a list has its size.
    "[--list-row-check-reach:calc(var(--list-marker-box,1lh)/2-0.2em)]",
    "ui-list-counter:[--list-row-check-reach:calc(var(--list-marker-box,1.75em)/2-0.2em)]",
    "ui-list-icon:[--list-row-check-reach:calc(var(--list-marker-box,1.75em)/2-0.2em)]",
    // A bullet or a dash is smaller than the box. A vertical guide crosses a
    // dash, and a horizontal guide runs along it.
    "[--list-row-plain-reach:var(--list-row-check-reach)]",
    "ui-list-bullet:[--list-row-plain-reach:calc(var(--list-bullet-size)/2)]",
    "ui-list-dash:[--list-row-plain-reach:0.5px]",
    "ui-list-horizontal:ui-list-dash:[--list-row-plain-reach:0.25lh]",
    // The marker of this row is a check when the row is a list item with the
    // check class, or a disclosure whose button has it.
    "[--list-row-marker-reach:var(--list-row-check-reach)]",
    "not-[.list-item-check,:has(>.list-item-check)]:[--list-row-marker-reach:var(--list-row-plain-reach)]",
    // The guide stops one gap before the marker and starts again one gap after
    // it. The pieces of the row, the stem of a branch list in the row, and
    // that list read this distance. A row without a marker has none.
    "[--list-row-marker-cut:calc((var(--list-row-marker-reach)+var(--list-guide-gap,0px))*var(--list-row-marker-on,1))]",
    // The same distance for the marker of the next row, where a branch list in
    // this row returns to the guide. The next row can have a check when this
    // row has none. That row is a list item, or a link or a disclosure in a
    // list item.
    "[--list-row-next-marker-cut:calc(var(--list-row-plain-reach)+var(--list-guide-gap,0px))]",
    "has-[+li.list-item-check,+li>.list-item-check,+li>.list-row>.list-item-check]:[--list-row-next-marker-cut:calc(var(--list-row-check-reach)+var(--list-guide-gap,0px))]",
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
    // A horizontal row puts the marker box above its content, so it adds no
    // overhang to its padding.
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
        "ps-[calc(var(--py)+var(--list-marker-box,1lh)+var(--list-text-inset))]",
        // A horizontal row reserves the marker box above its content, as far
        // from it as from the top edge. The line height adds white above the
        // text, so it needs no minimum like the marker gap.
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
        "in-[.prose]:ms-0 ui-list-horizontal:ms-0",
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
  class: [
    // Markers must come first: Firefox and Safari otherwise read nested
    // counters. This wrapper restores :first-child for content. Use a span; a
    // div would force block mode.
    "contents",
    // A marker in the content, such as a status icon, must not count or sit
    // like the row marker. A nested list sets this state again.
    "[--list-marker:initial] [--list-counter:initial] [--list-glyph:initial]",
    "[--list-marker-offset:initial]",
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
    // The guide stops before the marker and never runs behind it, so the
    // marker needs no paint around it to hide the guide.
    "z-3",
    // A thin outline in the color of the layer behind the marker separates a
    // number from a row surface that it overlaps, such as the current link of
    // a navigation, where the marker sits on the surface around the rows. A
    // ring paints outside the marker, so the outline starts after it.
    "ui-list-counter:outline-1 ui-list-counter:outline-(--ak-layer-parent)",
    "ui-list-counter:outline-offset-(--ak-frame-ring)",
    "forced-colors:ui-list-counter:outline-[Canvas]",
    // Preserve system-colored marks; automatic forced colors would remove
    // fills.
    "forced-colors:forced-color-adjust-none",
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
        // Use a filled disc; thick rounded borders can leave a hole.
        "ui-list-bullet:top-[calc(var(--list-marker-center-y)-var(--list-bullet-size)/2)]",
        "ui-list-bullet:inset-s-[calc(var(--list-marker-center-x)-var(--list-bullet-size)/2+(var(--list-marker-reach)-var(--list-bullet-size)/2)*var(--list-marker-hang))]",
        "ui-list-bullet:w-(--list-bullet-size) ui-list-bullet:h-(--list-bullet-size)",
        // A bullet paints only its edge color, which is translucent, so it
        // takes the tone of the surface behind it, like the guide. No guide
        // runs behind a marker. In forced colors, it keeps the canvas color
        // under the system color of the edge.
        "ui-list-bullet:bg-linear-to-b",
        "ui-list-bullet:from-(--ak-edge) ui-list-bullet:to-(--ak-edge)",
        "not-forced-colors:ui-list-bullet:bg-transparent",
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
        // Keep the line below disclosure content and the surfaces of later
        // rows, which come after it. It stays above the bends of a branch list,
        // which start and end on this line, so the line keeps its color where a
        // bend runs along it.
        "z-2",
        "[--guide-in:0] [--guide-outward:0]",
        "[--guide-span:0px] [--guide-bend-height:0px]",
        // The piece runs along its row and the gap after it, so the pieces of
        // adjacent rows join into one line. Row borders overlap the gap, so
        // they add no length. Clamp negative gaps to zero, as grid layout does.
        // The last row has no gap after it.
        "[--list-guide-reach:max(0px,var(--list-gap))]",
        "ui-list-last-row:[--list-guide-reach:0px]",
        // The guide of a row with a surface starts below the row, because the
        // surface hides the part along the row. It also starts below the
        // border or the ring of the row, which grow outward, because a
        // translucent line over a translucent border shows as a darker dot.
        "[--list-guide-skip:calc((100%+var(--list-row-border,0px)+var(--list-row-ring,0px))*var(--list-row-solid,0))]",
        "top-(--list-guide-skip)",
        "inset-s-(--list-guide-x) w-(--guide-width)",
        "h-[calc(100%+var(--list-guide-reach)-var(--list-guide-skip))]",
        // The clip removes the line around the marker of the row, so the
        // surface behind the list shows there, whatever it paints. It also
        // removes the line before the first marker and after the last one. A
        // large offset moves an edge of the clip out of the piece: the line
        // before the marker goes away in the first row, the line after it in
        // the last row, and a row with a surface, whose piece starts below it,
        // keeps the whole line.
        "[--list-guide-clip-before:calc(var(--list-guide-start)-var(--list-row-marker-cut,0px)-(var(--list-first-row,0)+var(--list-row-solid,0))*100000px)]",
        "[--list-guide-clip-after:calc(var(--list-guide-start)+var(--list-row-marker-cut,0px)+(var(--list-last-row,0)-var(--list-row-solid,0))*100000px)]",
        // Two rectangles, joined along the start edge. The sides extend past
        // the piece, so the clip never thins a line that snaps to a device
        // pixel beside it.
        "[clip-path:polygon(-1px_-1px,calc(100%+1px)_-1px,calc(100%+1px)_var(--list-guide-clip-before),-1px_var(--list-guide-clip-before),-1px_var(--list-guide-clip-after),calc(100%+1px)_var(--list-guide-clip-after),calc(100%+1px)_calc(100%+1px),-1px_calc(100%+1px))]",
        // A horizontal guide runs along the row and the gap after it, through
        // the marker centers. The line runs along the top of the piece, not
        // along its start edge.
        "ui-list-horizontal:top-(--list-guide-x)",
        "ui-list-horizontal:inset-s-0 ui-list-horizontal:h-(--guide-width)",
        "ui-list-horizontal:w-[calc(100%+var(--list-guide-reach))]",
        "ui-list-horizontal:after:inset-e-0 ui-list-horizontal:after:border-s-0",
        "ui-list-horizontal:after:border-bs-(length:--guide-width)",
        // The marker is on the center of the row, which is the center of the
        // piece less half the gap that the piece covers after the row. The
        // clip takes physical distances, so right to left text swaps its
        // sides. A row with a surface keeps the line around its marker.
        "ui-list-horizontal:[--list-guide-center:calc(50%-var(--guide-dir)*var(--list-guide-reach)/2)]",
        "ui-list-horizontal:[--list-guide-clip-before:calc(var(--list-guide-center)-var(--list-row-marker-cut,0px)-(var(--list-first-row,0)*(1+var(--guide-dir))+var(--list-last-row,0)*(1-var(--guide-dir)))*50000px)]",
        "ui-list-horizontal:[--list-guide-clip-after:calc(var(--list-guide-center)+var(--list-row-marker-cut,0px)+(var(--list-last-row,0)*(1+var(--guide-dir))+var(--list-first-row,0)*(1-var(--guide-dir)))*50000px)]",
        "ui-list-horizontal:[clip-path:polygon(-1px_-1px,-1px_calc(100%+1px),var(--list-guide-clip-before)_calc(100%+1px),var(--list-guide-clip-before)_-1px,var(--list-guide-clip-after)_-1px,var(--list-guide-clip-after)_calc(100%+1px),calc(100%+1px)_calc(100%+1px),calc(100%+1px)_-1px)]",
      ],
      in: [
        ...listItemGuideBend,
        "[--guide-in:1] [--guide-outward:0]",
        "ui-list-branch:ui-list-first-row:block",
        // The bend starts at the marker of the row that holds the list.
        "[--list-guide-far-cut:var(--list-parent-marker-cut,0px)]",
        // The stem of the list ends where this bend starts.
        "[anchor-name:var(--list-guide-anchor)]",
        "top-[calc(var(--list-guide-start)-var(--list-row-marker-cut,0px)-var(--guide-bend-height))]",
      ],
      out: [
        ...listItemGuideBend,
        // The last row of the parent list has no next row to reach.
        "ui-list-branch:ui-list-last-row:not-ui-list-parent-last-row:block",
        "[--guide-in:0] [--guide-outward:1]",
        // The bend ends at the marker of the row after the one that holds the
        // list.
        "[--list-guide-far-cut:var(--list-parent-next-marker-cut,0px)]",
        "top-[calc(var(--list-guide-start)+var(--list-row-marker-cut,0px))]",
        // The tail of the list starts where this bend ends.
        "[anchor-name:var(--list-guide-anchor)]",
      ],
      stem: [
        ...listItemGuideLink,
        // From one gap after the marker of the row to where the first bend
        // starts. Without an anchor, the stem has no height.
        "top-[calc(var(--list-guide-start)+var(--list-row-marker-cut,0px))]",
        "bottom-[anchor(top,100%)]",
      ],
      tail: [
        ...listItemGuideLink,
        // From where the last bend ends to one gap before the marker of the
        // next row, which is one row gap and one marker offset below this row.
        // Without an anchor, such as in the last row, the tail has no height.
        "top-[anchor(bottom,calc(200%+100lvh))]",
        "bottom-[calc(-1*(max(0px,var(--list-gap))+var(--list-guide-start)-var(--list-row-next-marker-cut,0px)))]",
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
  variants: {
    /**
     * Whether the row has a marker. Without one, the content starts at the
     * label, like the content of other disclosures. The style component sets
     * `false` in a list with `$marker="none"`.
     */
    $marker: {
      // Like a list item, both values set whether the guide stops around a
      // marker. The button holds the marker, so a disclosure without a button
      // has none.
      true: [
        "[--list-row-marker-on:0]",
        "has-[>.disclosure-button]:[--list-row-marker-on:1]",
      ],
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
     * Reserves the marker column, like `$marker` on a list item. The style
     * component sets `false` in a list with `$marker="none"`.
     */
    $marker: {
      true: [
        "[--disclosure-ps:calc(var(--py)+var(--list-marker-box,1lh)+var(--list-text-inset))]",
        // Slots read --py to sit as far from the side as from the top. The end
        // padding grows like the block padding, so slots and text at the end
        // keep that distance. A button without a marker keeps its inline
        // padding even, like a row without one.
        "pe-[calc(var(--px)+var(--list-marker-overhang))]",
      ],
      // The label starts where the text of a row without a marker starts.
      false: "[--disclosure-ps:var(--px)]",
    },
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
    "grid gap-(--list-item-gap)",
    "in-[.list]:pbs-[calc(var(--list-item-gap)-var(--ak-frame-padding))]",
  ],
  defaultVariants: {
    // Keep the guide under the content visible.
    $layer: "transparent",
  },
});
