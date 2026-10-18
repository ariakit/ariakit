import { cv, cx } from "clava";
import { includes } from "../utils/includes.ts";
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

/** A text-aligned slot for an icon, avatar, badge, or keyboard shortcut. */
export const controlSlot = cv({
  extend: [frame],
  class: [
    "control-slot flex flex-none items-center justify-center",
    // Align slots to the first text row. Stacked cards set --control-inline to
    // zero to remove these margins.
    "[--my:calc((1lh-var(--size,1lh))/2*var(--row-span)*var(--control-inline,1))]",
    "[--mx:calc(((var(--py)-var(--px))+var(--my))*var(--control-inline,1))]",
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
     * whitespace-nowrap` to preserve descenders.
     */
    $kind: {
      icon: "",
      shortcut: [
        // Keep key chords left-to-right while the slot retains the row
        // direction for margins.
        "*:flex *:[align-items:inherit] *:[gap:inherit] *:[direction:ltr]",
        "*:[&>svg]:block *:[&>svg]:size-(--slot-icon-size,calc(var(--size)*var(--slot-icon-scale,1)))",
      ],
      avatar: "overflow-clip",
      // Trim browser-dependent line metrics to center the badge's capitals.
      // https://github.com/ariakit/ariakit/issues/7588
      badge: "*:text-[0.8125em] *:[text-box:cap_alphabetic]",
    },
    /** Sets the slot to be a square. */
    $square: "aspect-square",
    /**
     * Pushes the slot to the end of a row wider than its content. Overrides the
     * start margin that a preceding slot can add. Navigation badges after
     * another element, such as a label, do this by default; `false` keeps them
     * beside it.
     */
    $end: "ms-auto!",
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
    $size: "md",
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
      return defaultValue ?? variants.$size;
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
  class:
    "group-[.flex-col]/control-content:flex-none group-[.disabled]/control:ak-ink-0",
  variants: {
    /** Truncates the label to one line with an ellipsis. */
    $truncate: "truncate",
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

/** A control group with shared spacing and optional joined edges. */
export const controlGroup = cv({
  extend: [frame],
  class: ["control-group"],
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
    // Ignore decorations such as gliders when finding the first and last
    // controls.
    addClass([
      "[&>.control:nth-child(1_of_.control:not([hidden]))]:ak-frame-start",
      "[&>.control:nth-last-child(1_of_.control:not([hidden]))]:ak-frame-end",
    ]);
  },
});
