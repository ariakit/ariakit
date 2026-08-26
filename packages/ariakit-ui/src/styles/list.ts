import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame } from "./frame.ts";
import { layer } from "./layer.ts";

// Line heights the $leading names map to, matching the Tailwind tokens.
const LEADING_VALUES = {
  normal: 1.5,
  relaxed: 1.625,
};

export const list = cv({
  class: [
    "grid gap-(--list-gap) leading-(--list-leading) [counter-reset:list]",
    // State flags read by descendants (and nested lists) through container
    // style queries. The off values are declared here so a nested list never
    // inherits the value of the list around it.
    "[--list:1] [--list-blocks:0] [--list-last-row:0]",
    // The row that closes this list, for the connector that fades out there.
    // Publishing it as a channel keeps the connector's own depth irrelevant.
    "[&>li:last-of-type]:[--list-last-row:1]",
    // These two knob defaults have to be classes, not $gap/$itemPadding
    // defaults: the mode variants below re-derive them in CSS, which they
    // could not do against an inline style. $leading needs no such rule, so
    // its default lives in defaultVariants instead.
    "[--list-gap-base:--spacing(4)]",
    "[--list-item-padding:--spacing(1)]",
    // Connector segments stay collapsed until blocks mode enables them for
    // ordered lists.
    "[--list-connector-width:0px] [--list-connector:0]",
    // Geometry shared by rows, markers, and connectors.
    "[--list-gap:calc(var(--list-gap-base)*0.5-var(--list-item-padding))]",
    "[--list-item-gap:calc(var(--list-gap)+var(--list-item-padding)*0.5)]",
    "[--list-item-ps:calc(var(--list-leading)+(--spacing(1.5)))]",
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
     * blocks mode, connect them with connector segments. The explicit false
     * value keeps nested lists from inheriting an ancestor's flags.
     */
    $ordered: {
      true: [
        "[--list-ol:1] [--list-ul:0]",
        // Marker surfaces, as lightness offsets the marker feeds to the
        // layer primitive. Ordered lists paint the same chip for the plain
        // number and for the check slot around it. The offsets stay literal
        // here rather than moving to a shared constant: Tailwind only
        // generates an arbitrary property it can find verbatim in the source,
        // so an interpolated class name emits no CSS at all.
        "[--list-marker-lightness:2.4] [--list-check-lightness:2.4]",
        "ui-list-blocks:[--list-connector-width:1px]",
        "ui-list-blocks:[--list-connector:1]",
      ],
      false: [
        "[--list-ol:0] [--list-ul:1]",
        // Unordered bullets are a bare line with no surface of their own,
        // so only the check slot paints one.
        "[--list-marker-lightness:0] [--list-check-lightness:1.2]",
      ],
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
    // Legacy leading-relaxed. No mode variant re-derives --list-leading, so
    // the default is a variant call rather than a class.
    $leading: "relaxed",
  },
});

// What every row of a list shares, whether it's a plain item or a list
// disclosure: the positioning context its marker and connector need, and the
// start padding that reserves the marker column.
const listRow = cv({
  extend: [frame],
  class: [
    "relative leading-(--list-leading)",
    "[--list-item-base-ps:calc(var(--ak-frame-padding)+var(--list-item-ps))]",
  ],
  defaultVariants: {
    // Legacy rows are unpainted regions of the surrounding surface.
    $layer: false,
    // Legacy ak-frame-card/(--ak-list-item-padding): card radius with the
    // list-provided padding.
    $rounded: "xl",
    $p: "var(--list-item-padding)",
  },
});

export const listItem = cv({
  extend: [listRow],
  class: [
    // Indent the text past the marker column; the longhand wins over the
    // frame padding shorthand by stylesheet order.
    "ps-(--list-item-base-ps)",
    // Items with block children space them like the list gap.
    "ui-list-item-blocks:grid ui-list-item-blocks:gap-(--list-item-gap)",
  ],
});

export const listItemContent = cv({
  // The marker has to precede the row's own children: after them, it reads a
  // nested list's counter instead of this list's in Firefox and Safari. That
  // costs the first child its :first-child, which fires the not-first margin
  // in heading.ts on every sectioned row, so the children get a wrapper that
  // gives it back. display: contents generates no box, so they still lay out
  // as they would in the row itself.
  //
  // Host it on an element the block-mode probes ignore. They match
  // :has(:where(p, div, details, h1, h2, h3, h4)), so a div wrapper would put
  // every list and every item into blocks mode.
  class: "contents",
});

export const listItemMarker = cv({
  extend: [frame],
  class: [
    // The marker overlays the gutter the item reserves through its start
    // padding, so it never joins the item's own flow.
    "absolute pointer-events-none grid place-items-center [&>svg]:size-[60%]",
    // A disc centered in a square the size of one line, which is where the
    // number, the check icon and the progress arc all live. The bullet below
    // reshapes it through these same properties, so its variant rules win by
    // stylesheet order instead of colliding with a shorthand.
    "[--list-marker-size:calc(var(--list-leading)-0.2em*2)]",
    "top-(--ak-frame-padding) start-(--ak-frame-padding) m-[0.2em]",
    "w-(--list-marker-size) h-(--list-marker-size) rounded-full",
    // The marker owns the list counter because it's the element that shows
    // it: an element's counter-increment applies before its own ::before
    // reads the value.
    "ui-list-ol:[counter-increment:list]",
    "ui-list-ol:before:content-[counter(list)]",
    // The number covers the whole disc so it stays centered no matter what
    // the check state stacks on top of it.
    "ui-list-ol:before:absolute ui-list-ol:before:inset-0",
    "ui-list-ol:before:text-center ui-list-ol:before:font-semibold",
    "ui-list-ol:before:leading-(--list-marker-size)",
    "ui-list-ol:before:[font-size-adjust:0.45]",
    // The circular progress fill child reads these: ordered markers draw a
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
        // Unordered bullets are a short line drawn with the marker's own
        // bottom border, so they flatten the disc box instead of filling
        // it.
        "ui-list-ul:top-[calc(var(--list-leading)*0.5+var(--ak-frame-padding))]",
        "ui-list-ul:start-[calc(var(--list-leading)*0.25+var(--ak-frame-padding))]",
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
    // Writes progressBase's own --progress-value channel, which the
    // progressCircularFill child reads. Declared here rather than through
    // extend: [progressBase], whose $value name says nothing on a marker,
    // where an ordered row already shows a number.
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
    // that would rewrite the item padding it positions itself against.
    $frame: false,
    // A plain bullet has no check state at all. Without this, the variant's
    // false branch would give every marker the implicit boolean default and
    // paint empty ring slots on plain bullets.
    $checked: undefined,
    $check(defaultValue, variants) {
      if (variants.$checked != null) return true;
      if (variants.$progress != null) return true;
      return defaultValue;
    },
    $layer(defaultValue, variants) {
      if (!variants.$checked) return defaultValue;
      // Only replace layer's own $layer: true default; anything more
      // specific, from an extender or a color, was asked for deliberately.
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
      // Legacy ak-layer-6 and ak-layer-12, published by the list so the
      // marker doesn't have to branch on the list kind in CSS. The
      // fallbacks keep a marker outside a list on the plain layer.
      return (
        defaultValue ??
        (variants.$check
          ? "var(--list-check-lightness, 0)"
          : "var(--list-marker-lightness, 0)")
      );
    },
    $borderWeight(defaultValue, variants) {
      if (variants.$checked) return defaultValue;
      // Legacy ak-edge-25 for the empty ring, ak-edge-40 for the bullet.
      return defaultValue ?? (variants.$check ? 25 : "bold");
    },
  },
});

export const listItemConnector = cv({
  extend: [layer],
  class: [
    // The segment runs from under the marker to the next row's marker, so
    // it overflows the item into the list gap.
    "absolute pointer-events-none z-2",
    "[--list-connector-gap:--spacing(1)]",
    "[--list-connector-top:calc(var(--list-leading)+var(--list-connector-gap)+var(--ak-frame-padding))]",
    "w-(--list-connector-width)",
    "top-(--list-connector-top)",
    "start-[calc(var(--list-marker-center)-var(--list-connector-width)/2+var(--ak-frame-padding))]",
    "h-[calc(100%+max(0px,var(--list-gap))+max(var(--list-gap),var(--ak-frame-padding))-var(--list-connector-gap)-var(--list-connector-top))]",
    // The final segment fades out and stops at its own row's height.
    "ui-list-last-row:bg-transparent ui-list-last-row:bg-linear-to-b",
    "ui-list-last-row:from-(--ak-layer)",
    "ui-list-last-row:from-[calc(100%-1rem)]",
    "ui-list-last-row:to-transparent",
    "ui-list-last-row:h-[calc(100%-var(--list-connector-top))]",
  ],
  defaultVariants: {
    // The segment grows out of the ordered chip, so it reads the same channel
    // the chip does rather than repeating its value, and falls back to the
    // plain layer outside a list exactly like the marker does.
    $lightnessOffset: "var(--list-marker-lightness, 0)",
  },
});

export const listDisclosure = cv({
  extend: [listRow],
  class: [
    // The content only indents when connector segments join the rows. The
    // disclosure root keeps the frame padding for the button while its own
    // painted padding stays 0.
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
    // The ui-list prefix makes this padding win over the disclosure body's
    // own padding-block-start by stylesheet order.
    "ui-list:[padding-block-start:calc(var(--list-item-gap)-var(--ak-frame-padding))]",
  ],
});
