import { cv } from "clava";
import { getPaddingValue, getSpacingValue } from "../utils/styles.ts";
import { checkMark } from "./check-mark.ts";
import {
  disclosure,
  disclosureButton,
  disclosureContentBody,
} from "./disclosure.ts";
import { font } from "./font.ts";
import { frame } from "./frame.ts";
import { hasLayerBackground, isLayerColor, layer } from "./layer.ts";
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
    "[--list-item-gap:calc(var(--list-gap)+var(--list-item-padding)*0.5)]",
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
    "[--list-blocks:0] [--list-last-row:0]",
    // Rows without a surface start at the list edge. When a row has a surface,
    // is a disclosure, or is rendered as a link or a button, which have hover
    // surfaces, all rows keep their frames, so the markers of rows with the
    // same padding line up. Such a row can sit in its own list item.
    "[--list-flush:1]",
    "has-[>.list-item-surface,>*>.list-item-surface,>:is(a,button),>*>:is(a,button)]:[--list-flush:0]",
    "[&>li:last-of-type]:[--list-last-row:1]",
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
      bullet: "[--list-marker:bullet] [--list-counter:0] [--list-glyph:1]",
      dash: "[--list-marker:dash] [--list-counter:0] [--list-glyph:1]",
      auto: [
        "[--list-marker:dash] [--list-counter:0] [--list-glyph:1]",
        // Each level of automatic lists outranks the level before it.
        "[:is(&_&)]:[--list-marker:bullet]",
        "[:is(&_&_&)]:[--list-marker:dash]",
        "[:is(&_&_&_&)]:[--list-marker:bullet]",
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
     * Sets the size of the marker box, which is one line tall by default. Rows
     * grow with a taller box, and the marker stays centered on the first line.
     * Numbers scale the spacing token.
     */
    $markerSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-marker-box": getSpacingValue(value) },
      };
    },
    /**
     * Sets the item frame padding. Numbers scale the spacing token and round to
     * a whole pixel.
     */
    $itemPadding(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-item-padding": getPaddingValue(value) },
      };
    },
  },
  defaultVariants: {
    $ordered: false,
    // Always resolve the orientation to reset the inherited flag.
    $orientation: "vertical",
    $guide: "auto",
    // Always resolve the marker to reset inherited list flags.
    $marker(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$ordered) return "counter";
      if (variants.$guide === true) return "bullet";
      return "auto";
    },
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
    // Copy the non-inheriting frame border into a channel the guide can
    // inherit.
    "[--list-row-border:var(--ak-frame-border)]",
    // A row with a surface sets this flag, so its guide starts below it.
    "[--list-row-solid:0]",
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
        // Reserve the marker box plus the control text inset.
        "ps-[calc(var(--px)+var(--list-marker-box,1lh))]",
        // A horizontal row reserves the marker box above its content.
        "ui-list-horizontal:ps-(--px)",
        "ui-list-horizontal:pbs-[calc(var(--py)+var(--list-marker-box,1lh)+var(--list-item-gap))]",
      ],
      false: "",
    },
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
  refine({ variants, addClass, addStyle }) {
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
    if (!hasLayerBackground(variants)) return;
    // A row with a surface, such as a card, sits above the guides of the rows
    // around it. The style attribute wins over the flag that every row resets.
    addClass("z-2");
    addStyle({ "--list-row-solid": "1" });
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
    "[--list-marker-box:initial]",
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
    "top-[calc(var(--list-marker-center-y)-var(--list-marker-size)/2)]",
    "inset-s-[calc(var(--list-marker-center-x)-var(--list-marker-size)/2)]",
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
        "ui-list-dash:inset-s-[calc(var(--list-marker-center-x)-0.25lh)]",
        "ui-list-dash:w-[0.5lh] ui-list-dash:h-auto",
        "ui-list-dash:rounded-none ui-list-dash:border-b",
        // Use a filled disc; thick rounded borders can leave a hole. The size
        // equals seven pixels at a 16px font size.
        "[--list-bullet-size:0.4375em]",
        // Without a guide, a bullet ends where a chip ends, so it sits near the
        // text and in line with the counters of other lists. On a guide and in
        // a horizontal list, it stays on the center.
        "[--list-bullet-reach:calc(var(--list-chip-size)/2)]",
        "[--list-bullet-end:calc(1-var(--list-guide,0))]",
        "ui-list-horizontal:[--list-bullet-end:0]",
        "ui-list-bullet:top-[calc(var(--list-marker-center-y)-var(--list-bullet-size)/2)]",
        "ui-list-bullet:inset-s-[calc(var(--list-marker-center-x)-var(--list-bullet-size)/2+(var(--list-bullet-reach)-var(--list-bullet-size)/2)*var(--list-bullet-end))]",
        "ui-list-bullet:w-(--list-bullet-size) ui-list-bullet:h-(--list-bullet-size)",
        // Paint the translucent edge over the marker surface so the guide
        // cannot show through.
        "ui-list-bullet:bg-linear-to-b",
        "ui-list-bullet:from-(--ak-edge) ui-list-bullet:to-(--ak-edge)",
      ],
      true: [
        "before:hidden",
        "forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
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

/** A line between list markers. The last row draws none. */
export const listItemGuide = cv({
  extend: [layer],
  class: [
    // Keep the guide below markers and disclosure content, so rows in the
    // content and their bars cover it, and above the surfaces of later rows.
    "list-guide absolute pointer-events-none z-1",
    "forced-colors:forced-color-adjust-none forced-colors:[--ak-edge:CanvasText]",
    "[--list-guide-width:calc(var(--list-guide,0)*1px)]",
    // Draw the line with the layer edge, like a disclosure content guide.
    "w-0 border-s-(length:--list-guide-width)",
    // Join marker centers across the row and the gap. Row borders overlap the
    // gap, so they add no length. Clamp negative gaps to zero, as grid layout
    // does.
    "[--list-guide-start:calc(var(--ak-frame-padding)+var(--list-marker-overhang,0px)+0.5lh)]",
    // The guide of a row with a surface starts below the row, so the surface
    // hides the part that runs to its marker.
    "[--list-guide-skip:calc((100%-var(--list-guide-start))*var(--list-row-solid,0))]",
    "top-[calc(var(--list-guide-start)+var(--list-guide-skip))]",
    "inset-s-[calc(var(--ak-frame-padding)+var(--list-marker-box,1lh)/2-var(--list-guide-width)/2)]",
    "h-[calc(100%+max(0px,var(--list-gap))-var(--list-guide-skip))]",
    // A horizontal guide joins the marker centers across the columns.
    "ui-list-horizontal:top-[calc(var(--ak-frame-padding)+var(--list-marker-box,1lh)/2-var(--list-guide-width)/2)]",
    "ui-list-horizontal:inset-s-1/2 ui-list-horizontal:h-0",
    "ui-list-horizontal:w-[calc(100%+max(0px,var(--list-gap)))]",
    "ui-list-horizontal:border-s-0 ui-list-horizontal:border-t-(length:--list-guide-width)",
    // No marker follows the last row.
    "ui-list-last-row:hidden",
  ],
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
    "[--list-disclosure-indent:calc(var(--py)+(var(--px)-var(--py)+var(--list-marker-box,1lh))*var(--list-guide))]",
    // Raise the content over the guide, as the guide of a disclosure content
    // runs under its rows. The child selector outranks the content's own
    // stacking.
    "[&>.disclosure-content]:z-2",
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
    "[--disclosure-ps:calc(var(--px)+var(--list-marker-box,1lh))]",
    // Make room for a marker box taller than one line.
    "pbs-[calc(var(--py)+var(--list-marker-overhang))]",
    "pbe-[calc(var(--py)+var(--list-marker-overhang))]",
    // Hover and press surfaces cover the guide; the marker stays above both.
    "z-3",
    // Put the marker in the padding corner. Label content resets this offset.
    "[--list-marker-offset:var(--ak-frame-padding)]",
  ],
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
