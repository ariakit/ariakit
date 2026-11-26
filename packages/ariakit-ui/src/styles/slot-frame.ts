import type { VariantProps } from "clava";
import { cv } from "clava";
import type { FrameRoundedValue } from "./frame.ts";
import { frame, getFrameRoundedClass } from "./frame.ts";
import { hasLayerBackground, isLayerColor } from "./layer.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

/**
 * A text frame that lays out slots and text in a row. Its gaps and the margins
 * of the slots inside follow its padding and font size. Its corners also count:
 * text at a round end moves in, and a rounder frame makes the `md` side padding
 * as wide as `lg`, so a pill looks as roomy as a square frame. Slots stay where
 * they are. With `$p="none"`, a slot at an edge starts at that edge, like a
 * list bullet, so it lines up with the text around the frame. It has no
 * interactive state, so controls extend it, and so can static elements, such as
 * field errors.
 */
export const slotFrame = cv({
  extend: [textFrame, text],
  class: [
    "ui-slot-frame",
    // Reset stacked-card spacing on nested controls' parts while preserving the
    // element's own inherited alignment.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:[--control-inline:initial]",
  ],
  variants: {
    /**
     * Sets the gap between the element's content and its siblings. Side padding
     * beyond `md`, from `$px` or a round frame, widens the room between a slot
     * that moves into the side padding and the text next to it by the same
     * amount. Text next to text, including text slots, keeps the room that it
     * has with the `md` side padding. Text at a round end moves in, which
     * changes neither room. Text slots read this variant, so set the gap with
     * it, not with a gap class. With `$p="none"`, `md` is `0.4375em`, and the
     * other steps are `0.15em` apart.
     * @default "md"
     */
    $gap: {
      none: "",
      // With padding, sm follows the block padding, and the other steps follow
      // the md side padding. Without padding, the slots have no side margins,
      // so the gap alone keeps them apart from the text.
      sm: [
        "ui-slot-frame--gap-sm",
        // Stays a class, so that the gap of `choiceCard` still comes after it
        // and replaces it.
        "gap-(--gap)",
      ],
      // Keep content apart in rows with little side padding.
      md: [
        "ui-slot-frame--gap-md",
        // Stays a class, so that the gap of `choiceCard` still comes after it
        // and replaces it.
        "gap-(--gap)",
      ],
      lg: [
        "ui-slot-frame--gap-lg",
        // Stays a class, so that the gap of `choiceCard` still comes after it
        // and replaces it.
        "gap-(--gap)",
      ],
      xl: [
        "ui-slot-frame--gap-xl",
        // Stays a class, so that the gap of `choiceCard` still comes after it
        // and replaces it.
        "gap-(--gap)",
      ],
    },
    /**
     * Sets the vertical gap between the element's label and description.
     * @default "auto"
     */
    $gapY: {
      none: "",
      auto: [
        "ui-slot-frame--gap-y-auto",
        // Stays a class to come after the gap of `controlFieldError`, which it
        // replaces.
        "gap-y-(--gap-y)",
      ],
    },
  },
  defaultVariants: {
    $gap: "md",
    $gapY: "auto",
  },
  refine({ variants, addClass }) {
    if (variants.$p === "none") {
      // Mark a row without padding, so its slots start at its edges, like list
      // bullets, and its gaps grow from --flush-gap. Field errors read
      // --flush-gap to match the gap of the field above.
      addClass("ui-slot-frame--flush [--flush-gap:0.4375em]");
    }
    // Forced colors remove the fill, which may be the only boundary.
    if (variants.$border != null) return;
    if (!hasLayerBackground(variants)) return;
    addClass("forced-colors:ak-frame-border");
  },
});

const slotSizeClasses = {
  unset: "",
  xs: "[--size:1ex]",
  sm: "[--size:1cap]",
  md: "[--size:1em]",
  lg: "[--size:0.875lh]",
  xl: "[--size:1lh]",
  "2xl": "[--size:calc(1lh+var(--py)/var(--row-span))]",
  full: "[--size:calc(1lh+var(--py)*2/var(--row-span))]",
};

export type SlotSize = keyof typeof slotSizeClasses;

/** Checks whether a value is a named slot size. */
export function isSlotSize(value: unknown): value is SlotSize {
  if (typeof value !== "string") return false;
  return Object.hasOwn(slotSizeClasses, value);
}

/**
 * Resolves a named slot size so extenders can preserve named values when
 * replacing `$size`.
 */
export function getSlotSizeClass(value: unknown) {
  if (!isSlotSize(value)) return;
  return slotSizeClasses[value];
}

/** Whether a fill or a border draws a box around the content. */
export function hasSlotSurface(variants: VariantProps<typeof frame>) {
  if (hasLayerBackground(variants)) return true;
  return Boolean(variants.$border);
}

const floatingClass = [
  // The rules that find the first and last item of a row skip an element
  // that floats over the frame by this class.
  "ui-slot-frame-floating",
  "m-0! absolute border",
  "in-[.ui-control,.ui-badge]:[--bg-parent:var(--ak-layer-parent)] border-(--bg-parent)",
  // A floating slot hangs over the surface around its parent, so its border
  // takes that color and reads as a cut-out.
  "[.ak-layer>&]:ak-outset",
  // What fills the slot sits inside this border, so a round count stays
  // round. The selector wins over the base --slot-height.
  "[&.ui-slot-frame-slot]:[--slot-height:calc(var(--size)*var(--row-span)-2px)]",
];

// The slot moves out by half its size, not half its width, so the round end of
// a long badge stays on the corner, and the badge grows into the parent. Each
// physical translation reverses in RTL, where the logical inset is on the other
// side.
const floatingCornerClasses = {
  "top-start": [
    "top-0 inset-s-0 -translate-y-1/2",
    "-translate-x-[calc(var(--size)/2)] rtl:translate-x-[calc(var(--size)/2)]",
  ],
  "top-end": [
    "top-0 inset-e-0 -translate-y-1/2",
    "translate-x-[calc(var(--size)/2)] rtl:-translate-x-[calc(var(--size)/2)]",
  ],
  "bottom-start": [
    "bottom-0 inset-s-0 translate-y-1/2",
    "-translate-x-[calc(var(--size)/2)] rtl:translate-x-[calc(var(--size)/2)]",
  ],
  "bottom-end": [
    "bottom-0 inset-e-0 translate-y-1/2",
    "translate-x-[calc(var(--size)/2)] rtl:-translate-x-[calc(var(--size)/2)]",
  ],
};

/**
 * A text-aligned slot in a slot frame for an icon, avatar, badge, thumbnail,
 * keyboard key, or short text. Its margins follow the padding of the frame.
 * Controls extend it, and so can static rows, such as tooltips. An avatar or a
 * badge goes inside a `box` slot.
 */
export const slotFrameSlot = cv({
  extend: [frame],
  class: [
    "ui-slot-frame-slot",
    // Outside a text frame, --px and --py are missing and the slot has no side
    // margin.
    // Stays a class, so that the margin of `ui-combobox-select-arrow` still
    // comes after it and replaces it.
    "mx-(--mx,0px)",
  ],
  variants: {
    /** Sets the slot size. */
    $size: slotSizeClasses,
    /**
     * Sets horizontal spacing around the slot. Named values adjust sibling
     * elements, so wrap adjacent text in a label. `closeGap` reduces the gap;
     * `auto` places the margin on a container-sized slot. Vertical cards remove
     * these margins.
     */
    $mx: {
      // The start margin of the next sibling replaces its own, so it keeps what
      // a next text slot gives back next to another text slot. That value is
      // zero on every other sibling.
      unset: "",
      // Add the far-side overflow of oversized icons to the label gap. Tailwind
      // emits me-* after mx-*, so this margin wins. Stays a class to come after
      // the margin of `controlFieldErrorIcon`, which it replaces.
      auto: "me-[calc(var(--mx)+max(0px,(var(--size,1lh)-1lh)/2)*var(--slot-pull,1)*var(--control-inline,1))]",
      // Stays a class to keep its order with the classes of the elements that
      // it styles.
      closeGap:
        "[&+*]:ms-[calc(var(--text-cut-start,0px)+var(--spacing)*-1*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--spacing)*-1*var(--control-inline,1))]",
      // Stays a class to keep its order with the classes of the elements that
      // it styles.
      xs: "[&+*]:ms-[calc(var(--text-cut-start,0px)+var(--gap-step)*-1*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--gap-step)*-1*var(--control-inline,1))]",
      // Stays a class to keep its order with the classes of the elements that
      // it styles.
      sm: "[&+*]:ms-[calc(var(--text-cut-start,0px)+var(--gap-step)*-1*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--gap-step)*-1*var(--control-inline,1))]",
      md: "",
      lg: "",
      // Stays a class to keep its order with the classes of the elements that
      // it styles.
      xl: "[&+*]:ms-[calc(var(--text-cut-start,0px)+var(--gap-step)*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--gap-step)*var(--control-inline,1))]",
      // Stays a class to keep its order with the classes of the elements that
      // it styles.
      "2xl":
        "[&+*]:ms-[calc(var(--text-cut-start,0px)+var(--py)*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--py)*var(--control-inline,1))]",
      // Stays a class to keep its order with the classes of the elements that
      // it styles.
      full: "[&+*]:ms-[calc(var(--text-cut-start,0px)+1cap*var(--control-inline,1))] [*:has(+&)]:me-[calc(1cap*var(--control-inline,1))]",
    },
    /**
     * Sets the radius from a named step, CSS length, or expression. `auto`
     * stays concentric with the parent frame; `full` keeps a pill shape.
     * `$forceRounded` prevents adjustment of named steps.
     */
    $rounded(value?: FrameRoundedValue | "auto" | (string & {})) {
      if (value === "auto") return "ak-frame-m-(--my)";
      // Restore the pill radius after the frame's concentric adjustment.
      if (value === "full") return "ak-frame-full rounded-full";
      return getFrameRoundedClass(value);
    },
    /**
     * Sets the slot content type. `box` is one line tall and takes the width of
     * what fills it, such as a `Badge`, an `Avatar`, a flat `Kbd`, a keycap, or
     * a select. It sits as far from the side as from the top. `thumbnail` is a
     * bordered 4:3 box that an image or another picture fills. `text`, such as
     * a count or a duration, is one line tall and keeps the side padding of the
     * row text, while other slots move into it. Put plain `Kbd` keys in a
     * `text` slot. A chord can be one `Kbd` or one per key.
     */
    $kind: {
      icon: "",
      box: "",
      thumbnail: [
        "ui-slot-frame-slot--kind-thumbnail",
        // Stays a class to keep its order with the classes of the elements that
        // it styles.
        "*:size-full *:object-cover",
      ],
      // Keep the side padding of the row text, and let nested slots move again.
      // Fit short text, such as a single digit, instead of a line-wide box.
      text: [
        "ui-slot-frame-slot--kind-text",
        // Stays a class to keep its order with the classes of the elements that
        // it styles.
        "*:[--slot-pull:initial]",
        // Adds what the slot gives back next to text to the slot margin. Stays
        // a class to come after the slot margin, which it replaces, and before
        // caller margins.
        "mx-(--mx-inline,var(--mx,0px))",
      ],
    },
    /** Sets the slot to be a square. */
    $square: "aspect-square",
    /**
     * Renders the slot as a floating element on a corner of its parent. It
     * hangs over the corner by half its size, so a square slot is centered on
     * the corner, and a wide badge grows into the parent. `true` is the top
     * corner at the end of the row, the same as `top-end`. `start` and `end`
     * follow the text direction.
     */
    $floating: {
      true: [floatingClass, floatingCornerClasses["top-end"]],
      "top-start": [floatingClass, floatingCornerClasses["top-start"]],
      "top-end": [floatingClass, floatingCornerClasses["top-end"]],
      "bottom-start": [floatingClass, floatingCornerClasses["bottom-start"]],
      "bottom-end": [floatingClass, floatingCornerClasses["bottom-end"]],
    },
    /**
     * Scales the slot height by the number of text rows. Use `1` to align with
     * the first row.
     */
    $rowSpan(value?: number) {
      if (value == null) return;
      return {
        style: { "--row-span": `${value}` },
      };
    },
  },
  defaultVariants: {
    $kind: "icon",
    $size(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A picture needs at least a line of height to be legible.
      if (variants.$kind === "thumbnail") return "xl";
      // Text takes a line of height, so it centers on the first label line.
      if (variants.$kind === "text") return "xl";
      // A box takes a line of height, so what fills it centers on the first
      // label line.
      if (variants.$kind === "box") return "xl";
      return "md";
    },
    $border(defaultValue, variants) {
      if (variants.$kind !== "thumbnail") return defaultValue;
      // The picture can share the row's color, so an edge marks its box.
      return defaultValue ?? true;
    },
    $layer(defaultValue, variants) {
      // Replace only frame's transparent default; preserve explicit colors.
      if (defaultValue !== "transparent") return defaultValue;
      // A floating slot paints its own surface.
      if (variants.$floating) return true;
      return defaultValue;
    },
    $rounded(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$floating) return "full";
      return "auto";
    },
    $rowSpan: 1,
    $mx(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      // A floating slot is out of the row, so it doesn't move the text next to
      // it. A centered label then stays centered.
      if (variants.$floating) return "md";
      // A picture already reads as a separate box, so it keeps the default
      // label gap at any size.
      if (variants.$kind === "thumbnail") return "md";
      // Text, such as plain keys, has the side bearings of its glyphs, so it
      // also keeps the default label gap. The extra margin of line-tall slots
      // makes up for the side bearings that a box has none of.
      if (variants.$kind === "text") return "md";
      return variants.$size;
    },
    $square(defaultValue, variants) {
      if (variants.$kind === "icon") return defaultValue ?? true;
      return defaultValue;
    },
  },
  refine({ variants, addClass }) {
    // A group of controls takes the slot height, like a single control. Its
    // controls get the padding that makes them as tall as the slot, less the
    // padding and border of the group and their own borders. Their side padding
    // follows, so an icon-only control stays square. A control without padding,
    // such as one that an avatar fills, gets none. An unset size leaves the
    // slot height unknown, so the controls keep their size. Extenders add
    // sizes, such as `auto` and numbers, so this tests for `unset` instead of
    // adding the classes to each size.
    if (variants.$size !== "unset") {
      addClass([
        "[&>.ui-control-group]:[--slot-control-height:calc(var(--slot-height)-(var(--ak-frame-padding)+var(--ak-frame-border))*2)]",
        "[&>.ui-control-group>.ui-control:not(.ui-slot-frame--flush)]:ak-frame-p-[max(0px,calc((var(--slot-control-height)-1lh)/2-var(--ak-frame-border)))]",
      ]);
    }
    if (variants.$kind !== "icon") return;
    // A floating slot paints its own surface by default, like a slot with a
    // color.
    const painted =
      isLayerColor(variants.$layer) ||
      (!!variants.$floating && hasLayerBackground(variants));
    if (!painted) return;
    // Multi-row slots already have extra space.
    if (variants.$rowSpan !== 1) return;
    // Inset icons on painted tiles.
    addClass("[--slot-icon-scale:0.6]");
  },
});

/**
 * Uses the container's `auto` icon size when the slot keeps its default `md`
 * size. Other slot kinds retain their normal sizes.
 */
export function getIconSlotSize<Size extends string>(
  defaultValue: Size | undefined,
  variants: { $kind?: string },
) {
  if (variants.$kind !== "icon") return defaultValue;
  // Preserve any size supplied by an extender.
  if (defaultValue !== "md") return defaultValue;
  return "auto" as const;
}

/**
 * The text parts of a slot frame row, such as a label and a description. It
 * fills the free space in the row and spaces its parts with the gaps of the
 * frame. Controls extend it, and so can static rows, such as dialog headers.
 */
export const slotFrameContent = cv({
  class: "ui-slot-frame-content gap-x-(--gap-text,var(--gap)) gap-y-(--gap-y)",
  variants: {
    /**
     * Arranges the parts in a row or column. `unset` omits layout styles.
     */
    $orientation: {
      unset: "",
      horizontal: "ui-slot-frame-content--orientation-horizontal flex-wrap",
      vertical: "flex flex-col",
    },
  },
  defaultVariants: {
    $orientation: "vertical",
  },
});

/**
 * Text in a slot frame row, such as a label. Controls extend it, and static
 * rows, such as badges, use it directly.
 */
export const slotFrameText = cv({
  extend: [text],
  variants: {
    /** Truncates the text to one line with an ellipsis. */
    $truncate: "truncate",
    /**
     * Fills the free space in its row, so the slots after it sit together at
     * the row end.
     */
    // A grown label starts its text, also in a button, which centers it.
    $grow: "ui-slot-frame-text--grow",
    /**
     * Shows the text from a size of the nearest size container up. Below that
     * size, the text is visually hidden, but it still names its control for
     * screen readers. `true` shows it at every width, and `false` hides it at
     * every width. Outside a size container, the text shows at every width.
     * Text slots read this variant to set the room next to the text, so hide
     * labels with it, not with classes.
     * @default true
     */
    $show: {
      true: "",
      false: "ui-slot-frame-text--show-false",
      xs: "ui-slot-frame-text--show-xs",
      sm: "ui-slot-frame-text--show-sm",
      md: "ui-slot-frame-text--show-md",
      lg: "ui-slot-frame-text--show-lg",
    },
  },
  defaultVariants: { $show: true },
});
