import { cv, cx } from "clava";
import { includes } from "../utils/includes.ts";
import type { FrameRoundedValue } from "./frame.ts";
import { frame, getFrameRoundedClass } from "./frame.ts";
import { isLayerColor, layer } from "./layer.ts";
import { padding } from "./padding.ts";
import { text } from "./text.ts";

// A control and a control group set their font size the same way, and every
// other measurement in this file derives from it through 1cap, 1em and 1lh. The
// padding itself, --px and --py, comes from the padding recipe.
const fontSizeVariants = {
  /**
   * Sets the element’s font size. This affects the entire element, including
   * the gap, padding, and icon size. Use `auto` to inherit the parent’s font
   * size.
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

export const control = cv({
  extend: [padding, text],
  class: [
    "control ak-frame-join-item group/control relative flex justify-center",
    "ui-hover:ak-frame-join-active ui-selected:ak-frame-join-active ui-focus-visible:ak-frame-join-active",
    // The blank space a font builds into a glyph's advance width. Gaps and slot
    // margins subtract it so a slot sits optically, not geometrically, beside
    // the text.
    "[--sidebearing:0.15em]",
    // A stacked card sets --control-inline on its parts, and custom properties
    // inherit. Every control resets it on its own parts, so the slots of a badge
    // or button inside a tile keep the in-row margins that
    // var(--control-inline,1) falls back to. The control itself keeps the value
    // it inherits, so a tile spaces it like any other part.
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
    /**
     * Sets the element’s disabled state.
     */
    $disabled: [
      "disabled ak-disabled cursor-not-allowed!",
      // The border wipe reads an overridable channel: card-like extenders set
      // --disabled-border to keep a faint edge, while buttons fall back to
      // transparent.
      "border-(--disabled-border,transparent)! ring-(--disabled-border,transparent)!",
      "inset-shadow-none! shadow-none!",
      "bg-none! ak-ink-0! *:ak-ink-0!",
    ],
  },
  defaultVariants: {
    $size: "auto",
    $rounded: "md",
    $gap: "md",
    $gapY: "auto",
    $p: 2,
  },
  refine({ variants, setVariants }) {
    if (!variants.$disabled) return;
    setVariants({ $invert: false });
  },
});

// A single-row badge or avatar needs room around its content. Spanning more
// rows already provides that room, so those slots keep their requested size.
const PADDED_SLOT_SIZES = ["xs", "sm", "md", "lg"] as const;

export const controlSlot = cv({
  extend: [frame],
  class: [
    "control-slot flex flex-none items-center justify-center",
    // The margins seat the slot on the first line of text and pull it toward
    // the edge. A stacked card sets --control-inline to 0, which drops both,
    // so a slot on a row of its own lines up with the label under it.
    "[--my:calc((1lh-var(--size,1lh))/2*var(--row-span)*var(--control-inline,1))]",
    "[--mx:calc(((var(--py)-var(--px))+var(--my))*var(--control-inline,1))]",
    "min-w-(--size) h-[calc(var(--size)*var(--row-span))]",
    // An extender that draws its own mark sets --slot-icon-size. Otherwise,
    // the icon fills the slot, scaled down by --slot-icon-scale when the slot
    // paints a surface of its own (see refine).
    "[&>svg]:block [&>svg]:size-(--slot-icon-size,calc(var(--size)*var(--slot-icon-scale,1)))",
    "mx-(--mx) my-(--my)",
  ],
  variants: {
    /**
     * Sets the slot size.
     */
    $size: {
      unset: "",
      xs: "[--size:1ex]",
      sm: "[--size:1cap]",
      md: "[--size:1em]",
      lg: "[--size:0.875lh]",
      xl: "[--size:1lh]",
      "2xl": "[--size:calc(1lh+var(--py)/var(--row-span))]",
      full: "[--size:calc(1lh+var(--py)*2/var(--row-span))]",
    },
    /**
     * Controls the slot's horizontal margin. By default, it's set based on the
     * slot size. The larger the slot, the larger the margin. Set to `closeGap`
     * to move the slot closer to the control's text.
     *
     * The margin goes on the sibling element beside the slot, so the text must
     * be wrapped in a label element such as `ButtonLabel`. A sibling selector
     * cannot see a bare text node, and the margin would land on the next
     * element instead, which may be another slot.
     *
     * A stacked card sets `--control-inline` to 0, which drops these margins
     * along with the slot's own.
     */
    $mx: {
      unset: "",
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
    /**
     * Sets the slot padding.
     */
    $p: {
      unset: "",
      xs: "px-[calc(var(--size)*0.05)]",
      sm: "px-[calc(var(--size)*0.1)]",
      md: "px-[calc(var(--size)*0.15)]",
      lg: "px-[calc(var(--size)*0.15)]",
      xl: "px-[calc(var(--size)*0.2)]",
      "2xl": "px-[calc(var(--size)*0.25)]",
      full: "px-[calc(var(--size)*0.25)]",
    },
    /**
     * Sets the element’s border radius. Takes a named step from `none` to
     * `4xl`, `full`, any length or expression such as `var(--my-radius)`, or
     * `auto` for a radius concentric with the parent frame. A nested frame
     * adjusts a named step to stay concentric with its parent unless
     * `$forceRounded` is used.
     */
    $rounded(value?: FrameRoundedValue | "auto" | (string & {})) {
      if (value === "auto") return "ak-frame-m-(--my)";
      // The frame radius shrinks to stay concentric with the parent, which a
      // pill must not do. The later-sorted utility restores the full radius.
      if (value === "full") return "ak-frame-full rounded-full";
      return getFrameRoundedClass(value);
    },
    /**
     * Sets the element’s kind. When you use the `badge` kind, wrap text in a
     * `<span>` element so it’s styled correctly.
     */
    $kind: {
      icon: "",
      // A key chord reads the same way in every locale, so the bidi algorithm
      // must not reorder its keys in a right-to-left row.
      shortcut: "[direction:ltr]",
      avatar: "overflow-clip",
      badge: "*:text-[0.8125em]",
    },
    /**
     * Sets the slot to be a square.
     */
    $square: "aspect-square",
    /**
     * Renders the slot as a floating element on the top corner at the end of
     * the row.
     */
    $floating: [
      "m-0! absolute top-0 inset-e-0 -translate-y-1/2 border",
      // Half of the slot hangs past the corner. A translate is physical, so
      // it turns around with the corner.
      "translate-x-[calc(var(--size)/2)] rtl:-translate-x-[calc(var(--size)/2)]",
      "in-[.control]:[--bg-parent:var(--ak-layer-parent)] border-(--bg-parent)",
    ],
    /**
     * Increases the element’s size by a specified number of rows. This is
     * useful when a control spans multiple rows of content, such as a
     * description, and you want the slot to expand to match the content. Leave
     * it as `1` if you want the slot to match the first row’s size and align
     * with it.
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
      // Replace only layer's own default. A more specific value, from an
      // extender or a color, was asked for deliberately.
      if (defaultValue !== true) return defaultValue;
      if (variants.$kind === "badge") return "brand";
      // A badge, an avatar and a floating slot are surfaces of their own and
      // paint the layer they open. Any other slot opens one only to give its
      // icon a color context, and paints it when a layer variant moves the
      // color. Otherwise the control's own surface shows through: a see-through
      // control, or one standing aside for a glider.
      if (variants.$kind === "avatar") return true;
      if (variants.$floating) return true;
      return "transparent";
    },
    $lightnessOffset(defaultValue, variants) {
      if (variants.$kind !== "avatar") return defaultValue;
      return defaultValue ?? true;
    },
    $rounded(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$floating) return "full";
      if (variants.$kind === "avatar") return "full";
      // A badge is a pill, as the standalone badge is. A radius concentric with
      // the control's corner collapses to zero at the default padding.
      if (variants.$kind === "badge") return "full";
      return "auto";
    },
    $p(defaultValue, variants) {
      // Only badges get the default horizontal padding: the $p values pad the x
      // axis for text content, while avatar children (images) must fill the
      // whole slot, or the round clip turns them into straight-sided slabs.
      if (variants.$kind === "badge") return defaultValue ?? variants.$size;
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
      // The edge copies the layer color, not the layer, so a hue set on the
      // layer has to reach the edge on its own. An edge color passed by the
      // caller keeps its own hue. The computed $edge above may still be unset
      // here, so only a present, different value counts as the caller's.
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
      // A painted icon slot is a tile, so its icon sits inside it instead of
      // filling it. A slot that spans rows is already taller than its icon.
      addClass("[--slot-icon-scale:0.6]");
    }
    const paintsSurface =
      variants.$kind === "badge" || variants.$kind === "avatar";
    if (!paintsSurface) return;
    addClass([
      // Mix the fill into its parent before ink is calculated, so disabled
      // text keeps the contrast chosen for the resulting surface.
      "group-[.disabled]/control:ak-layer-mix-20",
      // Native and ARIA states can change without rerendering the recipe.
      "group-ui-disabled/control:ak-layer-mix-20",
      // A choice card reads disabled state from the input inside its label.
      "group-ui-disabled-within/choice:ak-layer-mix-20",
      // Slots can sit below a content wrapper, beyond the control's direct
      // child ink rules.
      "group-[.disabled]/control:ak-ink-0",
      "group-ui-disabled/control:ak-ink-0",
      "group-ui-disabled-within/choice:ak-ink-0",
      // Images cover the layer. Fade only their pixels into it; fading the
      // whole slot would also reduce its text's adaptive contrast.
      "group-[.disabled]/control:[&_img]:opacity-50",
      "group-ui-disabled/control:[&_img]:opacity-50",
      "group-ui-disabled-within/choice:[&_img]:opacity-50",
    ]);
    if (variants.$rowSpan !== 1) return;
    if (variants.$kind === "avatar") {
      // Larger slots have room for the label's text size.
      if (variants.$size === "2xl") return;
      if (variants.$size === "full") return;
      // Keep the parent's line height before adjusting font metrics, which also
      // affect normal line height. A 0.45em cap height gives initials room.
      addClass("leading-[1lh] [font-size-adjust:cap-height_0.45]");
    }
    if (includes(PADDED_SLOT_SIZES, variants.$size)) {
      setVariants({ $size: "xl" });
    }
  },
});

export const controlContent = cv({
  class: [
    // A marker the control around it can read: a stacked choice card lays
    // the content out on a row of its own (see choice.ts).
    "control-content group/control-content",
    "flex-1 min-w-0 content-start text-start gap-x-(--gap) gap-y-(--gap-y)",
  ],
  variants: {
    $orientation: {
      unset: "",
      horizontal: "flex flex-wrap",
      vertical: "flex flex-col",
    },
  },
  defaultVariants: {
    $orientation: "vertical",
  },
});

export const controlLabel = cv({
  extend: [text],
  class:
    "group-[.flex-col]/control-content:flex-none group-[.disabled]/control:ak-ink-0",
  variants: {
    $truncate: "truncate",
  },
});

export const controlDescription = cv({
  extend: [text],
  class: [
    // A marker the control around it can read: a pressed control that holds
    // one presses less deep (see active.ts).
    "control-description",
    // A description placed right after a slot picks up the side-bearing
    // margin the slot's $mx puts on its next sibling. On a full-width row of
    // its own that margin reads as a stray indent.
    "ms-0!",
    // A description on a wrapping row of its own, such as in a choice card,
    // takes the whole row. Inside horizontal content, it sits beside the label
    // and wraps to the next line only when the row runs out of room.
    "ak-ink-70 basis-full group-[.flex-wrap]/control-content:basis-auto",
    "font-normal text-[0.875em]",
    "group-[.disabled]/control:ak-ink-0",
  ],
  variants: {
    $truncate: "truncate",
    $lineClamp(value?: number | false) {
      if (!value) return;
      return {
        style: { "--line-clamp": `${value}` },
        class: "line-clamp-(--line-clamp)",
      };
    },
  },
});

// A thicker rule reads as a heavier divider, so its alpha falls as --width
// grows. A chevron is two strokes meeting at a corner, which reads lighter, so
// it starts higher and falls faster. Both stay positive only across the widths
// $width offers.
const separatorEdge = cx(
  "ak-edge-alpha-[calc((24-var(--width)*6)/100)]",
  "[.chevron]:ak-edge-alpha-[calc((64-var(--width)*12)/100)]",
);

export const controlSeparator = cv({
  extend: [layer],
  class: [
    "[.vertical>&]:hidden",
    // The layer only gives the edge color a surface to resolve against. The
    // rule drawn by the border is the only thing the separator paints.
    "bg-transparent flex items-center justify-center pointer-events-none",
    "transition-[border-color] duration-200 ease-out",
    "[--border-width:calc(var(--width)*1px)]",
    "h-(--size) border-e-(length:--border-width) -mx-[calc((var(--ak-frame-padding,0px)+var(--border-width))/2)]",
  ],
  variants: {
    $kind: {
      pipe: "rounded-full",
      slash: "rounded-full -skew-15",
      chevron: [
        "chevron rounded-se-xs [--border-width:calc(var(--width)*2px)]! border-t-(length:--border-width)",
        // The corner the two borders meet at turns around in a right-to-left
        // row, so the rotation and the optical nudge turn around with it.
        "aspect-square scale-50 rotate-45 rtl:-rotate-45",
        "-translate-x-1/10 rtl:translate-x-1/10",
      ],
    },
    $size: {
      xs: ["[--size:1cap] self-center", separatorEdge],
      sm: ["[--size:1em] self-center", separatorEdge],
      md: ["[--size:1lh] self-center", separatorEdge],
      // A stretched rule runs the whole row, where the plain edge alpha already
      // reads clearly enough.
      lg: "self-stretch",
      full: "self-stretch -my-(--ak-frame-padding,0px) mx-0",
    },
    $shy: [
      "in-[.control-group:hover:not(:has(:hover))]:delay-150",
      "ui-adjacent-hover:border-transparent",
      "ui-adjacent-selected:border-transparent",
      "ui-adjacent-focus-visible:border-transparent",
    ],
    $width: {
      1: "[--width:1]",
      2: "[--width:2]",
      3: "[--width:3]",
    },
  },
  defaultVariants: {
    // Pin the layer to the surface around it rather than leaving it unset: the
    // edge color reads the same surface the separator sits on.
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
    $layout: {
      none: "",
      wrap: "flex flex-wrap",
      stretch:
        "flex w-full [&>.control]:basis-0 [&>.control]:min-w-0 [&>.control]:grow",
      horizontal: "flex",
      vertical: "vertical flex flex-col [&>.control]:justify-start",
    },
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
    // Auto gaps follow resolved padding, so all equivalent CSS zero lengths
    // activate the same geometry. Wrapped rows have no DOM adjacency contract.
    if (variants.$gap === "none") {
      addClass("ak-frame-join");
    } else {
      addClass("ak-frame-join ak-frame-join-auto");
    }
    addClass(variants.$layout === "vertical" ? "ak-frame-col" : "ak-frame-row");
    // The recipe knows which siblings are controls, so decorations such as a
    // glider do not decide the generic frame utility's boundary positions.
    addClass([
      "[&>.control:nth-child(1_of_.control:not([hidden]))]:ak-frame-start",
      "[&>.control:nth-last-child(1_of_.control:not([hidden]))]:ak-frame-end",
    ]);
  },
});
