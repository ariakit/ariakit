import type { VariantProps } from "clava";
import { cv } from "clava";
import { includes } from "../utils/includes.ts";
import type { FrameRoundedValue } from "./frame.ts";
import { frame, getFrameRoundedClass } from "./frame.ts";
import { hasLayerBackground, isLayerColor } from "./layer.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

/**
 * The `$size` variant of slot frames and control groups. It sets the font size
 * that their padding, gaps, and slots scale with.
 */
export const fontSizeVariants = {
  /**
   * Sets the font size used by padding, gaps, and icons. `auto` inherits the
   * parent font size.
   * @default "auto"
   */
  $size: {
    auto: "",
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  },
};

/**
 * A text frame that lays out slots and text in a row. Its gaps and the margins
 * of the slots inside follow its padding and font size. With `$p="none"`, a
 * slot at an edge starts at that edge, like a list bullet, so it lines up with
 * the text around the frame. It has no interactive state, so controls extend
 * it, and so can static elements, such as field errors.
 */
export const slotFrame = cv({
  extend: [textFrame, text],
  class: [
    "flex",
    // Subtract glyph side bearings from gaps for optical text alignment.
    "[--sidebearing:0.15em]",
    // Reset stacked-card spacing on nested controls' parts while preserving the
    // element's own inherited alignment.
    "*:[--control-inline:initial]",
  ],
  variants: {
    ...fontSizeVariants,
    /**
     * Sets the gap between the element's content and its siblings. With
     * `$p="none"`, `md` is `0.4375em`, and the other steps are a side bearing
     * apart.
     * @default "md"
     */
    $gap: {
      none: "",
      // With padding, sm follows the block padding, and the other steps follow
      // the side padding. Without padding, the slots have no side margins, so
      // the gap alone keeps them apart from the text.
      sm: "[--gap:var(--py)] [&.slot-frame-flush]:[--gap:calc(var(--flush-gap)-var(--sidebearing))] gap-(--gap)",
      // Keep content apart in rows with little side padding.
      md: "[--gap:max(var(--spacing),calc(var(--px)-var(--sidebearing)))] [&.slot-frame-flush]:[--gap:var(--flush-gap)] gap-(--gap)",
      lg: "[--gap:max(var(--spacing),var(--px))] [&.slot-frame-flush]:[--gap:calc(var(--flush-gap)+var(--sidebearing))] gap-(--gap)",
      xl: "[--gap:max(var(--spacing),calc(var(--px)+var(--sidebearing)))] [&.slot-frame-flush]:[--gap:calc(var(--flush-gap)+var(--sidebearing)*2)] gap-(--gap)",
    },
    /**
     * Sets the vertical gap between the element's label and description.
     * @default "auto"
     */
    $gapY: {
      none: "",
      auto: "[--gap-y:calc(var(--gap)/4)] gap-y-(--gap-y)",
    },
  },
  defaultVariants: {
    $size: "auto",
    $gap: "md",
    $gapY: "auto",
  },
  refine({ variants, addClass }) {
    if (variants.$p === "none") {
      // Mark a row without padding, so its slots start at its edges, like list
      // bullets, and its gaps grow from --flush-gap. Field errors read
      // --flush-gap to match the gap of the field above.
      addClass("slot-frame-flush [--flush-gap:0.4375em]");
    }
    // Forced colors remove the fill, which may be the only boundary.
    if (variants.$border != null) return;
    if (!hasLayerBackground(variants)) return;
    addClass("forced-colors:ak-frame-border");
  },
});

// Single-row badges and avatars need extra content space; multi-row slots keep
// their requested size.
const PADDED_SLOT_SIZES = ["xs", "sm", "md", "lg"] as const;

const SLOT_SIZE_CLASSES = {
  unset: "",
  xs: "[--size:1ex]",
  sm: "[--size:1cap]",
  md: "[--size:1em]",
  lg: "[--size:0.875lh]",
  xl: "[--size:1lh]",
  "2xl": "[--size:calc(1lh+var(--py)/var(--row-span))]",
  full: "[--size:calc(1lh+var(--py)*2/var(--row-span))]",
};

export type SlotSize = keyof typeof SLOT_SIZE_CLASSES;

/** Checks whether a value is a named slot size. */
export function isSlotSize(value: unknown): value is SlotSize {
  if (typeof value !== "string") return false;
  return Object.hasOwn(SLOT_SIZE_CLASSES, value);
}

/**
 * Resolves a named slot size so extenders can preserve named values when
 * replacing `$size`.
 */
export function getSlotSizeClass(value: unknown) {
  if (!isSlotSize(value)) return;
  return SLOT_SIZE_CLASSES[value];
}

/** Whether a fill or a border draws a box around the content. */
export function hasSlotSurface(variants: VariantProps<typeof frame>) {
  if (hasLayerBackground(variants)) return true;
  return Boolean(variants.$border);
}

/** Whether the slot kind is a badge or an avatar. */
function isBadgeOrAvatar(kind?: string) {
  return kind === "badge" || kind === "avatar";
}

/**
 * A text-aligned slot in a slot frame for an icon, avatar, badge, thumbnail,
 * keyboard key, or short text. Its margins follow the padding of the frame.
 * Controls extend it, and so can static rows, such as tooltips.
 */
export const slotFrameSlot = cv({
  extend: [frame],
  class: [
    "slot-frame-slot flex flex-none items-center justify-center",
    // Align slots to the first text row. Stacked cards set --control-inline to
    // zero to remove these margins. Slots move into the side padding, so an
    // icon sits as far from the side as from the top; text slots set
    // --slot-pull to zero to keep the text inset.
    "[--my:calc((1lh-var(--size,1lh))/2*var(--row-span)*var(--control-inline,1))]",
    "[--mx:calc((var(--py)-var(--px)+var(--my))*var(--slot-pull,1)*var(--control-inline,1))]",
    // A slot frame without padding has no edge to show that distance, so a
    // slot starts at its edge, like a list bullet. A control inside the slot
    // moves its own slots again, like in a text slot.
    "[.slot-frame-flush>&]:[--slot-pull:0] [.slot-frame-flush>&>*]:[--slot-pull:initial]",
    "min-w-(--size) h-[calc(var(--size)*var(--row-span))]",
    // Publish the resolved height for flat keys and keycaps that fill the
    // slot.
    "[--slot-height:calc(var(--size)*var(--row-span))]",
    // Custom marks set --slot-icon-size; painted icon slots use
    // --slot-icon-scale.
    "[&>svg]:block [&>svg]:size-(--slot-icon-size,calc(var(--size)*var(--slot-icon-scale,1)))",
    // A nested button or select fills the slot like a picture does, so the
    // slot size sets its height and the gaps around it stay even. Its content
    // stays centered when its own padding is taller. Badges keep their size.
    "[&>:is(button,a).control]:size-full [&>:is(button,a).control]:items-center",
    // Outside a text frame, --px and --py are missing and the slot has no side
    // margin.
    "mx-(--mx,0px) my-(--my)",
    // Keep separate keys of a chord left to right, with a gap between them
    // that a caller gap class can replace.
    "[:where(&:has(>kbd+kbd))]:gap-[0.25em] [&:has(>kbd+kbd):dir(rtl)]:flex-row-reverse",
  ],
  variants: {
    /** Sets the slot size. */
    $size: SLOT_SIZE_CLASSES,
    /**
     * Sets horizontal spacing around the slot. Named values adjust sibling
     * elements, so wrap adjacent text in a label. `closeGap` reduces the gap;
     * `auto` places the margin on a container-sized slot. Vertical cards remove
     * these margins.
     */
    $mx: {
      unset: "",
      // Add the far-side overflow of oversized icons to the label gap. Tailwind
      // emits me-* after mx-*, so this margin wins.
      auto: "me-[calc(var(--mx)+max(0px,(var(--size,1lh)-1lh)/2)*var(--slot-pull,1)*var(--control-inline,1))]",
      closeGap:
        "[&+*]:ms-[calc(var(--spacing)*-1*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--spacing)*-1*var(--control-inline,1))]",
      xs: "[&+*]:ms-[calc(var(--sidebearing)*-1*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--sidebearing)*-1*var(--control-inline,1))]",
      sm: "[&+*]:ms-[calc(var(--sidebearing)*-1*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--sidebearing)*-1*var(--control-inline,1))]",
      md: "",
      lg: "",
      xl: "[&+*]:ms-[calc(var(--sidebearing)*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--sidebearing)*var(--control-inline,1))]",
      "2xl":
        "[&+*]:ms-[calc(var(--py)*var(--control-inline,1))] [*:has(+&)]:me-[calc(var(--py)*var(--control-inline,1))]",
      full: "[&+*]:ms-[calc(1cap*var(--control-inline,1))] [*:has(+&)]:me-[calc(1cap*var(--control-inline,1))]",
    },
    /** Sets the slot padding. */
    $p: {
      unset: "",
      // Match badge padding after scaling its text to 0.8125em, using 0.75 of
      // the capital-height spacing.
      auto: "px-[max(0px,calc((var(--size)-1lh*0.8125)/2+(1lh-1cap)*0.8125*0.75))]",
      xs: "px-[calc(var(--size)*0.05)]",
      sm: "px-[calc(var(--size)*0.1)]",
      md: "px-[calc(var(--size)*0.15)]",
      lg: "px-[calc(var(--size)*0.15)]",
      xl: "px-[calc(var(--size)*0.2)]",
      "2xl": "px-[calc(var(--size)*0.25)]",
      full: "px-[calc(var(--size)*0.25)]",
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
     * Sets the slot content type. `badge` needs one child wrapper; slot
     * components create it automatically. For badge truncation, use a
     * width-limited child with `block overflow-x-clip text-ellipsis
     * whitespace-nowrap` to preserve descenders. `thumbnail` is a bordered 4:3
     * box that an image or another picture fills. `text`, such as a count or a
     * duration, is one line tall and keeps the side padding of the row text,
     * while other slots move into it. Put plain `Kbd` keys in a `text` slot,
     * and flat keys or keycaps in an `icon` slot with `$square={false}`. A
     * chord can be one `Kbd` or one per key.
     */
    $kind: {
      icon: "",
      thumbnail: "overflow-clip aspect-4/3 *:size-full *:object-cover",
      avatar: "overflow-clip",
      // Keep the side padding of the row text, and let nested slots move again.
      // Fit short text, such as a single digit, instead of a line-wide box.
      // Tailwind sorts min-width utilities by name, so min-w-0 follows the base
      // min-w-(--size). Number, keyword, and bracket min-w-* classes still
      // override it; min-w-(--var) classes sort earlier and do not.
      text: "[--slot-pull:0] *:[--slot-pull:initial] min-w-0",
      // Trim browser-dependent line metrics to center the badge's capitals.
      // https://github.com/ariakit/ariakit/issues/7588
      badge: "*:text-[0.8125em] *:[text-box:cap_alphabetic]",
    },
    /** Sets the slot to be a square. */
    $square: "aspect-square",
    /**
     * Renders the slot as a floating element on the top corner at the end of
     * the row.
     */
    $floating: [
      "m-0! absolute top-0 inset-e-0 -translate-y-1/2 border",
      // Reverse the physical translation for the opposite RTL corner.
      "translate-x-[calc(var(--size)/2)] rtl:-translate-x-[calc(var(--size)/2)]",
      "in-[.control,.badge]:[--bg-parent:var(--ak-layer-parent)] border-(--bg-parent)",
    ],
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
      // Badges, avatars, and floating slots paint their own surface.
      if (variants.$kind === "badge") return "brand";
      if (variants.$kind === "avatar") return true;
      if (variants.$floating) return true;
      return defaultValue;
    },
    $lightnessOffset(defaultValue, variants) {
      if (variants.$kind !== "avatar") return defaultValue;
      return defaultValue ?? true;
    },
    $rounded(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$floating) return "full";
      if (variants.$kind === "avatar") return "full";
      // Concentric rounding can collapse a badge's radius at default control
      // padding.
      if (variants.$kind === "badge") return "full";
      return "auto";
    },
    $p(defaultValue, variants) {
      // Pad badge text only; avatar images must fill the clipped shape.
      if (variants.$kind === "badge") {
        return defaultValue ?? "auto";
      }
      return defaultValue ?? "unset";
    },
    $rowSpan: 1,
    $mx(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
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
      if (variants.$kind === "avatar") return defaultValue ?? true;
      return defaultValue;
    },
    $edge(defaultValue, variants) {
      if (variants.$kind !== "badge") return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      return defaultValue ?? variants.$layer;
    },
    $edgeHue(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$kind !== "badge") return defaultValue;
      if (!isLayerColor(variants.$layer)) return defaultValue;
      // Copy the layer hue unless the caller chose a different edge color. The
      // computed $edge may not be resolved yet.
      if (variants.$edge != null && variants.$edge !== variants.$layer) {
        return defaultValue;
      }
      return variants.$hue;
    },
  },
  refine({ variants, setVariants, addClass }) {
    const paintsIcon =
      variants.$kind === "icon" && isLayerColor(variants.$layer);
    if (paintsIcon && variants.$rowSpan === 1) {
      // Inset icons on painted tiles; multi-row slots already have extra space.
      addClass("[--slot-icon-scale:0.6]");
    }
    if (!isBadgeOrAvatar(variants.$kind)) return;
    // Forced colors remove the slot's fill, which may be its only boundary.
    if (variants.$border == null && hasLayerBackground(variants)) {
      addClass("forced-colors:ak-frame-border");
    }
    if (variants.$rowSpan !== 1) return;
    if (variants.$kind === "avatar") {
      if (variants.$size === "2xl") return;
      if (variants.$size === "full") return;
      addClass([
        // Preserve line height and set initials' capital height to 0.3 times
        // the slot size. tan(atan2(a,b)) divides lengths where Firefox calc()
        // cannot.
        "leading-[1lh] [font-size-adjust:cap-height_calc(0.3*tan(atan2(var(--size,1lh),1em)))]",
        // Use the frame's measured inset so the adjusted font does not change
        // margins.
        "[--px:calc(var(--py)+var(--text-frame-inset))]",
      ]);
    }
    if (includes(PADDED_SLOT_SIZES, variants.$size)) {
      setVariants({ $size: "xl" });
    }
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

/** Whether the slot needs one child wrapper for badge typography. */
export function wrapsSlotChildren(kind?: string) {
  return kind === "badge";
}

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
    $grow: "grow text-start",
  },
});
