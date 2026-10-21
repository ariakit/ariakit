import { cv, cx } from "clava";
import { includes } from "../utils/includes.ts";
import { getSpacingValue } from "../utils/styles.ts";
import type { FrameRoundedValue } from "./frame.ts";
import { frame, getFrameRoundedClass } from "./frame.ts";
import { hasLayerBackground, isLayerColor, layer } from "./layer.ts";
import { textFrame } from "./text-frame.ts";
import { text } from "./text.ts";

// Controls and groups share font-relative sizing; textFrame supplies --px and
// --py.
const fontSizeVariants = {
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

/** Shared layout, text spacing, and disabled styles for controls. */
export const control = cv({
  extend: [textFrame, text],
  class: [
    "control ak-frame-join-item group/control relative flex justify-center",
    "ui-hover:ak-frame-join-active ui-selected:ak-frame-join-active ui-focus-visible:ak-frame-join-active",
    // Subtract glyph side bearings from gaps for optical text alignment.
    "[--sidebearing:0.15em]",
    // Reset stacked-card spacing on nested controls' parts while preserving the
    // control's own inherited alignment.
    "[&>*]:[--control-inline:initial]",
    // Bars measure from the border edge, but frame borders do not inherit.
    "[--control-border:var(--ak-frame-border)]",
  ],
  variants: {
    ...fontSizeVariants,
    /**
     * Sets the gap between the element's content and its siblings.
     * @default "md"
     */
    $gap: {
      none: "",
      sm: "[--gap:var(--py)] gap-(--gap)",
      md: "[--gap:calc(var(--px)-var(--sidebearing))] gap-(--gap)",
      lg: "[--gap:var(--px)] gap-(--gap)",
      xl: "[--gap:calc(var(--px)+var(--sidebearing))] gap-(--gap)",
    },
    /**
     * Sets the vertical gap between the element's label and description.
     * @default "auto"
     */
    $gapY: {
      none: "",
      auto: "[--gap-y:calc(var(--gap)/4)] gap-y-(--gap-y)",
    },
    /** Sets the element’s disabled state. */
    $disabled: [
      "disabled ak-disabled cursor-not-allowed!",
      // Cards can retain a faint disabled edge through --disabled-border.
      "border-(--disabled-border,transparent)! ring-(--disabled-border,transparent)!",
      "inset-shadow-none! shadow-none!",
      "bg-none! ak-ink-0! *:ak-ink-0!",
      // An adaptive text color targets nested text and icons directly, so set
      // the ink on the same targets. Skip forced colors: this rule would
      // override the system disabled color on nested text.
      "not-forced-colors:ui-text:ak-ink-0!",
      // Forced colors replace the ink with the normal text color. Use the
      // system disabled color, also on descendants that set their own color.
      "forced-colors:text-[GrayText]! forced-colors:**:text-[GrayText]!",
      "forced-colors:border-[GrayText]!",
    ],
  },
  defaultVariants: {
    $size: "auto",
    $rounded: "md",
    $gap: "md",
    $gapY: "auto",
    $p: 2,
  },
  refine({ variants, setVariants, addClass }) {
    // Forced colors remove a control's fill, which may be its only boundary.
    if (variants.$border == null && hasLayerBackground(variants)) {
      addClass("forced-colors:ak-frame-border");
    }
    if (!variants.$disabled) return;
    setVariants({ $invert: false });
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

/**
 * A text-aligned slot for an icon, avatar, badge, keyboard shortcut, or short
 * text.
 */
export const controlSlot = cv({
  extend: [frame],
  class: [
    "control-slot flex flex-none items-center justify-center",
    // Align slots to the first text row. Stacked cards set --control-inline to
    // zero to remove these margins. Slots move into the side padding, so an
    // icon sits as far from the side as from the top; text slots set
    // --slot-pull to zero to keep the text inset.
    "[--my:calc((1lh-var(--size,1lh))/2*var(--row-span)*var(--control-inline,1))]",
    "[--mx:calc(((var(--py)-var(--px))*var(--slot-pull,1)+var(--my))*var(--control-inline,1))]",
    "min-w-(--size) h-[calc(var(--size)*var(--row-span))]",
    // Custom marks set --slot-icon-size; painted icon slots use
    // --slot-icon-scale.
    "[&>svg]:block [&>svg]:size-(--slot-icon-size,calc(var(--size)*var(--slot-icon-scale,1)))",
    "mx-(--mx) my-(--my)",
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
      auto: "me-[calc(var(--mx)+max(0px,(var(--size,1lh)-1lh)/2)*var(--control-inline,1))]",
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
     * Sets the slot content type. `badge` and `shortcut` need one child
     * wrapper; slot components create it automatically. For badge truncation,
     * use a width-limited child with `block overflow-x-clip text-ellipsis
     * whitespace-nowrap` to preserve descenders. `thumbnail` is a bordered 4:3
     * box that an image or another picture fills. `text`, such as a count or a
     * duration, is one line tall and keeps the side padding of the row text,
     * while other slots move into it.
     */
    $kind: {
      icon: "",
      thumbnail: "overflow-clip aspect-4/3 *:size-full *:object-cover",
      shortcut: [
        // Keep key chords left-to-right while the slot retains the row
        // direction for margins.
        "*:flex *:[align-items:inherit] *:[gap:inherit] *:[direction:ltr]",
        "*:[&>svg]:block *:[&>svg]:size-(--slot-icon-size,calc(var(--size)*var(--slot-icon-scale,1)))",
      ],
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
      "in-[.control]:[--bg-parent:var(--ak-layer-parent)] border-(--bg-parent)",
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
    $ink(defaultValue, variants) {
      if (variants.$kind !== "shortcut") return defaultValue;
      return defaultValue ?? 60;
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
    const paintsSurface =
      variants.$kind === "badge" || variants.$kind === "avatar";
    if (!paintsSurface) return;
    // Forced colors remove the slot's fill, which may be its only boundary.
    if (variants.$border == null && hasLayerBackground(variants)) {
      addClass("forced-colors:ak-frame-border");
    }
    addClass([
      // Mix the disabled surface before calculating readable text contrast.
      "group-[.disabled]/control:ak-layer-mix-20",
      // DOM disabled state can change without rerendering the recipe.
      "group-ui-disabled/control:ak-layer-mix-20",
      "group-ui-disabled-within/choice:ak-layer-mix-20",
      // Reach slots below wrappers beyond the control's direct-child text
      // rules.
      "group-[.disabled]/control:ak-ink-0",
      "group-ui-disabled/control:ak-ink-0",
      "group-ui-disabled-within/choice:ak-ink-0",
      // Fade image pixels only; fading the whole slot would reduce text
      // contrast.
      "group-[.disabled]/control:[&_img]:opacity-50",
      "group-ui-disabled/control:[&_img]:opacity-50",
      "group-ui-disabled-within/choice:[&_img]:opacity-50",
    ]);
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

/**
 * Whether the slot needs one child wrapper for badge typography or
 * left-to-right shortcuts.
 */
export function wrapsSlotChildren(kind?: string) {
  return kind === "badge" || kind === "shortcut";
}

/** A flexible wrapper for a control's label and description. */
export const controlContent = cv({
  class: [
    "control-content group/control-content",
    "flex-1 min-w-0 content-start text-start gap-x-(--gap) gap-y-(--gap-y)",
  ],
  variants: {
    /**
     * Arranges the label and description in a row or column. `unset` omits
     * layout styles.
     */
    $orientation: {
      unset: "",
      horizontal: "flex flex-wrap items-baseline",
      vertical: "flex flex-col",
    },
  },
  defaultVariants: {
    $orientation: "vertical",
  },
});

/** Control label text with optional single-line truncation. */
export const controlLabel = cv({
  extend: [text],
  class: [
    // Content already fills the row, so a description stays beside or below
    // the label text.
    "group-[.flex-col]/control-content:flex-none group-[.flex-wrap]/control-content:grow-0",
    "group-[.disabled]/control:ak-ink-0",
  ],
  variants: {
    /** Truncates the label to one line with an ellipsis. */
    $truncate: "truncate",
    /**
     * Fills the free space in its row, so the slots after it sit together at
     * the row end. Row labels such as navigation and disclosure labels do this
     * by default.
     */
    $grow: "grow text-start",
  },
});

/** Secondary control text with optional truncation or line limits. */
export const controlDescription = cv({
  extend: [text],
  class: [
    // Let active.ts reduce press depth for controls with descriptions.
    "control-description",
    // Remove sibling slot margins that would indent a full-width description.
    "ms-0!",
    // Use a full row unless horizontal content has room beside the label.
    "ak-ink-70 basis-full group-[.flex-wrap]/control-content:basis-auto",
    "font-normal text-[0.875em]",
    "group-[.disabled]/control:ak-ink-0",
  ],
  variants: {
    /** Truncates the description to one line with an ellipsis. */
    $truncate: "truncate",
    /**
     * Limits the description to this number of lines. `false` removes a default
     * limit.
     */
    $lineClamp(value?: number | false) {
      if (!value) return;
      return {
        style: { "--line-clamp": `${value}` },
        class: "line-clamp-(--line-clamp)",
      };
    },
  },
});

// Reduce opacity as stroke width grows. Chevrons need a stronger edge; both
// formulas stay positive across the supported widths.
const separatorEdge = cx(
  "ak-edge-alpha-[calc((24-var(--width)*6)/100)]",
  "[.chevron]:ak-edge-alpha-[calc((64-var(--width)*12)/100)]",
);

/** A line, slash, or chevron between horizontal controls. */
export const controlSeparator = cv({
  extend: [layer],
  class: [
    "[.vertical>&]:hidden",
    // Resolve the separator edge against a layer without painting a background.
    "bg-transparent flex items-center justify-center pointer-events-none",
    "transition-[border-color] duration-200 ease-out",
    "[--border-width:calc(var(--width)*1px)]",
    "h-(--size) border-e-(length:--border-width) -mx-[calc((var(--ak-frame-padding,0px)+var(--border-width))/2)]",
  ],
  variants: {
    /** Sets the separator shape: a line, slash, or chevron. */
    $kind: {
      pipe: "rounded-full",
      slash: "rounded-full -skew-15",
      chevron: [
        "chevron rounded-se-xs [--border-width:calc(var(--width)*2px)]! border-t-(length:--border-width)",
        // Reverse the chevron rotation and optical offset in RTL rows.
        "aspect-square scale-50 rotate-45 rtl:-rotate-45",
        "-translate-x-1/10 rtl:translate-x-1/10",
      ],
    },
    /**
     * Sets the separator height. `lg` fills the row; `full` also covers group
     * padding. Chevrons use `md` for both.
     */
    $size: {
      xs: ["[--size:1cap] self-center", separatorEdge],
      sm: ["[--size:1em] self-center", separatorEdge],
      md: ["[--size:1lh] self-center", separatorEdge],
      lg: "self-stretch",
      full: "self-stretch -my-(--ak-frame-padding,0px) mx-0",
    },
    /**
     * Hides the separator beside hovered, selected, or keyboard-focused
     * controls.
     */
    $shy: [
      "in-[.control-group:hover:not(:has(:hover))]:delay-150",
      "ui-adjacent-hover:border-transparent",
      "ui-adjacent-selected:border-transparent",
      "ui-adjacent-focus-visible:border-transparent",
    ],
    /** Sets the separator's visual stroke width in pixels. */
    $width: {
      1: "[--width:1]",
      2: "[--width:2]",
      3: "[--width:3]",
    },
  },
  defaultVariants: {
    // Pin the edge color to the surrounding surface.
    $lightnessOffset: 0,
    $size: "md",
    $width: 1,
    $kind: "pipe",
    $shy(defaultValue, variants) {
      if (variants.$kind === "chevron") return defaultValue;
      if (variants.$size === "full") return defaultValue;
      return defaultValue ?? true;
    },
  },
  refine({ variants, setVariants }) {
    if (variants.$kind !== "chevron") return;
    if (variants.$size !== "lg" && variants.$size !== "full") return;
    setVariants({ $size: "md" });
  },
});

/**
 * The offset from a bar's control to the bar's near edge. Bars read the
 * distance from their control to the group's padding edge from `--bar-gap`.
 */
export type BarOffset = "halfway" | "edge" | (string & {}) | number;

const NAMED_BAR_OFFSETS = {
  halfway: "[--bar-offset:calc((var(--bar-gap)-var(--bar))/2)]",
  edge: "[--bar-offset:calc(var(--bar-gap)-var(--bar))]",
};

/** Checks whether a bar offset is `halfway` or `edge`. */
export function isNamedBarOffset(
  value: unknown,
): value is keyof typeof NAMED_BAR_OFFSETS {
  if (typeof value !== "string") return false;
  return Object.hasOwn(NAMED_BAR_OFFSETS, value);
}

/** Resolves a named bar offset into its `--bar-offset` class. */
export function getNamedBarOffsetClass(value: keyof typeof NAMED_BAR_OFFSETS) {
  return NAMED_BAR_OFFSETS[value];
}

/** Resolves a named or spacing bar offset into `--bar-offset`. */
export function getBarOffset(value?: BarOffset) {
  if (value == null) return;
  if (isNamedBarOffset(value)) return getNamedBarOffsetClass(value);
  return { style: { "--bar-offset": getSpacingValue(value) } };
}

/** Shared painting and visibility for bars inside selected controls. */
export const barBase = cv({
  extend: [layer],
  class: [
    "control-bar absolute pointer-events-none rounded-xs",
    // Slot margin rules reach the next sibling; keep the bar on its insets.
    "m-0!",
    // Show the bar only while its control is checked, selected, or current.
    "hidden group-ui-selected/control:block",
    // A group that sets --bar-transition-name lets view transitions move its
    // bar between items. Hidden bars aren't captured, so the name stays unique.
    "[view-transition-name:var(--bar-transition-name,none)] [view-transition-class:bar]",
    // A fixed width keeps the bar the same at every text size. Normalize the
    // 0–100 contrast scale so high contrast adds only 20%.
    "[--bar:calc(var(--bar-width,2px)*(1+0.2*var(--contrast,0)/100))]",
    // Forced colors would repaint the fill with the canvas color.
    "forced-colors:forced-color-adjust-none forced-colors:bg-[CanvasText]",
  ],
  variants: {
    /**
     * Sets the bar thickness. Numbers are pixels; other values are CSS lengths.
     * High contrast adds 20%. Defaults to 2px.
     */
    $width(value?: number | (string & {})) {
      if (value == null) return;
      const width = typeof value === "number" ? `${value}px` : value;
      return { style: { "--bar-width": width } };
    },
    /**
     * Sets the bar length along its control. `full` spans the control. `auto`
     * is shorter by the control's corner radius, half at each end, so rounder
     * controls get shorter bars.
     */
    $length: {
      full: "[--bar-inset:0px]",
      // Browsers clamp a rendered corner to half the control's shorter side,
      // which is about one line plus its padding.
      auto: "[--bar-inset:min(var(--ak-frame-radius)/2,calc((1lh+var(--py,0px)*2)/4),25%)]",
    },
  },
  defaultVariants: {
    $length: "auto",
    // Contrast with the surrounding surface instead of painting a cover.
    $layer: "transparent",
    $invert: true,
    $contrast: true,
  },
});

/**
 * A thin bar that marks a checked, selected, or current control. Render it as
 * the control's last child. Horizontal groups draw it below or above the
 * control; vertical groups draw it at the control's inline end or start.
 */
export const controlBar = cv({
  extend: [barBase],
  class: [
    "[--bar-gap:var(--control-bar-gap,0px)]",
    "inset-s-(--bar-inset) inset-e-(--bar-inset) h-(--bar)",
    "[.vertical>.control>&]:top-(--bar-inset) [.vertical>.control>&]:bottom-(--bar-inset)",
    "[.vertical>.control>&]:h-auto [.vertical>.control>&]:w-(--bar)",
  ],
  variants: {
    /** Places the bar after or before its control on the group's cross axis. */
    $side: {
      end: [
        "top-[calc(100%+var(--control-border,0px)+var(--bar-offset))]",
        "[.vertical>.control>&]:inset-e-auto",
        "[.vertical>.control>&]:inset-s-[calc(100%+var(--control-border,0px)+var(--bar-offset))]",
      ],
      start: [
        "bottom-[calc(100%+var(--control-border,0px)+var(--bar-offset))]",
        "[.vertical>.control>&]:inset-s-auto",
        "[.vertical>.control>&]:inset-e-[calc(100%+var(--control-border,0px)+var(--bar-offset))]",
      ],
    },
    /**
     * Sets the gap from the control to the bar. `edge` puts the bar on the
     * group's padding edge, over the control when the padding is thinner than
     * the bar. `halfway` centers it between the control and that edge. Numbers
     * scale the spacing token, so `0` puts the bar against the control; other
     * strings are CSS lengths and can be negative for overlap. Defaults to
     * `edge`.
     */
    $offset: getBarOffset,
  },
  defaultVariants: {
    $side: "end",
    $offset: "edge",
  },
});

/** A control group with shared spacing and optional joined edges. */
export const controlGroup = cv({
  extend: [frame],
  class: [
    // Bars inside the controls reach the group's padding edge.
    "control-group [--control-bar-gap:var(--ak-frame-padding)]",
    // Forced colors remove the selected surface, which may be the only mark of
    // the checked control, so it keeps an edge. A control with an edge keeps
    // its own width.
    "[&>.control]:ui-selected:forced-colors:ak-frame-border-[length:max(1px,var(--border-width,1px))]",
  ],
  variants: {
    ...fontSizeVariants,
    /**
     * Joins adjacent control edges in a single row or column with no gap.
     * Active controls own their shared edges; later active controls win ties.
     * Inner corners are square only when the group padding resolves to zero.
     */
    $joined: "",
    /**
     * Arranges controls in a row, column, wrapping row, or equal-width row.
     * `none` omits layout styles.
     */
    $layout: {
      none: "",
      wrap: "flex flex-wrap",
      stretch:
        "flex w-full [&>.control]:basis-0 [&>.control]:min-w-0 [&>.control]:grow",
      horizontal: "flex",
      vertical: "vertical flex flex-col [&>.control]:justify-start",
    },
    /** Sets the gap between controls. `auto` uses the group padding. */
    $gap: {
      none: "",
      auto: "[--group-gap:var(--ak-frame-padding,0px)] gap-(--group-gap)",
      xs: "[--group-gap:--spacing(0.5)] gap-(--group-gap)",
      sm: "[--group-gap:--spacing(1)] gap-(--group-gap)",
      md: "[--group-gap:--spacing(2)] gap-(--group-gap)",
      lg: "[--group-gap:--spacing(3)] gap-(--group-gap)",
      xl: "[--group-gap:--spacing(4)] gap-(--group-gap)",
    },
  },
  defaultVariants: {
    $size: "auto",
    $rounded: "xl",
    $layout: "horizontal",
    $p: 1,
    $gap: "auto",
    $joined(defaultValue, variants) {
      return (
        defaultValue ??
        (variants.$layout === "horizontal" || variants.$layout === "stretch")
      );
    },
  },
  refine({ variants, addClass }) {
    if (!variants.$joined) return;
    if (
      variants.$layout !== "horizontal" &&
      variants.$layout !== "stretch" &&
      variants.$layout !== "vertical"
    ) {
      return;
    }
    if (variants.$gap !== "none" && variants.$gap !== "auto") return;
    // Resolve zero padding in any CSS unit. Wrapped rows have no adjacency
    // contract.
    if (variants.$gap === "none") {
      addClass("ak-frame-join");
    } else {
      addClass("ak-frame-join ak-frame-join-auto");
    }
    addClass(variants.$layout === "vertical" ? "ak-frame-col" : "ak-frame-row");
    // Ignore separators and hidden controls when finding the first and last
    // controls.
    addClass([
      "[&>.control:nth-child(1_of_.control:not([hidden]))]:ak-frame-start",
      "[&>.control:nth-last-child(1_of_.control:not([hidden]))]:ak-frame-end",
    ]);
  },
});
