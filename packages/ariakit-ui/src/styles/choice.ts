import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import {
  button,
  buttonContent,
  buttonDescription,
  buttonLabel,
  buttonSlot,
} from "./button.ts";
import {
  control,
  controlContent,
  controlDescription,
  controlLabel,
  controlSlot,
} from "./control.ts";
import { focusHighlight, focusWithin } from "./focus.ts";
import { hover } from "./hover.ts";

/**
 * The box every choice control draws: a native checkbox or radio input with its
 * own look removed, and the check inside a choice card. One class list serves
 * both, because the ui-choice-* variants read the checked, mixed and disabled
 * state from the element itself or from the label or aria-checked host around
 * it. It extends the control slot rather than frame, so the box takes the
 * slot's font-relative sizes, its first-line alignment inside a control row and
 * its floating placement. The surface defaults are the ones input.ts uses, so a
 * box reads as the same sunken material as a text field; keep the two sets in
 * step.
 */
export const choice = cv({
  extend: [controlSlot, hover],
  class: [
    "appearance-none",
    // The slot lays out block-level, which throws a bare input out of its
    // line of text. The later-sorted display utility puts it back on the
    // line, centered on the x-height; a row or a card blockifies it again.
    "inline-flex align-middle",
    // The mark is a pseudo-element painted in the current text color, so the
    // box's own ink colors it: the readable text of the brand fill, or the
    // dimmed ink of a disabled box. It scales in when the choice turns on.
    "after:bg-current after:scale-0 ui-choice-on:after:scale-100",
    "after:transition-transform after:duration-100 after:ease-out",
    "motion-reduce:after:transition-none",
    // Forced colors repaint every background in the system canvas, which
    // would wipe the mark; the pseudo-element opts out and keeps the forced
    // text color.
    "after:forced-color-adjust-none",
    // The drawn mark and a custom child share one size. A child replaces the
    // drawn mark and, like it, shows only while the choice is on.
    "[--slot-icon-size:calc(var(--size)*0.7)] [&>svg]:stroke-[2.5]",
    "has-[>*]:after:hidden not-ui-choice-on:*:hidden!",
    // An on box paints brand, moved away from the surface behind it so it
    // still separates from a brand layer, and paints its edge in the fill so
    // the box keeps one size. $lightnessOffset below lands in the style
    // attribute, which no class can gate, so the plugin's own zero offset
    // cancels the sink here.
    "not-ui-choice-disabled:ui-choice-on:ak-layer-brand",
    "not-ui-choice-disabled:ui-choice-on:ak-layer-contrast",
    "ui-choice-on:ak-layer-offset-0 ui-choice-on:ak-edge-raw",
    // A disabled box keeps its mark in the dimmed ink, on a neutral fill
    // when on, and keeps a readable edge, or a small empty box vanishes on
    // a light layer.
    "ui-choice-disabled:ui-choice-on:ak-layer-15",
    "ui-choice-disabled:ak-ink-0 ui-choice-disabled:ak-edge-20",
    "ui-choice-disabled:cursor-not-allowed",
  ],
  variants: {
    /**
     * The mark drawn inside the box while the choice is on. `check` draws a
     * check mark and, in the mixed state, a dash. `dot` draws a filled disc.
     * @default "check"
     */
    $mark: {
      check: [
        "after:size-(--slot-icon-size) after:mask-(--choice-mark-check)",
        "after:mask-contain after:mask-center after:mask-no-repeat",
        "ui-choice-mixed:after:mask-(--choice-mark-dash)",
      ],
      dot: "after:size-1/2 after:rounded-full",
    },
  },
  defaultVariants: {
    $mark: "check",
    $rounded: "sm",
    // The box is its own shape, not a corner of the card or row around it.
    $forceRounded: true,
    // The field geometry of input.ts: always a border, so the box is one size
    // on light and dark layers, at the input's edge weight, sunk one step into
    // the surface. An empty box has no other boundary, so the weight is the
    // lightest that keeps its edge at 3:1 against a light or a dark canvas.
    $border: true,
    $borderType: "border",
    $edgeWeight: 45,
    $lightnessOffset: -1,
    $hoverOffset: true,
    $layer(defaultValue) {
      // The slot opens a see-through layer for an icon. The box is a surface.
      // Only the slot's own default is replaced: a color asked for by an
      // extender or a caller stays.
      if (defaultValue === "transparent") return true;
      return defaultValue;
    },
  },
});

/**
 * The box on a native input. Adds what only an input needs: hovering the field
 * row around it lights it the way hovering the box does, the keyboard focus
 * ring, and the system's own drawing in forced-colors mode, where the checked
 * and mixed states come in the user's palette.
 */
export const choiceInput = cv({
  extend: [choice, focusHighlight],
  class: [
    "not-ui-choice-disabled:group-hover/choice-field:ak-state-(--hover-offset,0)",
    "forced-colors:appearance-auto forced-colors:after:hidden",
  ],
  defaultVariants: {
    $focus: true,
  },
});

/**
 * A label row around a native choice input: the box, then a label and an
 * optional description. It is a control row, not a button: it paints no surface
 * and draws no ring of its own, because the input inside it does both.
 */
export const choiceField = cv({
  extend: [control],
  class: [
    "group/choice-field",
    // A text row: the box and the label start at the edge.
    "justify-start select-none",
    // The input is the only part that is ever :disabled, so the row reads
    // its state from it as well as from the $disabled prop, which a radio
    // disabled through its group never receives. The description paints its
    // own ink, so the dimming has to reach every descendant.
    "ui-disabled-within:cursor-not-allowed",
    "ui-disabled-within:ak-ink-0 ui-disabled-within:**:ak-ink-0",
  ],
  defaultVariants: {
    // The row is structure on the surface around it, not a material of its own.
    // With no layer, the box inside resolves against that surface and the row
    // costs no color work.
    $layer: false,
  },
});

export const choiceFieldContent = controlContent;

export const choiceFieldLabel = controlLabel;

export const choiceFieldDescription = controlDescription;

/**
 * A card-shaped label around a choice input that stays out of sight. The card
 * tints toward brand while the input is checked or mixed, and the parts inside
 * it read the input's state through the ui-choice-* variants.
 */
export const choiceCard = cv({
  // Focus lands on the input inside the label, so the ring comes from the
  // -within trigger.
  extend: [button, focusWithin],
  class: [
    // A named group for compositions that lay the card's parts out from the
    // card's own classes; the package itself reads no state from it.
    "group/choice",
    // A wrapping row, so a description placed directly inside the card falls
    // to its own line instead of sitting beside the label.
    "flex-wrap justify-start content-start",
    "[&_input]:sr-only",
    // Only the input itself carries the checked and disabled state, never the
    // label around it, so the card's own states come from the -within
    // variants. A mixed card tints like a checked one.
    "not-ui-disabled-within:ui-checked-within:ak-edge-brand",
    "not-ui-disabled-within:ui-checked-within:ak-edge-raw",
    "not-ui-disabled-within:ui-checked-within:ak-layer-brand",
    "not-ui-disabled-within:ui-checked-within:ak-layer-mix-20",
    "not-ui-disabled-within:ui-mixed-within:ak-edge-brand",
    "not-ui-disabled-within:ui-mixed-within:ak-edge-raw",
    "not-ui-disabled-within:ui-mixed-within:ak-layer-brand",
    "not-ui-disabled-within:ui-mixed-within:ak-layer-mix-20",
    // $lighten below writes to the style attribute, which no class can
    // override, so the tinted layer drops the lift through the plugin's own
    // class.
    "not-ui-disabled-within:ui-checked-within:ak-layer-lighten-0",
    "not-ui-disabled-within:ui-mixed-within:ak-layer-lighten-0",
    // On a surface of the brand's own pigment, the tint matches the surface.
    // A one-step push barely moves the tint elsewhere, but on a mid-lightness
    // pigment it lands in the ambiguous midrange, which the push skips, so
    // the card still separates from the surface.
    "not-ui-disabled-within:ui-checked-within:ak-layer-push-1",
    "not-ui-disabled-within:ui-mixed-within:ak-layer-push-1",
    // A card disabled through its group never receives the $disabled prop, so
    // it reads the state from its input and draws what $disabled below draws.
    // The label itself is never disabled, so its hover and press, which only
    // skip a disabled element, are turned off here too.
    "ui-disabled-within:cursor-not-allowed",
    "ui-disabled-within:ak-ink-0 ui-disabled-within:**:ak-ink-0",
    "ui-disabled-within:ak-edge-5 ui-disabled-within:ak-layer-mix-20",
    "ui-disabled-within:ui-hover:ak-state-0",
    "ui-disabled-within:ui-active:scale-x-100",
    "ui-disabled-within:ui-active:scale-y-100",
  ],
  variants: {
    /**
     * Sets the card's flow. `vertical` makes the card a tile: the slot and the
     * check share the top row, one at each end, and the content fills the row
     * below, whatever its source order. The slot drops the margins that seat it
     * on a line of text, so it lines up with the label under it. The flag is
     * set on the card's parts, so a slot inside the content drops them too,
     * while a control inside the tile, such as a badge, resets it for its own
     * slots and keeps their margins. As on any frame, `vertical` also rounds
     * nested `$cover` frames for a column.
     */
    $orientation: {
      vertical: [
        // The card is itself a control, and every control resets the flag on
        // its own parts, so the tile's value must be important to reach them.
        "[&>*]:[--control-inline:0]!",
        // The card's justify-start and the control's justify-center are plain
        // utilities that sort after justify-between, so only the important
        // flag puts the check at the end of the row.
        "justify-between!",
        "[&>.control-content]:basis-full [&>.control-content]:order-1",
      ],
    },
    /**
     * Sets the vertical gap between the element's label and description.
     * @default "card"
     */
    $gapY: {
      // Wrapped rows sit closer together than siblings on one line. Defining
      // --gap-y here also reaches the content wrapper, whose gap-y-(--gap-y) is
      // inert without it.
      card: "[--gap-y:calc(var(--py)/2)] gap-y-(--gap-y)",
    },
    /**
     * Sets the element's disabled state. A disabled card keeps a faint edge,
     * because a bordered surface with no border at all reads as a rendering
     * glitch on light layers.
     */
    $disabled: [
      "[--disabled-border:var(--ak-edge)]",
      "ak-edge-5 ak-layer-mix-20",
    ],
  },
  defaultVariants: {
    $rounded: "xl",
    $p: 3,
    $gapY: "card",
    $border: true,
    $focusOffset: 2,
    // Cards are content surfaces: they lift unconditionally instead of taking
    // the adaptive offset, which darkens a card on a light layer.
    $lightnessOffset: false,
    $lighten: true,
    // The optical extra on the sides insets a line of text from a rounded edge.
    // A tile's edges hold a slot and a check instead, so it keeps the frame
    // padding on every side.
    $px(defaultValue, variants) {
      if (defaultValue == null) return;
      if (variants.$orientation === "vertical") return "sm";
      return defaultValue;
    },
  },
});

/**
 * The box drawn inside a card, at slot scale. It is the same box as the native
 * input, read through the card: the span is never checked or disabled itself,
 * so every state comes from the input in the label around it. A child replaces
 * the drawn mark.
 */
export const choiceCardCheck = cv({
  extend: [choice],
  variants: {
    /**
     * Renders the check as a stamp in the card's top-end corner. Adds to the
     * slot's own floating rules: the stamp shows only while the choice is on,
     * so an empty corner never reads as a missing part.
     */
    $floating: "not-ui-choice-on:invisible",
  },
  defaultVariants: {
    $size: "lg",
    // The card answers hover itself; a second shift on the check would read as
    // a nested control.
    $hoverOffset: false,
    // A stamp is a disc whichever box the card draws in its row.
    $rounded(defaultValue, variants) {
      if (variants.$floating) return "full";
      return defaultValue;
    },
  },
});

export const choiceCardSlot = buttonSlot;

export const choiceCardContent = buttonContent;

export const choiceCardLabel = cv({
  extend: [buttonLabel],
  class: "grow",
});

export const choiceCardDescription = buttonDescription;

export const choiceCardGrid = cv({
  class: [
    "grid auto-rows-fr gap-3",
    // As a grid or flex item, the grid has to get narrower than its cards'
    // text, or a long description pushes it past its parent's edge.
    "min-w-0",
    // min() keeps a card from forcing a column wider than its container.
    "grid-cols-[repeat(auto-fill,minmax(min(100%,var(--choice-card-min-w)),1fr))]",
  ],
  variants: {
    /**
     * Sets the narrowest a card may get before the grid drops a column. Numbers
     * scale the spacing token.
     * @default "10rem"
     */
    $minItemSize(value?: string | number) {
      if (value == null) return;
      return {
        style: { "--choice-card-min-w": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $minItemSize: "10rem",
  },
});
