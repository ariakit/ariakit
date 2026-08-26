import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";
import { layer } from "./layer.ts";

// Surface lightness for the marker, on the $lightnessOffset scale. A plain
// unordered bullet paints no surface, so it gets no offset.
const ORDERED_MARKER_LIGHTNESS = 2.5;
const UNORDERED_CHECK_LIGHTNESS = 1;

// Line heights for the $leading names, from the Tailwind leading scale.
const LEADING_VALUES = {
  normal: 1.5,
  relaxed: 1.625,
};

export const list = cv({
  class: [
    "grid gap-(--list-gap) leading-(--list-leading) [counter-reset:list]",
    // Descendants and nested lists read these flags through container style
    // queries. Custom properties inherit, so each list declares the off
    // values to clear the flags of the list around it.
    "[--list:1] [--list-blocks:0] [--list-last-row:0]",
    // Marks the row that closes this list, where the connector fades out.
    "[&>li:last-of-type]:[--list-last-row:1]",
    // These two defaults must be classes, not $gap/$itemPadding defaults. The
    // mode variants below re-derive them in CSS, which cannot override an
    // inline style.
    "[--list-gap-base:--spacing(4)]",
    "[--list-item-padding:--spacing(1)]",
    // Connectors join rows only in an ordered list in blocks mode. The
    // connector segment and the disclosure indent both read this flag.
    "[--list-connector:calc(var(--list-ol,0)*var(--list-blocks,0))]",
    // --list-gap spaces the rows. --list-item-gap spaces block children
    // inside a row and inside a disclosure body.
    "[--list-gap:calc(var(--list-gap-base)*0.5-var(--list-item-padding))]",
    "[--list-item-gap:calc(var(--list-gap)+var(--list-item-padding)*0.5)]",
    "ui-prose:[--list-gap-base:var(--prose-gap)]",
    // Lists inside prose re-derive the prose ink, so the text stays readable
    // inside layered children. prose.ts repeats the same pair for paragraphs.
    "ui-prose:ak-dark:ak-ink-75 ui-prose:ak-light:ak-ink-90",
    // Nested lists tighten the base gap. This rule beats the prose rhythm
    // above because ui-list registers after ui-prose. An explicit $gap still
    // wins, because $gap writes an inline style.
    "ui-list:[--list-gap-base:--spacing(2)]",
    // ui-list-blocks matches a list that contains a block element, or a list
    // inside an ancestor list in blocks mode.
    "ui-list-blocks:[--list-blocks:1]",
    "ui-list-blocks:[--list-item-padding:--spacing(2)]",
    "ui-list-blocks:[--list-gap:calc(var(--list-gap-base)*0.75-var(--list-item-padding))]",
    // ui-list-sections matches a list that contains a heading. This gap wins
    // over the blocks gap because ui-list-sections registers later.
    "ui-list-sections:[--list-gap:calc(var(--list-gap-base)*1-var(--list-item-padding))]",
  ],
  variants: {
    // The false branch is the only reset of --list-ol and --list-ul, so a
    // nested list stops inheriting the kind of the list around it.
    /**
     * Whether the list is ordered. Ordered lists number their items and, in
     * blocks mode, connect them with connector segments.
     */
    $ordered: {
      true: "[--list-ol:1] [--list-ul:0]",
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
    $leading: "relaxed",
  },
});

// The marker and the connector are absolute, so a row must stay their
// positioning context.
const listRow = cv({
  extend: [frame],
  class: [
    "relative leading-(--list-leading)",
    // The marker column is one line wide, plus a gap before the text.
    "[--list-item-ps:calc(var(--list-leading)+(--spacing(1.5)))]",
    "[--list-item-base-ps:calc(var(--ak-frame-padding)+var(--list-item-ps))]",
  ],
  defaultVariants: {
    // Rows are unpainted regions of the surface around them.
    $layer: false,
    $rounded: "xl",
    $p: "var(--list-item-padding)",
  },
});

export const listItem = cv({
  extend: [listRow],
  class: [
    // Indents the text past the marker column. The longhand wins over the
    // frame padding shorthand by stylesheet order.
    "ps-(--list-item-base-ps)",
    // ui-list-item-blocks matches an item that contains a block element.
    "ui-list-item-blocks:grid ui-list-item-blocks:gap-(--list-item-gap)",
  ],
});

export const listItemContent = cv({
  // The marker must precede the row's own children. After them, Firefox and
  // Safari read a nested list's counter instead of this list's. The marker
  // then holds :first-child, so the row's first real child fires the not-first
  // margin in heading.ts. This wrapper gives :first-child back, and
  // display: contents generates no box, so the children lay out as they would
  // in the row itself.
  //
  // Keep this a span. The block-mode variants match
  // :has(:where(p, div, details, h1, h2, h3, h4)), so a div would put every
  // list and every item into blocks mode.
  class: "contents",
});

export const listItemMarker = cv({
  extend: [frame],
  class: [
    // The marker overlays the gutter that the start padding reserves, so the
    // marker stays out of the row's own flow.
    "absolute pointer-events-none grid place-items-center [&>svg]:size-[60%]",
    // A disc inset inside a square the size of one line, which holds the
    // number, the check icon and the progress arc. The bullet variant below
    // reshapes the disc through these same longhand properties and wins by
    // stylesheet order.
    "[--list-marker-inset:0.2em]",
    "[--list-marker-size:calc(var(--list-leading)-var(--list-marker-inset)*2)]",
    "top-(--ak-frame-padding) inset-s-(--ak-frame-padding) m-(--list-marker-inset)",
    "w-(--list-marker-size) h-(--list-marker-size) rounded-full",
    // The marker owns the counter because the marker shows it:
    // counter-increment applies before the element's own ::before reads it.
    "ui-list-ol:[counter-increment:list]",
    "ui-list-ol:before:content-[counter(list)]",
    // The number covers the whole disc, so the number stays centered under
    // the progress arc.
    "ui-list-ol:before:absolute ui-list-ol:before:inset-0",
    "ui-list-ol:before:text-center ui-list-ol:before:font-semibold",
    "ui-list-ol:before:leading-(--list-marker-size)",
    "ui-list-ol:before:[font-size-adjust:0.45]",
    // The circular progress fill child reads this. Ordered markers draw a
    // thin ring around the number, unordered ones a thick donut.
    "ui-list-ol:[--progress-thickness:0.15em]",
    "ui-list-ul:[--progress-thickness:calc(30%+0.25%*var(--contrast,0))]",
  ],
  variants: {
    /**
     * Whether the marker is a check slot rather than a plain bullet. It
     * defaults to whether `$checked` or `$progress` is set, so hosts that
     * render a check only need to pass the check state.
     */
    $check: {
      false: [
        // An unordered bullet is a short line drawn with the marker's bottom
        // border, so these rules flatten the disc box instead of filling it.
        "ui-list-ul:top-[calc(var(--list-leading)*0.5+var(--ak-frame-padding))]",
        "ui-list-ul:inset-s-[calc(var(--list-leading)*0.25+var(--ak-frame-padding))]",
        "ui-list-ul:w-[calc(var(--list-leading)*0.5)] ui-list-ul:h-auto",
        "ui-list-ul:m-0 ui-list-ul:rounded-none ui-list-ul:border-b",
      ],
    },
    /**
     * Whether the check is marked as done. Unchecked unordered markers read
     * as empty ring slots; unchecked ordered ones keep the numbered chip so
     * the number shows under the progress arc.
     */
    $checked: {
      true: "before:hidden",
      false: "ui-list-ul:ring ui-list-ul:ring-inset",
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
    // The marker paints its own disc, so it must not open a frame context
    // that would rewrite the padding it positions itself against.
    $frame: false,
    // A plain bullet has no check state. Without this, the false branch would
    // give every marker the implicit boolean default and paint empty ring
    // slots on plain bullets.
    $checked: undefined,
    $check(defaultValue, variants) {
      if (variants.$checked != null) return true;
      if (variants.$progress != null) return true;
      return defaultValue;
    },
    $layer(defaultValue, variants) {
      if (!variants.$checked) return defaultValue;
      // Replace only layer's own default. A more specific value, from an
      // extender or a color, was asked for deliberately.
      if (defaultValue !== true) return defaultValue;
      return "brand";
    },
    $contrast(defaultValue, variants) {
      if (!variants.$checked) return defaultValue;
      return defaultValue ?? 50;
    },
    $lightnessOffset(defaultValue, variants) {
      // A completed marker paints the brand color straight, without the
      // neutral surface underneath it.
      if (variants.$checked) return defaultValue;
      // --list-ol and --list-ul are 1/0 flags on the list root. No variant
      // can gate this value, because $lightnessOffset writes an inline style,
      // so the calc picks the surface per list kind. Both flags fall back to
      // 0, so a marker outside a list stays on the plain layer.
      return (
        defaultValue ??
        (variants.$check
          ? `calc(var(--list-ol, 0) * ${ORDERED_MARKER_LIGHTNESS} + var(--list-ul, 0) * ${UNORDERED_CHECK_LIGHTNESS})`
          : `calc(var(--list-ol, 0) * ${ORDERED_MARKER_LIGHTNESS})`)
      );
    },
    $borderWeight(defaultValue, variants) {
      if (variants.$checked) return defaultValue;
      return defaultValue ?? (variants.$check ? 25 : "bold");
    },
  },
});

export const listItemConnector = cv({
  extend: [layer],
  class: [
    // The segment runs from under the marker to the next row's marker, so it
    // overflows the row into the list gap.
    "absolute pointer-events-none z-2",
    "[--list-connector-gap:--spacing(1)]",
    // Where the marker's disc centers on the line. The segment aligns to it.
    "[--list-marker-center:calc(var(--list-leading)*0.5)]",
    // --list-connector is 1 only in an ordered blocks-mode list, so the
    // segment collapses to zero width everywhere else.
    "[--list-connector-width:calc(var(--list-connector,0)*1px)]",
    "[--list-connector-top:calc(var(--list-leading)+var(--list-connector-gap)+var(--ak-frame-padding))]",
    "w-(--list-connector-width)",
    "top-(--list-connector-top)",
    "inset-s-[calc(var(--list-marker-center)-var(--list-connector-width)/2+var(--ak-frame-padding))]",
    "h-[calc(100%+max(0px,var(--list-gap))+max(var(--list-gap),var(--ak-frame-padding))-var(--list-connector-gap)-var(--list-connector-top))]",
    // The final segment fades out and stops at its own row's height.
    "ui-list-last-row:bg-transparent ui-list-last-row:bg-linear-to-b",
    "ui-list-last-row:from-(--ak-layer)",
    "ui-list-last-row:from-[calc(100%-1rem)]",
    "ui-list-last-row:to-transparent",
    "ui-list-last-row:h-[calc(100%-var(--list-connector-top))]",
  ],
  defaultVariants: {
    // The segment paints the ordered marker surface, which is the only list
    // kind where the segment has any width.
    $lightnessOffset: ORDERED_MARKER_LIGHTNESS,
  },
});

export const listDisclosure = cv({
  extend: [listRow],
  class: [
    // The content indents only when connector segments join the rows.
    // --disclosure-ps replaces the content's padding-inline-start, so the
    // formula re-adds the frame padding.
    "[--disclosure-ps:calc(var(--ak-frame-padding)+var(--list-item-ps)*var(--list-connector))]",
  ],
});

export const listDisclosureButton = cv({
  class: [
    "leading-(--list-leading)",
    // The button indents past the marker column like a plain item.
    "[--disclosure-ps:var(--list-item-base-ps)]",
  ],
});

export const listDisclosureContentBody = cv({
  class: [
    "grid gap-(--list-item-gap)",
    // The ui-list prefix makes this win over the disclosure body's own
    // padding-block-start by stylesheet order.
    "ui-list:pbs-[calc(var(--list-item-gap)-var(--ak-frame-padding))]",
  ],
});
