import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";

// Line heights the $leading names map to, matching the Tailwind tokens.
const LEADING_VALUES = {
  normal: 1.5,
  relaxed: 1.625,
};

export const list = cv({
  class: [
    "grid gap-(--list-gap) leading-(--list-leading) [counter-reset:list]",
    // State flags read by descendants (and nested lists) through container
    // style queries.
    "[--list:1] [--list-blocks:0]",
    // Knob defaults as classes so the variants can override them with
    // inline styles and mode variants can re-derive them below.
    "[--list-gap-base:--spacing(4)]",
    "[--list-leading:calc(1em*1.625)]",
    "[--list-item-padding:--spacing(1)]",
    // Border segments stay collapsed until blocks mode enables them for
    // ordered lists.
    "[--list-border-width:0px] [--list-border-number:0]",
    // Geometry shared by items, markers, checks, and list disclosures.
    "[--list-gap:calc(var(--list-gap-base)*0.5-var(--list-item-padding))]",
    "[--list-item-ps:calc(var(--list-leading)+--spacing(1.5))]",
    "[--list-marker-center:calc(var(--list-leading)*0.5)]",
    // Inside prose the base gap follows the prose rhythm, like legacy
    // ak-prose setting ak-list-gap on descendant lists.
    "ui-prose:[--list-gap-base:var(--prose-gap)]",
    // Lists inside prose also re-derive the prose ink so they stay readable
    // inside layered children, like the paragraph rule in prose.ts.
    "ui-prose:ak-dark:ak-ink-75 ui-prose:ak-light:ak-ink-90",
    // Nested lists tighten their base gap. Unlike legacy, an explicit $gap
    // wins over this because it lands in the inline style. This rule also
    // beats the prose rhythm above by stylesheet order (ui-list registers
    // after ui-prose), so nested lists stay compact inside prose, like
    // legacy.
    "ui-list:[--list-gap-base:--spacing(2)]",
    // Blocks mode (block children or an ancestor list flag): looser gap,
    // roomier items.
    "ui-list-blocks:[--list-blocks:1]",
    "ui-list-blocks:[--list-item-padding:--spacing(2)]",
    "ui-list-blocks:[--list-gap:calc(var(--list-gap-base)*0.75-var(--list-item-padding))]",
    // Sections mode (heading children): full gap between items. Wins over
    // the blocks gap because its variant registers later.
    "ui-list-sections:[--list-gap:calc(var(--list-gap-base)*1-var(--list-item-padding))]",
  ],
  variants: {
    /**
     * Whether the list is ordered. Ordered lists number their items and, in
     * blocks mode, connect them with border segments. The explicit false
     * value keeps nested lists from inheriting an ancestor's flags.
     */
    $ordered: {
      true: [
        "[--list-ol:1] [--list-ul:0]",
        "ui-list-blocks:[--list-border-width:1px]",
        "ui-list-blocks:[--list-border-number:1]",
      ],
      false: "[--list-ol:0] [--list-ul:1]",
    },
    /**
     * Sets the base gap between items before the mode formulas apply.
     * Numbers scale the spacing token.
     */
    $gap(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--list-gap-base": getSpacingValue(value) },
      };
    },
    /**
     * Sets the line height the item geometry derives from. Accepts the
     * `normal` and `relaxed` token names, numbers scaling the spacing token
     * like the Tailwind leading scale, or any length.
     */
    $leading(value?: keyof typeof LEADING_VALUES | (string & {}) | number) {
      if (value == null) return;
      const multiplier =
        typeof value === "string" && Object.hasOwn(LEADING_VALUES, value)
          ? LEADING_VALUES[value as keyof typeof LEADING_VALUES]
          : null;
      const leading =
        multiplier == null
          ? getSpacingValue(value)
          : `calc(1em * ${multiplier})`;
      return {
        style: { "--list-leading": leading },
      };
    },
    /**
     * Sets the item frame padding. Numbers scale the spacing token.
     */
    $itemPadding(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--list-item-padding": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $ordered: false,
  },
});

// The unordered marker is a short border line drawn by the ::before pseudo.
const ulMarker = [
  "ui-list-ul:before:content-['']",
  "ui-list-ul:before:absolute ui-list-ul:before:border-b",
  "ui-list-ul:before:ak-layer ui-list-ul:before:ak-edge-40",
  "ui-list-ul:before:w-[calc(var(--list-leading)*0.5)]",
  "ui-list-ul:before:top-[calc(var(--list-leading)*0.5+var(--ak-frame-padding))]",
  "ui-list-ul:before:start-[calc(var(--list-leading)*0.25+var(--ak-frame-padding))]",
];

// The ordered marker is a counter bubble drawn by the ::before pseudo. The
// bubble size tracks the line height minus its margin on both sides.
const olMarker = [
  "[--list-counter-size:calc(var(--list-leading)-0.2em*2)]",
  "ui-list-ol:[counter-increment:list]",
  "ui-list-ol:before:content-[counter(list)]",
  "ui-list-ol:before:absolute ui-list-ol:before:pointer-events-none",
  "ui-list-ol:before:top-(--ak-frame-padding)",
  "ui-list-ol:before:start-(--ak-frame-padding)",
  "ui-list-ol:before:m-[0.2em]",
  "ui-list-ol:before:ak-layer ui-list-ol:before:ak-layer-12",
  "ui-list-ol:before:rounded-full ui-list-ol:before:text-center",
  "ui-list-ol:before:font-semibold",
  "ui-list-ol:before:size-(--list-counter-size)",
  "ui-list-ol:before:leading-(--list-counter-size)",
  "ui-list-ol:before:[font-size-adjust:0.45]",
];

// In blocks mode, ordered items connect to the next with a vertical border
// segment drawn by the ::after pseudo. Its width is 0 outside blocks mode,
// so the pseudo stays invisible without extra gating.
const olBorderSegment = [
  "[--list-border-gap:--spacing(1)]",
  "[--list-border-top:calc(var(--list-leading)+var(--list-border-gap)+var(--ak-frame-padding))]",
  "ui-list-ol:after:content-[''] ui-list-ol:after:absolute",
  "ui-list-ol:after:pointer-events-none ui-list-ol:after:z-2",
  "ui-list-ol:after:ak-layer ui-list-ol:after:ak-layer-12",
  "ui-list-ol:after:w-(--list-border-width)",
  "ui-list-ol:after:top-(--list-border-top)",
  "ui-list-ol:after:start-[calc(var(--list-marker-center)-var(--list-border-width)/2+var(--ak-frame-padding))]",
  "ui-list-ol:after:h-[calc(100%+max(0px,var(--list-gap))+max(var(--list-gap),var(--ak-frame-padding))-var(--list-border-gap)-var(--list-border-top))]",
  // The final segment fades out and stops at the item's own height. Both
  // channels cover the item being the li or living inside one, and the
  // stacked variants sort after the single-variant rules above.
  "ui-list-ol:[li:last-of-type>&]:after:bg-transparent",
  "ui-list-ol:[li:last-of-type>&]:after:bg-linear-to-b",
  "ui-list-ol:[li:last-of-type>&]:after:from-(--ak-layer)",
  "ui-list-ol:[li:last-of-type>&]:after:from-[calc(100%-1rem)]",
  "ui-list-ol:[li:last-of-type>&]:after:to-transparent",
  "ui-list-ol:[li:last-of-type>&]:after:h-[calc(100%-var(--list-border-top))]",
  "ui-list-ol:[&:is(li):last-of-type]:after:bg-transparent",
  "ui-list-ol:[&:is(li):last-of-type]:after:bg-linear-to-b",
  "ui-list-ol:[&:is(li):last-of-type]:after:from-(--ak-layer)",
  "ui-list-ol:[&:is(li):last-of-type]:after:from-[calc(100%-1rem)]",
  "ui-list-ol:[&:is(li):last-of-type]:after:to-transparent",
  "ui-list-ol:[&:is(li):last-of-type]:after:h-[calc(100%-var(--list-border-top))]",
];

// Markers shared by plain items and disclosure buttons.
const listMarker = cv({
  class: [...ulMarker, ...olMarker],
  variants: {
    /**
     * Reserved for hosts that render a check marker: it replaces the
     * unordered dash marker (ordered hosts keep their number under the
     * check ring).
     */
    $check: "ui-list-ul:before:hidden ui-list-ul:after:hidden",
  },
});

export const listItem = cv({
  extend: [frame, listMarker],
  class: [
    "relative leading-(--list-leading)",
    // Indent the text past the marker column; the longhand wins over the
    // frame padding shorthand by stylesheet order.
    "[--list-item-base-ps:calc(var(--ak-frame-padding)+var(--list-item-ps))]",
    "ps-(--list-item-base-ps)",
    ...olBorderSegment,
    // Items with block children space them like the list gap.
    "[--list-item-gap:calc(var(--list-gap)+var(--list-item-padding)*0.5)]",
    "ui-list-item-blocks:grid ui-list-item-blocks:gap-(--list-item-gap)",
  ],
  defaultVariants: {
    // Legacy items are unpainted regions of the surrounding surface.
    $layer: false,
    // Legacy ak-frame-card/(--ak-list-item-padding): card radius with the
    // list-provided padding.
    $rounded: "xl",
    $p: "var(--list-item-padding)",
  },
});

export const listItemCheck = cv({
  class: [
    "absolute pointer-events-none rounded-full",
    "top-(--ak-frame-padding) start-(--ak-frame-padding) m-[0.2em]",
    "[--list-counter-size:calc(var(--list-leading)-0.2em*2)]",
    "size-(--list-counter-size)",
    "grid place-items-center [&>svg]:size-[60%]",
    // The circular progress fill child reads these; ordered checks draw a
    // thin ring around the number, unordered ones a thick donut.
    "ui-list-ol:[--progress-thickness:0.15em]",
    "ui-list-ul:[--progress-thickness:calc(30%+0.25%*var(--contrast,0))]",
  ],
  variants: {
    /**
     * Whether the check is marked as done. Unchecked unordered checks read
     * as empty ring slots; unchecked ordered checks stay transparent so the
     * numbered marker shows through.
     */
    $checked: {
      true: "ak-layer ak-layer-brand ak-layer-contrast ak-layer-contrast-50",
      false: [
        "ui-list-ul:ak-layer ui-list-ul:ak-layer-6 ui-list-ul:ak-edge-25",
        "ui-list-ul:ring ui-list-ul:ring-inset",
      ],
    },
    /**
     * Sets the progress between `0` and `1` shown by the circular fill
     * child.
     */
    $progress(value?: number | string) {
      if (value == null) return;
      return {
        style: { "--progress-value": `${value}` },
      };
    },
  },
  defaultVariants: {
    $checked: false,
  },
});

export const listDisclosure = cv({
  extend: [frame],
  class: [
    "relative leading-(--list-leading)",
    "[--list-item-base-ps:calc(var(--ak-frame-padding)+var(--list-item-ps))]",
    // The content only indents when border segments connect the items.
    "[--disclosure-ps:calc(var(--ak-frame-padding)+var(--list-item-ps)*min(1,var(--list-border-number)))]",
    // The segment lives on the root, not the button, so it spans the open
    // content and the last-of-type fade can match the li's direct child.
    ...olBorderSegment,
  ],
  defaultVariants: {
    // The disclosure root brings its own layer; the frame padding is
    // captured for the button while the painted padding stays 0.
    $layer: false,
    $rounded: "xl",
    $p: "var(--list-item-padding)",
  },
});

export const listDisclosureButton = cv({
  extend: [listMarker],
  class: [
    "leading-(--list-leading)",
    // The button indents past the marker column like a plain item.
    "[--disclosure-ps:var(--list-item-base-ps)]",
  ],
});

export const listDisclosureContentBody = cv({
  class: [
    "grid gap-(--list-item-gap)",
    "[--list-item-gap:calc(var(--list-gap)+var(--list-item-padding)*0.5)]",
    // The ui-list prefix makes this padding win over the disclosure body's
    // own padding-block-start by stylesheet order.
    "ui-list:[padding-block-start:calc(var(--list-item-gap)-var(--ak-frame-padding))]",
  ],
});
