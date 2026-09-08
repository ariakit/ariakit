import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { edge } from "./edge.ts";
import { layer } from "./layer.ts";
import { padding } from "./padding.ts";

// Surface lightness on the $lightnessOffset scale: the counter chip, and the
// empty check slot beside a bullet or a dash. Those two glyphs paint no
// surface, so they get no offset.
const COUNTER_LIGHTNESS = 2.5;
const SLOT_LIGHTNESS = 1;

export const list = cv({
  class: [
    "list grid gap-(--list-gap) [counter-reset:list]",
    "[--list-gap-base:var(--list-gap-root,--spacing(4))]",
    // Inside prose the rhythm comes from prose, but an explicit $gap still
    // wins because it lands in the style attribute. This ties the line above
    // on specificity and beats it on order; the nested rule below outranks
    // both, so a nested list keeps halving.
    "in-[.prose]:[--list-gap-base:var(--list-gap-root,var(--prose-gap))]",
    "[--list-item-padding:--spacing(1)]",
    "[--list-gap:calc(var(--list-gap-base)*0.5-var(--list-item-padding))]",
    "[--list-item-gap:calc(var(--list-gap)+var(--list-item-padding)*0.5)]",
    // A list inside a list halves the gap it would otherwise use, so $gap set
    // once on the outermost list still tightens as lists nest. This selector
    // beats the rule above on specificity, not on stylesheet order.
    "[:is(&_&)]:[--list-gap-base:calc(var(--list-gap-root,--spacing(4))*0.5)]",
    // Descendants and nested lists read these flags through container style
    // queries. Custom properties inherit, so each list declares the off
    // values to clear the flags of the list around it.
    "[--list-blocks:0] [--list-last-row:0]",
    // Marks the row that closes this list, where the guide fades out.
    "[&>li:last-of-type]:[--list-last-row:1]",
    // How far the guide keeps from a marker. The guide runs from marker to
    // marker under them, and each marker hides it under a halo this wide.
    "[--list-guide-gap:--spacing(1)]",
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
    /**
     * Whether the list is ordered. The component renders the element; here it
     * only picks the default marker, so an ordered list counts its rows.
     */
    $ordered: {
      true: "",
      false: "",
    },
    /**
     * Sets the marker every row draws: a numbered chip (`counter`), a disc
     * (`bullet`) or a short line (`dash`). Left unset, an ordered list counts
     * its rows and an unordered one dashes them, or bullets them when it asks
     * for a guide. The markers read the kind through container style queries,
     * and the counter flag also decides whether a guide draws on its own.
     */
    $marker: {
      counter: "[--list-marker:counter] [--list-counter:1] [--list-glyph:0]",
      bullet: "[--list-marker:bullet] [--list-counter:0] [--list-glyph:1]",
      dash: "[--list-marker:dash] [--list-counter:0] [--list-glyph:1]",
    },
    /**
     * Whether a guide joins the markers, running from each one to the next.
     * `auto` draws it under counters in blocks mode, where numbered rows read
     * as steps. The guide segments and the disclosure indent both read this
     * flag.
     */
    $guide: {
      auto: "[--list-guide:calc(var(--list-counter)*var(--list-blocks))]",
      true: "[--list-guide:1]",
      false: "[--list-guide:0]",
    },
    /**
     * Sets the base gap between items before the mode formulas apply. A nested
     * list halves it. Numbers scale the spacing token.
     */
    $gap(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-gap-root": getSpacingValue(value) },
      };
    },
    /**
     * Sets the item frame padding. Numbers scale the spacing token.
     */
    $itemPadding(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--list-item-padding": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $ordered: false,
    $guide: "auto",
    // Always resolved, so a nested list resets the flags of the list around it:
    // custom properties inherit.
    $marker(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$ordered) return "counter";
      // A guide through dashes crosses them; through bullets it reads as a
      // track between stops.
      if (variants.$guide === true) return "bullet";
      return "dash";
    },
  },
});

// The marker and the guide are absolute, so a row must stay their positioning
// context. A row pads like a control (see padding.ts), so its text sits where a
// control's would.
const listRow = cv({
  extend: [padding],
  class: [
    "relative",
    // A row freezes the line height it inherits into a length, so every
    // child keeps it. Without this a heading child scales the ratio by its
    // own font size, and its first line stops lining up with the marker.
    "leading-[1lh]",
    // The row's own border, for the guide to cross. The frame channel does
    // not inherit, so the row copies it into one that does.
    "[--list-row-border:var(--ak-frame-border)]",
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
    // The marker column is one line box at the frame padding, where a control
    // puts its icon slot, and the text starts one control inset past it: the
    // frame padding plus the optical side padding (see --px in padding.ts).
    // The longhand wins over the padding shorthand by stylesheet order.
    "ps-[calc(var(--px)+1lh)]",
    // ui-list-item-blocks matches an item that contains a block element.
    "ui-list-item-blocks:grid ui-list-item-blocks:gap-(--list-item-gap)",
  ],
});

export const listItemContent = cv({
  // The marker must precede the row's own children. After them, Firefox and
  // Safari read a nested list's counter instead of this list's. The marker then
  // holds :first-child, so the row's first real child fires the not-first
  // margin in heading.ts. This wrapper gives :first-child back, and display:
  // contents generates no box, so the children lay out as they would in the row
  // itself.
  //
  // Keep this a span. The block-mode variants match :has(:where(p, div,
  // details, h1, h2, h3, h4)), so a div would put every list and every item
  // into blocks mode.
  class: "contents",
});

export const listItemMarker = cv({
  extend: [edge],
  class: [
    // The marker overlays the gutter that the start padding reserves, so the
    // marker stays out of the row's own flow.
    "list-marker absolute pointer-events-none grid place-items-center",
    // The check is drawn at the weight the checkbox draws its own mark (see
    // choice.ts): a lighter stroke reads thin inside the filled disc.
    "[&>svg]:size-[60%] [&>svg]:stroke-3",
    // The guide runs under the markers from centre to centre. Each marker
    // sits over it and wears a halo in the surface colour, so the guide stops
    // a gap short of any marker shape: chip, disc, dash or check slot.
    "z-3 outline-(--ak-layer-parent) outline-(length:--list-guide-gap,0px)",
    // A disc inset inside a square the size of one line, which holds the
    // number, the check icon and the progress arc. The bullet and dash rules
    // below reshape the disc through these same longhand properties and win
    // by stylesheet order.
    "[--list-marker-inset:0.2em]",
    "[--list-marker-size:calc(1lh-var(--list-marker-inset)*2)]",
    "top-(--ak-frame-padding) inset-s-(--ak-frame-padding) m-(--list-marker-inset)",
    "w-(--list-marker-size) h-(--list-marker-size) rounded-full",
    "ui-list-counter:[counter-increment:list]",
    "ui-list-counter:before:content-[counter(list)]",
    "ui-list-counter:before:absolute ui-list-counter:before:inset-0",
    "ui-list-counter:before:text-center ui-list-counter:before:font-semibold",
    "ui-list-counter:before:leading-(--list-marker-size)",
    "ui-list-counter:before:[font-size-adjust:0.45]",
    "ui-list-counter:[--progress-thickness:0.15em]",
    "ui-list-bullet:[--progress-thickness:calc(30%+0.25%*var(--contrast,0))]",
    "ui-list-dash:[--progress-thickness:calc(30%+0.25%*var(--contrast,0))]",
  ],
  variants: {
    /**
     * The marker's check state. `"none"` is a plain bullet, dash or number with
     * no check at all, `false` an empty slot, `true` a completed one. Defaults
     * to `"none"`, or to a value derived from `$progress` when that is set.
     */
    $checked: {
      none: [
        // A dash is a short line drawn with the marker's bottom border, so
        // these rules flatten the disc box instead of filling it.
        "ui-list-dash:top-[calc(0.5lh+var(--ak-frame-padding))]",
        "ui-list-dash:inset-s-[calc(0.25lh+var(--ak-frame-padding))]",
        "ui-list-dash:w-[0.5lh] ui-list-dash:h-auto",
        "ui-list-dash:m-0 ui-list-dash:rounded-none ui-list-dash:border-b",
        // A bullet is a small disc painted in the edge colour the dash draws
        // with, centred where the chip centres. Painted, not bordered: a
        // border is rounded to whole pixels, and one half the disc wide
        // leaves a hole. The size is a whole pixel at 16px, one up from
        // Tailwind Typography's, so the disc holds its own beside the chip.
        "[--list-bullet-size:0.4375em]",
        "ui-list-bullet:top-[calc(0.5lh-var(--list-bullet-size)/2+var(--ak-frame-padding))]",
        "ui-list-bullet:inset-s-[calc(0.5lh-var(--list-bullet-size)/2+var(--ak-frame-padding))]",
        "ui-list-bullet:w-(--list-bullet-size) ui-list-bullet:h-(--list-bullet-size)",
        "ui-list-bullet:m-0 ui-list-bullet:bg-(--ak-edge)",
      ],
      true: "before:hidden",
      // An empty slot is a ring, except in a counter list, where the number
      // fills the chip.
      false: "ring ring-inset ui-list-counter:ring-0",
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
    // $progress alone puts the marker in a check slot, and a full arc completes
    // it.
    $checked(_defaultValue, variants) {
      if (variants.$progress == null) return "none";
      return Number(variants.$progress) === 1;
    },
    $layer(defaultValue, variants) {
      if (variants.$checked !== true) return defaultValue;
      // Replace only layer's own default. A more specific value, from an
      // extender or a color, was asked for deliberately.
      if (defaultValue !== true) return defaultValue;
      return "brand";
    },
    $contrast(defaultValue, variants) {
      if (variants.$checked !== true) return defaultValue;
      return defaultValue ?? 50;
    },
    $lightnessOffset(defaultValue, variants) {
      // A completed marker paints the brand color straight, without the neutral
      // surface underneath it.
      if (variants.$checked === true) return defaultValue;
      // --list-counter and --list-glyph are 1/0 flags on the list root. No
      // variant can gate this value, because $lightnessOffset writes to the
      // style attribute, so the calc picks the surface per marker kind. Both
      // flags fall back to 0, so a marker outside a list stays on the plain
      // layer.
      return (
        defaultValue ??
        (variants.$checked === false
          ? `calc(var(--list-counter, 0) * ${COUNTER_LIGHTNESS} + var(--list-glyph, 0) * ${SLOT_LIGHTNESS})`
          : `calc(var(--list-counter, 0) * ${COUNTER_LIGHTNESS})`)
      );
    },
    $edgeWeight(defaultValue, variants) {
      if (variants.$checked === true) return defaultValue;
      return defaultValue ?? (variants.$checked === false ? 25 : "bold");
    },
  },
});

export const listItemGuide = cv({
  extend: [layer],
  class: [
    // Under the markers, over the row's surface and over a disclosure's open
    // content, which opens a stacking context of its own.
    "list-guide absolute pointer-events-none z-2",
    // --list-guide is 1 only where the list draws guides, so the segment has
    // no width anywhere else.
    "[--list-guide-width:calc(var(--list-guide,0)*1px)]",
    "w-(--list-guide-width)",
    // From the centre of this row's marker to the centre of the next row's:
    // down the row, across its bottom border, the list gap and the next
    // row's top border. The next row's frame padding and half line box
    // cancel this row's, so nothing about the marker's shape enters here;
    // the markers hide the segment under their halos. A tight list computes
    // a negative gap, which the grid lays out as none.
    "top-[calc(var(--ak-frame-padding)+0.5lh)]",
    "inset-s-[calc(var(--ak-frame-padding)+0.5lh-var(--list-guide-width)/2)]",
    "h-[calc(100%+max(0px,var(--list-gap))+var(--list-row-border,0px)*2)]",
    // The final segment fades out and stops at its own row's height.
    "ui-list-last-row:bg-transparent ui-list-last-row:bg-linear-to-b",
    "ui-list-last-row:from-(--ak-layer)",
    "ui-list-last-row:from-[calc(100%-1rem)]",
    "ui-list-last-row:to-transparent",
    "ui-list-last-row:h-[calc(100%-var(--ak-frame-padding)-0.5lh)]",
  ],
  defaultVariants: {
    // The segment paints the counter chip's surface, so a step list reads as
    // chips on one line of the same material.
    $lightnessOffset: COUNTER_LIGHTNESS,
  },
});

export const listDisclosure = cv({
  extend: [listRow],
  // The style attribute, so these win over the disclosure root's own resets.
  style: {
    // The content indents only where a guide joins the rows, and then to the
    // text of the button: one control inset and one line box in, like a plain
    // row's. The root pads nothing itself (see disclosure.ts), but it still
    // publishes the padding channels the formula reads.
    "--disclosure-ps":
      "calc(var(--py) + (var(--px) - var(--py) + 1lh) * var(--list-guide))",
    // A row indents by its marker gutter, never by an icon in its button.
    "--disclosure-icon": "0",
  },
});

export const listDisclosureButton = cv({
  // The button is a control with its own padding channels, and its label starts
  // where a plain row's text does.
  class: "[--disclosure-ps:calc(var(--px)+1lh)]",
});

export const listDisclosureContentBody = cv({
  class: [
    "grid gap-(--list-item-gap)",
    "in-[.list]:pbs-[calc(var(--list-item-gap)-var(--ak-frame-padding))]",
  ],
});
